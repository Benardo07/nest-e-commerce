import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderModel } from './models/order.model';
import { OrderConnection } from './models/order-connection.model';
import { OrderRole } from './models/order-role.enum';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@Resolver(() => OrderModel)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => OrderModel)
  order(@Args('id') id: string): Promise<OrderModel> {
    return this.orderService.getOrderById(id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => OrderConnection)
  myOrders(
    @CurrentUser() user: RequestUser,
    @Args('role', { type: () => OrderRole }) role: OrderRole,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset = 0,
    @Args('limit', { type: () => Int, defaultValue: 25 }) limit = 25,
  ): Promise<OrderConnection> {
    const pagination: PaginationDto = { offset, limit };
    return this.orderService.listOrdersForUser(user.sub, role, pagination);
  }
}
