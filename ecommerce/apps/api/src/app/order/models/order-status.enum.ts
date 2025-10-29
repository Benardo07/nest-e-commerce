import { OrderStatus } from '@prisma/client';
import { registerEnumType } from '@nestjs/graphql';

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});

export { OrderStatus };
