import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import ms from 'ms';
import { PrismaService, RedisService } from '@ecommerce/shared';
import type { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import {
  AuthResponseDto,
  AuthTokensDto,
  AuthUserDto,
  LoginDto,
  RegisterDto,
} from './dto';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import type { JwtRefreshValidationResult } from './strategies/jwt-refresh.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly accessTokenTtlSeconds: number;
  private readonly refreshTokenTtlSeconds: number;
  private readonly refreshTtlSeconds: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {
    const accessTokenTtlRaw = this.configService.get<string>(
      'auth.accessTokenTtl',
      '15m',
    );
    const refreshTokenTtlRaw = this.configService.get<string>(
      'auth.refreshTokenTtl',
      '7d',
    );

    this.accessTokenTtlSeconds = Math.max(
      1,
      Math.ceil(ms(accessTokenTtlRaw) / 1000),
    );
    this.refreshTokenTtlSeconds = Math.max(
      1,
      Math.ceil(ms(refreshTokenTtlRaw) / 1000),
    );
    this.refreshTtlSeconds = this.refreshTokenTtlSeconds;
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingByEmail = await this.usersService.findByEmail(dto.email);
    if (existingByEmail) {
      throw new ConflictException('Email already registered');
    }

    const existingByUsername = await this.usersService.findByUsername(
      dto.username,
    );
    if (existingByUsername) {
      throw new ConflictException('Username already taken');
    }

    const hashedPassword = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
      },
    });

    return this.buildAuthResponse(user);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthUserDto | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return null;
    }

    return this.toAuthUserDto(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await argon2.verify(user.password, dto.password);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async refreshTokens(
    payload: JwtRefreshValidationResult,
  ): Promise<AuthResponseDto> {
    const isValid = await this.verifyStoredRefreshToken(
      payload.sub,
      payload.tokenId,
      payload.refreshToken,
    );

    if (!isValid) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.revokeRefreshToken(payload.sub, payload.tokenId);

    return this.buildAuthResponse(user);
  }

  async logout(userId: string): Promise<void> {
    const pattern = `refresh:${userId}:*`;
    const stream = this.redisService.client.scanStream({
      match: pattern,
    });

    stream.on('data', (keys: string[]) => {
      if (keys.length) {
        void this.redisService.client.del(...keys);
      }
    });
  }

  async getProfile(userId: string): Promise<AuthUserDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.toAuthUserDto(user);
  }

  private async buildAuthResponse(user: User): Promise<AuthResponseDto> {
    const tokens = await this.generateTokens(user);
    return {
      user: this.toAuthUserDto(user),
      tokens,
    };
  }

  private toAuthUserDto(user: User): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    };
  }

  private async generateTokens(user: User): Promise<AuthTokensDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('auth.accessTokenSecret'),
      expiresIn: this.accessTokenTtlSeconds,
    });

    const tokenId = randomUUID();

    const refreshToken = await this.jwtService.signAsync(
      { ...payload, tokenId },
      {
        secret: this.configService.getOrThrow<string>(
          'auth.refreshTokenSecret',
        ),
        expiresIn: this.refreshTokenTtlSeconds,
      },
    );

    await this.storeRefreshToken(payload.sub, tokenId, refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenTtlSeconds,
    };
  }

  private getRefreshKey(userId: string, tokenId: string): string {
    return `refresh:${userId}:${tokenId}`;
  }

  private async storeRefreshToken(
    userId: string,
    tokenId: string,
    refreshToken: string,
  ): Promise<void> {
    const key = this.getRefreshKey(userId, tokenId);
    const hashed = await argon2.hash(refreshToken);
    await this.redisService.set(key, hashed, this.refreshTtlSeconds);
  }

  private async verifyStoredRefreshToken(
    userId: string,
    tokenId: string,
    providedToken: string,
  ): Promise<boolean> {
    const key = this.getRefreshKey(userId, tokenId);
    const stored = await this.redisService.get<string>(key);
    if (!stored) {
      return false;
    }
    return argon2.verify(stored, providedToken);
  }

  private async revokeRefreshToken(
    userId: string,
    tokenId: string,
  ): Promise<void> {
    const key = this.getRefreshKey(userId, tokenId);
    await this.redisService.del(key);
  }
}
