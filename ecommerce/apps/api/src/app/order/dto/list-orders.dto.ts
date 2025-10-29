import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { OrderRole } from '../models/order-role.enum';

export class ListOrdersDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderRole)
  as: OrderRole = OrderRole.SELLER;
}
