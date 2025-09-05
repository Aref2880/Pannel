export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  registrationDate: string;
  totalSpent: number;
  status: 'active' | 'inactive' | 'suspended';
  services: Service[];
  notes?: string;
}

export interface Service {
  id: string;
  customerId: string;
  name: string;
  type: 'monthly' | 'quarterly' | 'yearly';
  price: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  autoRenewal: boolean;
  description?: string;
}

export interface Notification {
  id: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  type: 'renewal_reminder' | 'payment_due' | 'service_expired' | 'general';
  message: string;
  date: string;
  read: boolean;
  daysUntilExpiry?: number;
}

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  expiredServices: number;
  upcomingRenewals: number;
  pendingPayments: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  customers: number;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface ServiceFormData {
  name: string;
  type: 'monthly' | 'quarterly' | 'yearly';
  price: number;
  startDate: string;
  autoRenewal: boolean;
  description?: string;
}

export type FilterOptions = {
  status?: 'all' | 'active' | 'inactive' | 'suspended';
  searchTerm?: string;
  sortBy?: 'name' | 'registrationDate' | 'totalSpent';
  sortOrder?: 'asc' | 'desc';
}