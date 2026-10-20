export interface Wallet {
  _id?: string;
  provider: 'bKash' | 'Nagad' | 'Rocket' | 'Bank';
  identifier: string;
  balance: number;
}

export interface User {
  _id: string;
  name: string;
  phone: string;
  wallets?: Wallet[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface BalanceResponse {
  totalBalance: number;
  wallets: Wallet[];
}

export interface Transaction {
  _id: string;
  sender: string;
  recipientPhone: string;
  recipientName?: string;
  fromWalletProvider: string;
  toWalletProvider: string;
  amount: number;
  fee: number;
  total: number;
  status: 'Pending' | 'Completed' | 'Failed';
  createdAt: string;
  updatedAt: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: FieldError[];
}
