import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// Simulação de base de dados em memória para produtos
let products = [
  {
    id: '1',
    name: 'Produto A',
    description: 'Descrição do Produto A',
    price: 99.99,
    category: 'Eletrônicos',
    stock: 50,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Produto B',
    description: 'Descrição do Produto B',
    price: 149.99,
    category: 'Casa e Jardim',
    stock: 25,
    isActive: true,
    createdAt: new Date(),
  },
];

@Injectable()
export class ProductsService {
  async create(createProductDto: CreateProductDto) {
    const newProduct = {
      id: Date.now().toString(),
      name: createProductDto.name,
      description: createProductDto.description ?? '',
      price: createProductDto.price,
      category: createProductDto.category,
      stock: createProductDto.stock,
      isActive: true,
      createdAt: new Date(),
    };

    products.push(newProduct);
    return newProduct;
  }

  async findAll() {
    return {
      products: products.filter(p => p.isActive),
      summary: {
        total: products.filter(p => p.isActive).length,
        totalValue: products
          .filter(p => p.isActive)
          .reduce((sum, p) => sum + (p.price * p.stock), 0),
        categories: [...new Set(products.map(p => p.category))],
      },
    };
  }

  async findOne(id: string) {
    const product = products.find(p => p.id === id && p.isActive);
    if (!product) {
      throw new Error('Produto não encontrado');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new Error('Produto não encontrado');
    }

    products[productIndex] = {
      ...products[productIndex],
      ...updateProductDto,
    };

    return products[productIndex];
  }

  async remove(id: string) {
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new Error('Produto não encontrado');
    }

    products[productIndex].isActive = false;
    return { message: 'Produto removido com sucesso' };
  }

  async getCategories() {
    const categories = [...new Set(products.map(p => p.category))];
    return {
      categories: categories.map(category => ({
        name: category,
        productCount: products.filter(p => p.category === category && p.isActive).length,
      })),
    };
  }
}