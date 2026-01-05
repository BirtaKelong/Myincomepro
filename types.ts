
export type TransactionType = 'income' | 'expense';

export interface CategoryDefinition {
  id: string;
  user_id: string | null; // null for predefined
  name: string;
  type: TransactionType;
  color: string;
  isCustom: boolean;
}

export interface Budget {
  id: string;
  user_id: string;
  category_name: string;
  amount: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string; // Changed from enum to string
  description: string;
  date: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}

export interface FinancialStats {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  categoryBreakdown: Record<string, number>;
}
