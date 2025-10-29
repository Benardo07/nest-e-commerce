import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaTransactionalService } from './prisma.transactional.service';

@Global()
@Module({
  providers: [PrismaService, PrismaTransactionalService],
  exports: [PrismaService, PrismaTransactionalService],
})
export class PrismaModule {}
