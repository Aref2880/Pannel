import React, { useState, useEffect } from 'react';
import type { Service, Customer, ServiceFormData } from '../types';
import { calculateEndDate } from '../utils/helpers';

interface ServiceFormProps {
  service?: Service | null;
  customers: Customer[];
  onSubmit: (serviceData: ServiceFormData & { customerId: string }) => void;
  onCancel: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ service, customers, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ServiceFormData & { customerId: string; status?: string }>({
    name: '',
    type: 'monthly',
    price: 0,
    startDate: new Date().toISOString().split('T')[0],
    autoRenewal: true,
    description: '',
    customerId: '',
    status: 'active'
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        type: service.type,
        price: service.price,
        startDate: service.startDate,
        autoRenewal: service.autoRenewal,
        description: service.description || '',
        customerId: service.customerId,
        status: service.status
      });
    } else if (customers.length > 0) {
      setFormData(prev => ({ ...prev, customerId: customers[0].id }));
    }
  }, [service, customers]);

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'نام سرویس الزامی است';
    }

    if (!formData.customerId) {
      newErrors.customerId = 'انتخاب مشتری الزامی است';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'قیمت باید بیشتر از صفر باشد';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'تاریخ شروع الزامی است';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData: ServiceFormData & { customerId: string } = {
        name: formData.name.trim(),
        type: formData.type,
        price: Number(formData.price),
        startDate: formData.startDate,
        autoRenewal: formData.autoRenewal,
        description: formData.description?.trim(),
        customerId: formData.customerId
      };

      onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const getEndDate = () => {
    if (formData.startDate && formData.type) {
      return calculateEndDate(formData.startDate, formData.type);
    }
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {service ? 'ویرایش سرویس' : 'افزودن سرویس جدید'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مشتری *
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => handleInputChange('customerId', e.target.value)}
                className={`input ${errors.customerId ? 'input-error' : ''}`}
                disabled={!!service}
              >
                <option value="">انتخاب کنید</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام سرویس *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="نام سرویس"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع سرویس *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="input"
                >
                  <option value="monthly">ماهیانه</option>
                  <option value="quarterly">سه‌ماهه</option>
                  <option value="yearly">سالیانه</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  قیمت (ریال) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={`input ${errors.price ? 'input-error' : ''}`}
                  placeholder="0"
                  min="0"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاریخ شروع *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`input ${errors.startDate ? 'input-error' : ''}`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاریخ پایان (محاسبه خودکار)
                </label>
                <input
                  type="date"
                  value={getEndDate()}
                  className="input bg-gray-100"
                  disabled
                />
              </div>
            </div>

            {service && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وضعیت
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="input"
                >
                  <option value="active">فعال</option>
                  <option value="expired">منقضی</option>
                  <option value="pending">در انتظار</option>
                  <option value="cancelled">لغو شده</option>
                </select>
              </div>
            )}

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.autoRenewal}
                  onChange={(e) => handleInputChange('autoRenewal', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">تمدید خودکار</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                توضیحات
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="input"
                placeholder="توضیحات اختیاری درباره سرویس"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary flex-1"
              >
                {isSubmitting ? 'در حال ذخیره...' : service ? 'ویرایش' : 'افزودن'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary flex-1"
              >
                لغو
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceForm;