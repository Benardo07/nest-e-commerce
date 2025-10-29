import { Field, ID, ObjectType } from '@nestjs/graphql';
import { OrderStatus } from './order-status.enum';
import { OrderTimelineEntryModel } from './order-timeline.model';

@ObjectType()
export class OrderModel {
  @Field(() => ID)
  id!: string;

  @Field()
  buyerId!: string;

  @Field()
  sellerId!: string;

  @Field()
  productId!: string;

  @Field(() => OrderStatus)
  status!: OrderStatus;

  @Field({ nullable: true })
  trackingId?: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => [OrderTimelineEntryModel])
  timeline!: OrderTimelineEntryModel[];
}
