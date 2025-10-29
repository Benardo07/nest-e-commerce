import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class ProductFilterInput {
  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  sellerId?: string;

  @Field(() => Float, { nullable: true })
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  maxPrice?: number;
}
