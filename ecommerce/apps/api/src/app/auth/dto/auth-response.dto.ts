import { AuthTokensDto } from './auth-tokens.dto';
import { AuthUserDto } from './auth-user.dto';

export class AuthResponseDto {
  user!: AuthUserDto;
  tokens!: AuthTokensDto;
}
