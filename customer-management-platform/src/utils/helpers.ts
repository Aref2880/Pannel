export const formatPersianDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatPersianNumber = (number: number): string => {
  return new Intl.NumberFormat('fa-IR').format(number);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR', {
    style: 'currency',
    currency: 'IRR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('IRR', 'ریال');
};

export const getDaysUntilExpiry = (endDate: string): number => {
  const today = new Date();
  const expiry = new Date(endDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getServiceDuration = (type: 'monthly' | 'quarterly' | 'yearly'): number => {
  switch (type) {
    case 'monthly':
      return 30;
    case 'quarterly':
      return 90;
    case 'yearly':
      return 365;
    default:
      return 30;
  }
};

export const calculateEndDate = (startDate: string, type: 'monthly' | 'quarterly' | 'yearly'): string => {
  const start = new Date(startDate);
  const duration = getServiceDuration(type);
  const end = new Date(start.getTime() + (duration * 24 * 60 * 60 * 1000));
  return end.toISOString().split('T')[0];
};

export const isServiceExpiringSoon = (endDate: string, daysThreshold: number = 7): boolean => {
  const daysUntil = getDaysUntilExpiry(endDate);
  return daysUntil <= daysThreshold && daysUntil >= 0;
};

export const isServiceExpired = (endDate: string): boolean => {
  return getDaysUntilExpiry(endDate) < 0;
};

export const getServiceStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'green';
    case 'expired':
      return 'red';
    case 'pending':
      return 'amber';
    case 'cancelled':
      return 'gray';
    default:
      return 'gray';
  }
};

export const getCustomerStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'green';
    case 'inactive':
      return 'amber';
    case 'suspended':
      return 'red';
    default:
      return 'gray';
  }
};

export const generateServiceName = (type: 'monthly' | 'quarterly' | 'yearly'): string => {
  const names = {
    monthly: 'سرویس ماهیانه',
    quarterly: 'سرویس سه‌ماهه',
    yearly: 'سرویس سالیانه'
  };
  return names[type];
};

export const getMonthName = (monthIndex: number): string => {
  const months = [
    'ژانویه', 'فوریه', 'مارس', 'آپریل', 'می', 'ژوئن',
    'ژوئیه', 'آگوست', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
  ];
  return months[monthIndex];
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^09\d{9}$/;
  return phoneRegex.test(phone);
};

export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d]/g, '');
};