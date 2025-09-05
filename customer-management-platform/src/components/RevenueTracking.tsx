import React, { useMemo } from 'react';
import type { Customer, Service, RevenueData } from '../types';
import { formatCurrency, formatPersianNumber, getMonthName } from '../utils/helpers';

interface RevenueTrackingProps {
  customers: Customer[];
  services: Service[];
}

const RevenueTracking: React.FC<RevenueTrackingProps> = ({ customers, services }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const revenueData = useMemo(() => {
    const monthlyData: RevenueData[] = [];
    
    for (let month = 0; month < 12; month++) {
      const monthServices = services.filter(service => {
        const serviceDate = new Date(service.startDate);
        return serviceDate.getFullYear() === currentYear && serviceDate.getMonth() === month;
      });

      const revenue = monthServices.reduce((sum, service) => sum + service.price, 0);
      const customerCount = new Set(monthServices.map(service => service.customerId)).size;

      monthlyData.push({
        month: getMonthName(month),
        revenue,
        customers: customerCount
      });
    }

    return monthlyData;
  }, [services, currentYear]);

  const stats = useMemo(() => {
    const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
    const currentMonthRevenue = revenueData[currentMonth]?.revenue || 0;
    const averageMonthlyRevenue = totalRevenue / 12;
    
    // Previous month for comparison
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthRevenue = revenueData[previousMonth]?.revenue || 0;
    const monthlyGrowth = previousMonthRevenue === 0 ? 0 : 
      ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

    // Top customers by spending
    const topCustomers = [...customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    // Service type revenue breakdown
    const serviceTypeRevenue = services.reduce((acc, service) => {
      acc[service.type] = (acc[service.type] || 0) + service.price;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      currentMonthRevenue,
      averageMonthlyRevenue,
      monthlyGrowth,
      topCustomers,
      serviceTypeRevenue
    };
  }, [customers, services, revenueData, currentMonth]);

  const getServiceTypeText = (type: string) => {
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

  const StatCard: React.FC<{
    title: string;
    value: string;
    change?: number;
    icon: string;
    color: 'primary' | 'success' | 'warning' | 'danger';
  }> = ({ title, value, change, icon, color }) => {
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
            {change !== undefined && (
              <p className={`text-sm mt-1 ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change >= 0 ? '↗' : '↘'} {Math.abs(change).toFixed(1)}%
              </p>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">گزارش درآمد</h1>
        <p className="text-gray-600">تحلیل درآمد و عملکرد مالی</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="کل درآمد"
          value={formatCurrency(stats.totalRevenue)}
          icon="💰"
          color="primary"
        />
        <StatCard
          title="درآمد ماه جاری"
          value={formatCurrency(stats.currentMonthRevenue)}
          change={stats.monthlyGrowth}
          icon="📊"
          color="success"
        />
        <StatCard
          title="میانگین ماهیانه"
          value={formatCurrency(stats.averageMonthlyRevenue)}
          icon="📈"
          color="primary"
        />
        <StatCard
          title="تعداد مشتریان فعال"
          value={formatPersianNumber(customers.filter(c => c.status === 'active').length)}
          icon="👥"
          color="success"
        />
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">درآمد ماهیانه ({currentYear})</h3>
          <div className="space-y-3">
            {revenueData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${
                    index === currentMonth ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></span>
                  <span className="text-sm text-gray-700">{data.month}</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(data.revenue)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatPersianNumber(data.customers)} مشتری
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">برترین مشتریان</h3>
          <div className="space-y-3">
            {stats.topCustomers.length > 0 ? (
              stats.topCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.services.length} سرویس</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                    <span className={`badge badge-${customer.status === 'active' ? 'success' : 'warning'}`}>
                      {customer.status === 'active' ? 'فعال' : 'غیرفعال'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">هیچ مشتری‌ای وجود ندارد</p>
            )}
          </div>
        </div>
      </div>

      {/* Service Type Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">تفکیک درآمد بر اساس نوع سرویس</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats.serviceTypeRevenue).map(([type, revenue]) => (
            <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(revenue)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {getServiceTypeText(type)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {services.filter(s => s.type === type).length} سرویس
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">آخرین تراکنش‌ها</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-medium text-gray-700">تاریخ</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">مشتری</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">سرویس</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">مبلغ</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {services
                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                .slice(0, 10)
                .map((service) => {
                  const customer = customers.find(c => c.id === service.customerId);
                  return (
                    <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(service.startDate).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="py-3 px-4 text-gray-900">{customer?.name || 'نامشخص'}</td>
                      <td className="py-3 px-4 text-gray-600">{service.name}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {formatCurrency(service.price)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge badge-${
                          service.status === 'active' ? 'success' : 
                          service.status === 'expired' ? 'danger' : 'warning'
                        }`}>
                          {service.status === 'active' ? 'فعال' : 
                           service.status === 'expired' ? 'منقضی' : 'در انتظار'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueTracking;