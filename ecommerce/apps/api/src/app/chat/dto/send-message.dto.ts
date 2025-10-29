import { IsString, IsUUID, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  receiverId!: string;

  @IsUUID()
  productId!: string;

  @IsString()
  @MinLength(1)
  message!: string;
}
