import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductModel } from './models/product.model';
import { ProductService } from './product.service';
import { ProductFilterInput } from './dto/product-filter.input';
import { ProductConnection } from './models/product-connection.model';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';

@Resolver(() => ProductModel)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Query(() => ProductModel)
  product(@Args('id') id: string): Promise<ProductModel> {
    return this.productService.getProductById(id);
  }

  @Query(() => ProductConnection)
  async products(
    @Args('filter', { nullable: true }) filter: ProductFilterInput = {},
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset = 0,
    @Args('limit', { type: () => Int, defaultValue: 25 }) limit = 25,
  ): Promise<ProductConnection> {
    const pagination: PaginationDto = { offset, limit };
    const { items, total } = await this.productService.searchProducts(
      filter ?? {},
      pagination,
    );
    return { items, total };
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [ProductModel])
  myProducts(@CurrentUser() user: RequestUser): Promise<ProductModel[]> {
    return this.productService.findMyProducts(user.sub);
  }
}
