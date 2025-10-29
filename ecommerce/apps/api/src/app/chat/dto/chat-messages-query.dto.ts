import { IsUUID } from 'class-validator';

export class ChatMessagesQueryDto {
  @IsUUID()
  productId!: string;

  @IsUUID()
  participantId!: string;
}
