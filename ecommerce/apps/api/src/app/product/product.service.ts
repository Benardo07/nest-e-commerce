import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService, RedisService } from '@ecommerce/shared';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterInput } from './dto/product-filter.input';
import { ProductModel } from './models/product.model';

@Injectable()
export class ProductService {
  private readonly cachePrefix = 'product';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async createProduct(
    sellerId: string,
    dto: CreateProductDto,
  ): Promise<ProductModel> {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: new Prisma.Decimal(dto.price),
        stock: dto.stock,
        sellerId,
      },
    });
    await this.invalidateCache(product.id);
    return this.toModel(product);
  }

  async updateProduct(
    id: string,
    sellerId: string,
    dto: UpdateProductDto,
  ): Promise<ProductModel> {
    await this.ensureOwnership(id, sellerId);
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        price:
          dto.price !== undefined
            ? new Prisma.Decimal(dto.price)
            : undefined,
      },
    });
    await this.invalidateCache(id);
    return this.toModel(product);
  }

  async deleteProduct(id: string, sellerId: string): Promise<void> {
    await this.ensureOwnership(id, sellerId);
    await this.prisma.product.delete({ where: { id } });
    await this.invalidateCache(id);
  }

  async getProductById(id: string): Promise<ProductModel> {
    const cacheKey = this.cacheKey(id);
    const cached = await this.redisService.get<ProductModel>(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const model = this.toModel(product);
    await this.redisService.set(cacheKey, model);
    return model;
  }

  async searchProducts(
    filter: ProductFilterInput,
    pagination: PaginationDto,
  ): Promise<{ items: ProductModel[]; total: number }> {
    const where: Prisma.ProductWhereInput = {
      isArchived: false,
    };

    if (filter.search) {
      where.AND = [
        {
          OR: [
            { name: { contains: filter.search, mode: 'insensitive' } },
            { description: { contains: filter.search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    if (filter.sellerId) {
      where.sellerId = filter.sellerId;
    }

    if (filter.minPrice || filter.maxPrice) {
      where.price = {};
      if (filter.minPrice !== undefined) {
        where.price.gte = new Prisma.Decimal(filter.minPrice);
      }
      if (filter.maxPrice !== undefined) {
        where.price.lte = new Prisma.Decimal(filter.maxPrice);
      }
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.offset,
        take: pagination.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toModel(item)),
      total,
    };
  }

  async findMyProducts(sellerId: string): Promise<ProductModel[]> {
    const products = await this.prisma.product.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
    });
    return products.map((product) => this.toModel(product));
  }

  private async ensureOwnership(id: string, sellerId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { sellerId: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('You cannot modify this product');
    }
  }

  private toModel(product: Product): ProductModel {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      sellerId: product.sellerId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private cacheKey(id: string): string {
    return `${this.cachePrefix}:${id}`;
  }

  private async invalidateCache(id: string): Promise<void> {
    await this.redisService.del(this.cacheKey(id));
  }
}
