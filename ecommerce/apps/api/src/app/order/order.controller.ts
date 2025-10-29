import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { ShipOrderDto } from './dto/ship-order.dto';
import { OrderService } from './order.service';
import { OrderModel } from './models/order.model';
import { ListOrdersDto } from './dto/list-orders.dto';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderModel> {
    return this.orderService.placeOrder(user.sub, dto);
  }

  @Post(':id/confirm')
  confirm(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<OrderModel> {
    return this.orderService.confirmOrder(id, user.sub);
  }

  @Post(':id/ship')
  ship(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: ShipOrderDto,
  ): Promise<OrderModel> {
    return this.orderService.shipOrder(id, user.sub, dto);
  }

  @Post(':id/complete')
  complete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<OrderModel> {
    return this.orderService.completeOrder(id, user.sub);
  }

  @Get()
  list(
    @CurrentUser() user: RequestUser,
    @Query() query: ListOrdersDto,
  ) {
    return this.orderService.listOrdersForUser(user.sub, query.as, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<OrderModel> {
    return this.orderService.getOrderById(id);
  }
}
