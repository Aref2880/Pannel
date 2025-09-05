import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CustomerManagement from './components/CustomerManagement';
import ServiceManagement from './components/ServiceManagement';
import NotificationSystem from './components/NotificationSystem';
import RevenueTracking from './components/RevenueTracking';
import type { Customer, Service, Notification, CustomerFormData, ServiceFormData } from './types';
import { LocalStorageService } from './utils/localStorage';
import { useNotifications } from './hooks/useNotifications';
import { calculateEndDate } from './utils/helpers';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialize data on app start
  useEffect(() => {
    LocalStorageService.initializeSampleData();
    setCustomers(LocalStorageService.getCustomers());
    setServices(LocalStorageService.getServices());
    setNotifications(LocalStorageService.getNotifications());
  }, []);

  // Auto-generate notifications
  useNotifications(customers, services);

  // Refresh notifications when they change
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(LocalStorageService.getNotifications());
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Customer management functions
  const handleAddCustomer = (customerData: CustomerFormData) => {
    const newCustomer: Customer = {
      id: LocalStorageService.generateId(),
      ...customerData,
      registrationDate: new Date().toISOString().split('T')[0],
      totalSpent: 0,
      status: 'active',
      services: []
    };

    LocalStorageService.addCustomer(newCustomer);
    setCustomers(LocalStorageService.getCustomers());
  };

  const handleUpdateCustomer = (customerId: string, customerData: Partial<Customer>) => {
    LocalStorageService.updateCustomer(customerId, customerData);
    setCustomers(LocalStorageService.getCustomers());
  };

  const handleDeleteCustomer = (customerId: string) => {
    LocalStorageService.deleteCustomer(customerId);
    setCustomers(LocalStorageService.getCustomers());
    setServices(LocalStorageService.getServices());
    setNotifications(LocalStorageService.getNotifications());
  };

  // Service management functions
  const handleAddService = (serviceData: ServiceFormData & { customerId: string }) => {
    const endDate = calculateEndDate(serviceData.startDate, serviceData.type);
    
    const newService: Service = {
      id: LocalStorageService.generateId(),
      ...serviceData,
      endDate,
      status: 'active'
    };

    LocalStorageService.addService(newService);
    setCustomers(LocalStorageService.getCustomers());
    setServices(LocalStorageService.getServices());
  };

  const handleUpdateService = (serviceId: string, serviceData: Partial<Service>) => {
    // Recalculate end date if start date or type changed
    if (serviceData.startDate || serviceData.type) {
      const currentService = services.find(s => s.id === serviceId);
      if (currentService) {
        const startDate = serviceData.startDate || currentService.startDate;
        const type = serviceData.type || currentService.type;
        serviceData.endDate = calculateEndDate(startDate, type);
      }
    }

    LocalStorageService.updateService(serviceId, serviceData);
    setCustomers(LocalStorageService.getCustomers());
    setServices(LocalStorageService.getServices());
  };

  const handleDeleteService = (serviceId: string) => {
    LocalStorageService.deleteService(serviceId);
    setCustomers(LocalStorageService.getCustomers());
    setServices(LocalStorageService.getServices());
  };

  // Notification management functions
  const handleMarkNotificationAsRead = (notificationId: string) => {
    LocalStorageService.markNotificationAsRead(notificationId);
    setNotifications(LocalStorageService.getNotifications());
  };

  const handleDeleteNotification = (notificationId: string) => {
    LocalStorageService.deleteNotification(notificationId);
    setNotifications(LocalStorageService.getNotifications());
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard customers={customers} services={services} />;
      case 'customers':
        return (
          <CustomerManagement
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        );
      case 'services':
        return (
          <ServiceManagement
            services={services}
            customers={customers}
            onAddService={handleAddService}
            onUpdateService={handleUpdateService}
            onDeleteService={handleDeleteService}
          />
        );
      case 'notifications':
        return (
          <NotificationSystem
            notifications={notifications}
            onMarkAsRead={handleMarkNotificationAsRead}
            onDeleteNotification={handleDeleteNotification}
          />
        );
      case 'revenue':
        return <RevenueTracking customers={customers} services={services} />;
      default:
        return <Dashboard customers={customers} services={services} />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      notificationCount={unreadNotificationCount}
    >
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;
