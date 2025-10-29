import { Field, Int, ObjectType } from '@nestjs/graphql';
import { OrderModel } from './order.model';

@ObjectType()
export class OrderConnection {
  @Field(() => [OrderModel])
  items!: OrderModel[];

  @Field(() => Int)
  total!: number;
}
