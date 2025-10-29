import { IsString, MinLength } from 'class-validator';

export class ShipOrderDto {
  @IsString()
  @MinLength(5)
  trackingId!: string;
}
