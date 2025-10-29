import { IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  productId!: string;
}
