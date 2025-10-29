import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { OrderStatus } from './order-status.enum';

@ObjectType()
export class OrderTimelineEntryModel {
  @Field()
  id!: string;

  @Field(() => OrderStatus)
  status!: OrderStatus;

  @Field(() => GraphQLJSONObject, { nullable: true })
  detail?: Record<string, unknown> | null;

  @Field()
  createdAt!: Date;
}
