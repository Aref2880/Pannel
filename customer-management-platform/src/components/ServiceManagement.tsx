import React, { useState, useMemo } from 'react';
import type { Service, Customer, ServiceFormData } from '../types';
import { formatPersianDate, formatCurrency, getDaysUntilExpiry, getServiceStatusColor, isServiceExpired, isServiceExpiringSoon } from '../utils/helpers';
import ServiceForm from './ServiceForm';

interface ServiceManagementProps {
  services: Service[];
  customers: Customer[];
  onAddService: (serviceData: ServiceFormData & { customerId: string }) => void;
  onUpdateService: (serviceId: string, serviceData: Partial<Service>) => void;
  onDeleteService: (serviceId: string) => void;
}

const ServiceManagement: React.FC<ServiceManagementProps> = ({
  services,
  customers,
  onAddService,
  onUpdateService,
  onDeleteService
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    customerId: 'all'
  });

  const servicesWithCustomers = useMemo(() => {
    return services.map(service => {
      const customer = customers.find(c => c.id === service.customerId);
      return {
        ...service,
        customerName: customer?.name || 'نامشخص',
        daysUntilExpiry: getDaysUntilExpiry(service.endDate)
      };
    });
  }, [services, customers]);

  const filteredServices = useMemo(() => {
    let filtered = [...servicesWithCustomers];

    if (filters.status !== 'all') {
      filtered = filtered.filter(service => service.status === filters.status);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(service => service.type === filters.type);
    }

    if (filters.customerId !== 'all') {
      filtered = filtered.filter(service => service.customerId === filters.customerId);
    }

    return filtered.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [servicesWithCustomers, filters]);

  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter(s => s.status === 'active').length;
    const expired = services.filter(s => isServiceExpired(s.endDate)).length;
    const expiringSoon = services.filter(s => isServiceExpiringSoon(s.endDate)).length;

    return { total, active, expired, expiringSoon };
  }, [services]);

  const handleAddService = (serviceData: ServiceFormData & { customerId: string }) => {
    onAddService(serviceData);
    setIsFormOpen(false);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleUpdateService = (serviceData: ServiceFormData & { customerId: string }) => {
    if (editingService) {
      onUpdateService(editingService.id, serviceData);
      setEditingService(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm('آیا از حذف این سرویس اطمینان دارید؟')) {
      onDeleteService(serviceId);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingService(null);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'فعال';
      case 'expired':
        return 'منقضی';
      case 'pending':
        return 'در انتظار';
      case 'cancelled':
        return 'لغو شده';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'monthly':
        return 'ماهیانه';
      case 'quarterly':
        return 'سه‌ماهه';
      case 'yearly':
        return 'سالیانه';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مدیریت سرویس‌ها</h1>
          <p className="text-gray-600">مدیریت سرویس‌های ارائه شده به مشتریان</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn btn-primary"
        >
          ➕ افزودن سرویس جدید
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">کل سرویس‌ها</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">فعال</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.expiringSoon}</div>
            <div className="text-sm text-gray-600">نزدیک به انقضا</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <div className="text-sm text-gray-600">منقضی</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وضعیت
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="input"
            >
              <option value="all">همه</option>
              <option value="active">فعال</option>
              <option value="expired">منقضی</option>
              <option value="pending">در انتظار</option>
              <option value="cancelled">لغو شده</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع سرویس
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="input"
            >
              <option value="all">همه</option>
              <option value="monthly">ماهیانه</option>
              <option value="quarterly">سه‌ماهه</option>
              <option value="yearly">سالیانه</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مشتری
            </label>
            <select
              value={filters.customerId}
              onChange={(e) => setFilters(prev => ({ ...prev, customerId: e.target.value }))}
              className="input"
            >
              <option value="all">همه مشتریان</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="card">
        {filteredServices.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">⚙️</div>
            <p className="text-gray-500">هیچ سرویسی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-medium text-gray-700">نام سرویس</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">مشتری</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">نوع</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">قیمت</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">تاریخ شروع</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">تاریخ پایان</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">وضعیت</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{service.name}</div>
                        {service.description && (
                          <div className="text-sm text-gray-500">{service.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{service.customerName}</td>
                    <td className="py-3 px-4 text-gray-600">{getTypeText(service.type)}</td>
                    <td className="py-3 px-4 text-gray-600">{formatCurrency(service.price)}</td>
                    <td className="py-3 px-4 text-gray-600">{formatPersianDate(service.startDate)}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-gray-600">{formatPersianDate(service.endDate)}</div>
                        {service.daysUntilExpiry >= 0 ? (
                          <div className={`text-sm ${
                            service.daysUntilExpiry <= 7 ? 'text-red-600' : 
                            service.daysUntilExpiry <= 30 ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {service.daysUntilExpiry} روز مانده
                          </div>
                        ) : (
                          <div className="text-sm text-red-600">
                            {Math.abs(service.daysUntilExpiry)} روز گذشته
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge badge-${getServiceStatusColor(service.status)}`}>
                        {getStatusText(service.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditService(service)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Service Form Modal */}
      {isFormOpen && (
        <ServiceForm
          service={editingService}
          customers={customers}
          onSubmit={editingService ? handleUpdateService : handleAddService}
          onCancel={closeForm}
        />
      )}
    </div>
  );
};

export default ServiceManagement;