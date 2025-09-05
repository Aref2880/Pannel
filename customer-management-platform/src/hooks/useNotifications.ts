import { useEffect } from 'react';
import type { Service, Customer, Notification } from '../types';
import { LocalStorageService } from '../utils/localStorage';
import { getDaysUntilExpiry, isServiceExpiringSoon, isServiceExpired } from '../utils/helpers';

export const useNotifications = (customers: Customer[], services: Service[]) => {
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = [];
      const existingNotifications = LocalStorageService.getNotifications();

      services.forEach(service => {
        const customer = customers.find(c => c.id === service.customerId);
        if (!customer) return;

        const daysUntilExpiry = getDaysUntilExpiry(service.endDate);
        const notificationId = `${service.id}_${service.endDate}`;

        // Skip if notification already exists
        if (existingNotifications.some(n => n.id === notificationId)) {
          return;
        }

        // Service expired notification
        if (isServiceExpired(service.endDate) && service.status === 'active') {
          newNotifications.push({
            id: LocalStorageService.generateId(),
            customerId: customer.id,
            customerName: customer.name,
            serviceId: service.id,
            serviceName: service.name,
            type: 'service_expired',
            message: `سرویس "${service.name}" مشتری "${customer.name}" منقضی شده است.`,
            date: new Date().toISOString().split('T')[0],
            read: false,
            daysUntilExpiry: Math.abs(daysUntilExpiry)
          });
        }
        // Renewal reminder notification (7 days before expiry)
        else if (isServiceExpiringSoon(service.endDate, 7) && service.status === 'active') {
          newNotifications.push({
            id: LocalStorageService.generateId(),
            customerId: customer.id,
            customerName: customer.name,
            serviceId: service.id,
            serviceName: service.name,
            type: 'renewal_reminder',
            message: `سرویس "${service.name}" مشتری "${customer.name}" ${daysUntilExpiry} روز دیگر منقضی می‌شود.`,
            date: new Date().toISOString().split('T')[0],
            read: false,
            daysUntilExpiry
          });
        }
        // Payment due notification (30 days before expiry)
        else if (isServiceExpiringSoon(service.endDate, 30) && !isServiceExpiringSoon(service.endDate, 7) && service.status === 'active') {
          newNotifications.push({
            id: LocalStorageService.generateId(),
            customerId: customer.id,
            customerName: customer.name,
            serviceId: service.id,
            serviceName: service.name,
            type: 'payment_due',
            message: `سررسید پرداخت سرویس "${service.name}" مشتری "${customer.name}" نزدیک است.`,
            date: new Date().toISOString().split('T')[0],
            read: false,
            daysUntilExpiry
          });
        }
      });

      // Add new notifications to storage
      newNotifications.forEach(notification => {
        LocalStorageService.addNotification(notification);
      });
    };

    // Generate notifications when component mounts or data changes
    generateNotifications();

    // Set up daily check for new notifications
    const interval = setInterval(generateNotifications, 24 * 60 * 60 * 1000); // Every 24 hours

    return () => clearInterval(interval);
  }, [customers, services]);
};