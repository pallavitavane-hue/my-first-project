
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

export const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investments', 'Business', 'Gift', 'Other'],
  expense: ['Food', 'Rent', 'Utilities', 'Transport', 'Entertainment', 'Health', 'Education', 'Shopping', 'Other']
};
