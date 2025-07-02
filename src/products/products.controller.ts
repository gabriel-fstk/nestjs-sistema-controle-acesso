import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RequirePermission } from '../shared/decorators/require-permission.decorator';
import { PermissionGuard } from '../permissions/guards/permission.guard';
import { ModuleType } from '../shared/constants/enums';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(PermissionGuard)
@RequirePermission(ModuleType.PRODUCTS)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo produto' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos' })
  async findAll() {
    return this.productsService.findAll();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorias de produtos' })
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar produto' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover produto' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}