import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ProductModel } from './product.model';

@ObjectType()
export class ProductConnection {
  @Field(() => [ProductModel])
  items!: ProductModel[];

  @Field(() => Int)
  total!: number;
}
