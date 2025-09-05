import React, { useMemo } from 'react';
import type { Customer, Service, DashboardStats } from '../types';
import { formatCurrency, formatPersianNumber, getDaysUntilExpiry, isServiceExpiringSoon } from '../utils/helpers';

interface DashboardProps {
  customers: Customer[];
  services: Service[];
}

const Dashboard: React.FC<DashboardProps> = ({ customers, services }) => {
  const stats: DashboardStats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
    
    // Calculate monthly revenue (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = services
      .filter(service => {
        const serviceDate = new Date(service.startDate);
        return serviceDate.getMonth() === currentMonth && serviceDate.getFullYear() === currentYear;
      })
      .reduce((sum, service) => sum + service.price, 0);

    const expiredServices = services.filter(service => getDaysUntilExpiry(service.endDate) < 0).length;
    const upcomingRenewals = services.filter(service => isServiceExpiringSoon(service.endDate, 30)).length;
    const pendingPayments = services.filter(service => service.status === 'pending').length;

    return {
      totalCustomers,
      activeCustomers,
      totalRevenue,
      monthlyRevenue,
      expiredServices,
      upcomingRenewals,
      pendingPayments
    };
  }, [customers, services]);

  const recentCustomers = useMemo(() => {
    return customers
      .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
      .slice(0, 5);
  }, [customers]);

  const expiringSoon = useMemo(() => {
    return services
      .filter(service => isServiceExpiringSoon(service.endDate, 7))
      .map(service => {
        const customer = customers.find(c => c.id === service.customerId);
        return {
          ...service,
          customerName: customer?.name || 'نامشخص',
          daysUntilExpiry: getDaysUntilExpiry(service.endDate)
        };
      })
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
      .slice(0, 5);
  }, [services, customers]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    color: 'primary' | 'success' | 'warning' | 'danger';
    change?: string;
  }> = ({ title, value, icon, color, change }) => {
    const colorClasses = {
      primary: 'bg-blue-500 text-white',
      success: 'bg-green-500 text-white',
      warning: 'bg-amber-500 text-white',
      danger: 'bg-red-500 text-white'
    };

    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className="text-sm text-gray-500 mt-1">{change}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
            <span className="text-xl">{icon}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">داشبورد</h1>
        <p className="text-gray-600">نمای کلی از وضعیت مشتریان و سرویس‌ها</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="کل مشتریان"
          value={formatPersianNumber(stats.totalCustomers)}
          icon="👥"
          color="primary"
        />
        <StatCard
          title="مشتریان فعال"
          value={formatPersianNumber(stats.activeCustomers)}
          icon="✅"
          color="success"
        />
        <StatCard
          title="درآمد کل"
          value={formatCurrency(stats.totalRevenue)}
          icon="💰"
          color="primary"
        />
        <StatCard
          title="درآمد ماه جاری"
          value={formatCurrency(stats.monthlyRevenue)}
          icon="📊"
          color="success"
        />
      </div>

      {/* Alerts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="سرویس‌های منقضی"
          value={formatPersianNumber(stats.expiredServices)}
          icon="⚠️"
          color="danger"
        />
        <StatCard
          title="تمدیدهای نزدیک"
          value={formatPersianNumber(stats.upcomingRenewals)}
          icon="🔔"
          color="warning"
        />
        <StatCard
          title="پرداخت‌های معلق"
          value={formatPersianNumber(stats.pendingPayments)}
          icon="⏳"
          color="warning"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">جدیدترین مشتریان</h3>
          <div className="space-y-3">
            {recentCustomers.length > 0 ? (
              recentCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </div>
                  <div className="text-left">
                    <span className={`badge badge-${customer.status === 'active' ? 'success' : customer.status === 'inactive' ? 'warning' : 'danger'}`}>
                      {customer.status === 'active' ? 'فعال' : customer.status === 'inactive' ? 'غیرفعال' : 'معلق'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">هیچ مشتری‌ای وجود ندارد</p>
            )}
          </div>
        </div>

        {/* Services Expiring Soon */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">سرویس‌های نزدیک به انقضا</h3>
          <div className="space-y-3">
            {expiringSoon.length > 0 ? (
              expiringSoon.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.customerName}</p>
                  </div>
                  <div className="text-left">
                    <span className="badge badge-danger">
                      {service.daysUntilExpiry} روز
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">سرویس نزدیک به انقضایی وجود ندارد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;