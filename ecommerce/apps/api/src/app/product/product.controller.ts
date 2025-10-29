import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';
import { ProductModel } from './models/product.model';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateProductDto,
  ): Promise<ProductModel> {
    return this.productService.createProduct(user.sub, dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductModel> {
    return this.productService.updateProduct(id, user.sub, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<{ success: true }> {
    await this.productService.deleteProduct(id, user.sub);
    return { success: true };
  }
}
