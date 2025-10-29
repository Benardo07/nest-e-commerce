import { registerEnumType } from '@nestjs/graphql';

export enum OrderRole {
  BUYER = 'buyer',
  SELLER = 'seller',
}

registerEnumType(OrderRole, {
  name: 'OrderRole',
});
