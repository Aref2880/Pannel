import type { Customer, Service, Notification } from '../types';

const STORAGE_KEYS = {
  CUSTOMERS: 'customerManagement_customers',
  SERVICES: 'customerManagement_services',
  NOTIFICATIONS: 'customerManagement_notifications',
} as const;

export class LocalStorageService {
  // Generic storage methods
  private static setItem<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  // Customer methods
  static getCustomers(): Customer[] {
    return this.getItem(STORAGE_KEYS.CUSTOMERS, []);
  }

  static saveCustomers(customers: Customer[]): void {
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
  }

  static addCustomer(customer: Customer): void {
    const customers = this.getCustomers();
    customers.push(customer);
    this.saveCustomers(customers);
  }

  static updateCustomer(customerId: string, updatedCustomer: Partial<Customer>): void {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === customerId);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...updatedCustomer };
      this.saveCustomers(customers);
    }
  }

  static deleteCustomer(customerId: string): void {
    const customers = this.getCustomers().filter(c => c.id !== customerId);
    this.saveCustomers(customers);
    
    // Also delete related services
    const services = this.getServices().filter(s => s.customerId !== customerId);
    this.saveServices(services);
    
    // Also delete related notifications
    const notifications = this.getNotifications().filter(n => n.customerId !== customerId);
    this.saveNotifications(notifications);
  }

  // Service methods
  static getServices(): Service[] {
    return this.getItem(STORAGE_KEYS.SERVICES, []);
  }

  static saveServices(services: Service[]): void {
    this.setItem(STORAGE_KEYS.SERVICES, services);
  }

  static addService(service: Service): void {
    const services = this.getServices();
    services.push(service);
    this.saveServices(services);

    // Update customer's services array and total spent
    const customers = this.getCustomers();
    const customerIndex = customers.findIndex(c => c.id === service.customerId);
    if (customerIndex !== -1) {
      customers[customerIndex].services.push(service);
      customers[customerIndex].totalSpent += service.price;
      this.saveCustomers(customers);
    }
  }

  static updateService(serviceId: string, updatedService: Partial<Service>): void {
    const services = this.getServices();
    const index = services.findIndex(s => s.id === serviceId);
    if (index !== -1) {
      const oldService = services[index];
      services[index] = { ...oldService, ...updatedService };
      this.saveServices(services);

      // Update customer's services array
      const customers = this.getCustomers();
      const customerIndex = customers.findIndex(c => c.id === oldService.customerId);
      if (customerIndex !== -1) {
        const serviceIndex = customers[customerIndex].services.findIndex(s => s.id === serviceId);
        if (serviceIndex !== -1) {
          // Update total spent if price changed
          if (updatedService.price && updatedService.price !== oldService.price) {
            customers[customerIndex].totalSpent += (updatedService.price - oldService.price);
          }
          customers[customerIndex].services[serviceIndex] = services[index];
          this.saveCustomers(customers);
        }
      }
    }
  }

  static deleteService(serviceId: string): void {
    const services = this.getServices();
    const serviceToDelete = services.find(s => s.id === serviceId);
    if (serviceToDelete) {
      const updatedServices = services.filter(s => s.id !== serviceId);
      this.saveServices(updatedServices);

      // Update customer's services array and total spent
      const customers = this.getCustomers();
      const customerIndex = customers.findIndex(c => c.id === serviceToDelete.customerId);
      if (customerIndex !== -1) {
        customers[customerIndex].services = customers[customerIndex].services.filter(s => s.id !== serviceId);
        customers[customerIndex].totalSpent -= serviceToDelete.price;
        this.saveCustomers(customers);
      }
    }
  }

  // Notification methods
  static getNotifications(): Notification[] {
    return this.getItem(STORAGE_KEYS.NOTIFICATIONS, []);
  }

  static saveNotifications(notifications: Notification[]): void {
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  static addNotification(notification: Notification): void {
    const notifications = this.getNotifications();
    notifications.unshift(notification); // Add to beginning for chronological order
    this.saveNotifications(notifications);
  }

  static markNotificationAsRead(notificationId: string): void {
    const notifications = this.getNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifications[index].read = true;
      this.saveNotifications(notifications);
    }
  }

  static deleteNotification(notificationId: string): void {
    const notifications = this.getNotifications().filter(n => n.id !== notificationId);
    this.saveNotifications(notifications);
  }

  // Utility methods
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Initialize with sample data if empty
  static initializeSampleData(): void {
    const customers = this.getCustomers();
    if (customers.length === 0) {
      const sampleCustomers: Customer[] = [
        {
          id: this.generateId(),
          name: 'علی احمدی',
          email: 'ali.ahmadi@example.com',
          phone: '09123456789',
          address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
          registrationDate: '2023-01-15',
          totalSpent: 150000,
          status: 'active',
          services: [],
          notes: 'مشتری وفادار با سابقه خوب'
        },
        {
          id: this.generateId(),
          name: 'فاطمه کریمی',
          email: 'fateme.karimi@example.com',
          phone: '09187654321',
          address: 'اصفهان، خیابان چهارباغ، پلاک ۴۵۶',
          registrationDate: '2023-03-22',
          totalSpent: 220000,
          status: 'active',
          services: [],
          notes: ''
        },
        {
          id: this.generateId(),
          name: 'محمد رضایی',
          email: 'mohammad.rezaei@example.com',
          phone: '09356789012',
          address: 'شیراز، خیابان زند، پلاک ۷۸۹',
          registrationDate: '2023-02-10',
          totalSpent: 95000,
          status: 'inactive',
          services: [],
          notes: 'نیاز به پیگیری'
        }
      ];

      this.saveCustomers(sampleCustomers);

      // Add sample services
      const sampleServices: Service[] = [
        {
          id: this.generateId(),
          customerId: sampleCustomers[0].id,
          name: 'VPN پریمیم',
          type: 'monthly',
          price: 50000,
          startDate: '2023-12-01',
          endDate: '2024-01-01',
          status: 'active',
          autoRenewal: true,
          description: 'سرویس VPN با پهنای باند بالا'
        },
        {
          id: this.generateId(),
          customerId: sampleCustomers[1].id,
          name: 'هاست اختصاصی',
          type: 'yearly',
          price: 220000,
          startDate: '2023-03-22',
          endDate: '2024-03-22',
          status: 'active',
          autoRenewal: false,
          description: 'سرور اختصاصی با ۱۰ گیگ رم'
        }
      ];

      sampleServices.forEach(service => {
        this.addService(service);
      });
    }
  }
}