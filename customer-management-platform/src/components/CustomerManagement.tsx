import React, { useState, useMemo } from 'react';
import type { Customer, CustomerFormData, FilterOptions } from '../types';
import { formatPersianDate, formatCurrency, formatPersianNumber, getCustomerStatusColor, debounce } from '../utils/helpers';
import CustomerForm from './CustomerForm';

interface CustomerManagementProps {
  customers: Customer[];
  onAddCustomer: (customerData: CustomerFormData) => void;
  onUpdateCustomer: (customerId: string, customerData: Partial<Customer>) => void;
  onDeleteCustomer: (customerId: string) => void;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const filteredCustomers = useMemo(() => {
    let filtered = [...customers];

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(customer => customer.status === filters.status);
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone.includes(filters.searchTerm || '') ||
        customer.address.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (filters.sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'registrationDate':
            aValue = new Date(a.registrationDate);
            bValue = new Date(b.registrationDate);
            break;
          case 'totalSpent':
            aValue = a.totalSpent;
            bValue = b.totalSpent;
            break;
          default:
            aValue = a.name;
            bValue = b.name;
        }

        if (filters.sortOrder === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      });
    }

    return filtered;
  }, [customers, filters]);

  const debouncedSearch = debounce((searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleAddCustomer = (customerData: CustomerFormData) => {
    onAddCustomer(customerData);
    setIsFormOpen(false);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleUpdateCustomer = (customerData: CustomerFormData) => {
    if (editingCustomer) {
      onUpdateCustomer(editingCustomer.id, customerData);
      setEditingCustomer(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm('آیا از حذف این مشتری اطمینان دارید؟')) {
      onDeleteCustomer(customerId);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCustomer(null);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'فعال';
      case 'inactive':
        return 'غیرفعال';
      case 'suspended':
        return 'معلق';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مدیریت مشتریان</h1>
          <p className="text-gray-600">مدیریت اطلاعات مشتریان و خدمات آن‌ها</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn btn-primary"
        >
          ➕ افزودن مشتری جدید
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              جستجو
            </label>
            <input
              type="text"
              placeholder="نام، ایمیل، تلفن یا آدرس..."
              onChange={handleSearchChange}
              className="input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وضعیت
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="input"
            >
              <option value="all">همه</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
              <option value="suspended">معلق</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مرتب‌سازی بر اساس
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="input"
            >
              <option value="name">نام</option>
              <option value="registrationDate">تاریخ ثبت‌نام</option>
              <option value="totalSpent">مبلغ خرید</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ترتیب
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
              className="input"
            >
              <option value="asc">صعودی</option>
              <option value="desc">نزولی</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatPersianNumber(customers.length)}</div>
            <div className="text-sm text-gray-600">کل مشتریان</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatPersianNumber(customers.filter(c => c.status === 'active').length)}
            </div>
            <div className="text-sm text-gray-600">مشتریان فعال</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">
              {formatPersianNumber(customers.filter(c => c.status === 'inactive').length)}
            </div>
            <div className="text-sm text-gray-600">غیرفعال</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatPersianNumber(customers.filter(c => c.status === 'suspended').length)}
            </div>
            <div className="text-sm text-gray-600">معلق</div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="card">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            نمایش {formatPersianNumber(filteredCustomers.length)} از {formatPersianNumber(customers.length)} مشتری
          </p>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">👥</div>
            <p className="text-gray-500">هیچ مشتری‌ای یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-medium text-gray-700">نام</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">ایمیل</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">تلفن</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">تاریخ ثبت‌نام</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">مبلغ خرید</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">وضعیت</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.services.length} سرویس</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{customer.email}</td>
                    <td className="py-3 px-4 text-gray-600">{customer.phone}</td>
                    <td className="py-3 px-4 text-gray-600">{formatPersianDate(customer.registrationDate)}</td>
                    <td className="py-3 px-4 text-gray-600">{formatCurrency(customer.totalSpent)}</td>
                    <td className="py-3 px-4">
                      <span className={`badge badge-${getCustomerStatusColor(customer.status)}`}>
                        {getStatusText(customer.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
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

      {/* Customer Form Modal */}
      {isFormOpen && (
        <CustomerForm
          customer={editingCustomer}
          onSubmit={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
          onCancel={closeForm}
        />
      )}
    </div>
  );
};

export default CustomerManagement;