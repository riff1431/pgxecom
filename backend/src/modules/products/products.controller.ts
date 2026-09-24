import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('featured') featured?: boolean,
    @Query('hot') hot?: boolean,
  ) {
    return this.productsService.findAll({
      page,
      limit,
      category,
      search,
      sort,
      featured,
      hot,
    });
  }

  @Get('featured')
  findFeatured() {
    return this.productsService.findFeatured();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }
}

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.productsService.adminFindAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      categoryId,
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  create(@Body() body: CreateProductDto) {
    return this.productsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.productsService.update(id, body);
  }

  @Patch(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.productsService.toggleActive(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
