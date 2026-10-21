export interface Wallet {
  _id?: string;
  provider: 'bKash' | 'Nagad' | 'Rocket' | 'Bank';
  identifier: string;
  balance: number;
}

export interface UserProfile {
  avatarUrl?: string;
  corporateId?: string;
  dob?: string;
  gender?: string;
  nid?: string;
  tin?: string;
  employer?: string;
  employerShort?: string;
  employerSubtitle?: string;
  corporateEmail?: string;
  employeeId?: string;
  workstation?: string;
  designation?: string;
  department?: string;
  officeAddress?: string;
  corporateDirectLine?: string;
  residentialAddress?: string;
  permanentAddressMatches?: boolean;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  salaryBank?: string;
  salaryAccount?: string;
  allowanceWallet?: string;
  completionPercent?: number;
}

export interface User {
  _id: string;
  name: string;
  phone: string;
  wallets?: Wallet[];
  profile?: UserProfile;
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
