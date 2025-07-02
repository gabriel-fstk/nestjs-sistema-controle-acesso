import { Injectable } from '@nestjs/common';

@Injectable()
export class FinancialService {
  async getDashboard() {
    // Simulação de dados financeiros
    return {
      totalRevenue: 125000.50,
      totalExpenses: 85000.25,
      profit: 39000.25,
      transactions: [
        {
          id: '1',
          description: 'Venda de Produto A',
          amount: 1500.00,
          type: 'REVENUE',
          date: new Date(),
        },
        {
          id: '2',
          description: 'Pagamento de Fornecedor',
          amount: -800.00,
          type: 'EXPENSE',
          date: new Date(),
        },
      ],
      monthlyData: [
        { month: 'Jan', revenue: 10000, expenses: 7000 },
        { month: 'Feb', revenue: 12000, expenses: 8000 },
        { month: 'Mar', revenue: 15000, expenses: 9000 },
      ],
    };
  }

  async getTransactions() {
    // Simulação de transações
    return {
      transactions: [
        {
          id: '1',
          description: 'Venda de Produto A',
          amount: 1500.00,
          type: 'REVENUE',
          category: 'Sales',
          date: new Date(),
        },
        {
          id: '2',
          description: 'Pagamento de Fornecedor X',
          amount: -800.00,
          type: 'EXPENSE',
          category: 'Supplies',
          date: new Date(),
        },
        {
          id: '3',
          description: 'Serviço de Consultoria',
          amount: 2500.00,
          type: 'REVENUE',
          category: 'Services',
          date: new Date(),
        },
      ],
      summary: {
        totalRevenue: 4000.00,
        totalExpenses: 800.00,
        netProfit: 3200.00,
      },
    };
  }
}