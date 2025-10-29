import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTransactionalService {
  constructor(private readonly prisma: PrismaService) {}

  get client(): PrismaClient {
    return this.prisma;
  }

  async useTransaction<T>(
    cb: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction((tx) => cb(tx));
  }
}
