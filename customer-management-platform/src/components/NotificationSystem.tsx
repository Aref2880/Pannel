import React, { useMemo } from 'react';
import type { Notification } from '../types';
import { formatPersianDate } from '../utils/helpers';

interface NotificationSystemProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onDeleteNotification: (notificationId: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onMarkAsRead,
  onDeleteNotification
}) => {
  const groupedNotifications = useMemo(() => {
    const groups = {
      unread: notifications.filter(n => !n.read),
      read: notifications.filter(n => n.read)
    };
    return groups;
  }, [notifications]);

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const renewalReminders = notifications.filter(n => n.type === 'renewal_reminder').length;
    const expiredServices = notifications.filter(n => n.type === 'service_expired').length;

    return { total, unread, renewalReminders, expiredServices };
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'renewal_reminder':
        return '🔔';
      case 'payment_due':
        return '💰';
      case 'service_expired':
        return '⚠️';
      case 'general':
        return 'ℹ️';
      default:
        return '📌';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'renewal_reminder':
        return 'amber';
      case 'payment_due':
        return 'blue';
      case 'service_expired':
        return 'red';
      case 'general':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'renewal_reminder':
        return 'یادآوری تمدید';
      case 'payment_due':
        return 'سررسید پرداخت';
      case 'service_expired':
        return 'سرویس منقضی';
      case 'general':
        return 'عمومی';
      default:
        return type;
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    onMarkAsRead(notificationId);
  };

  const handleDelete = (notificationId: string) => {
    if (confirm('آیا از حذف این اعلان اطمینان دارید؟')) {
      onDeleteNotification(notificationId);
    }
  };

  const NotificationCard: React.FC<{ notification: Notification }> = ({ notification }) => (
    <div className={`p-4 rounded-lg border transition-colors ${
      notification.read 
        ? 'bg-gray-50 border-gray-200' 
        : 'bg-white border-r-4 border-r-blue-500 shadow-sm'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge badge-${getNotificationColor(notification.type)}`}>
                {getTypeText(notification.type)}
              </span>
              {notification.daysUntilExpiry !== undefined && (
                <span className="text-sm text-gray-500">
                  {notification.daysUntilExpiry} روز مانده
                </span>
              )}
            </div>
            <p className={`text-sm mb-2 ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
              {notification.message}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>مشتری: {notification.customerName}</span>
              <span>سرویس: {notification.serviceName}</span>
              <span>{formatPersianDate(notification.date)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!notification.read && (
            <button
              onClick={() => handleMarkAsRead(notification.id)}
              className="text-blue-600 hover:text-blue-800 text-sm"
              title="علامت‌گذاری به عنوان خوانده شده"
            >
              ✓ خوانده شد
            </button>
          )}
          <button
            onClick={() => handleDelete(notification.id)}
            className="text-red-600 hover:text-red-800 text-sm"
            title="حذف اعلان"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">اعلان‌ها</h1>
        <p className="text-gray-600">مدیریت اعلان‌ها و یادآوری‌ها</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">کل اعلان‌ها</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.unread}</div>
            <div className="text-sm text-gray-600">خوانده نشده</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.renewalReminders}</div>
            <div className="text-sm text-gray-600">یادآوری تمدید</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.expiredServices}</div>
            <div className="text-sm text-gray-600">سرویس منقضی</div>
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="card">
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">🔔</div>
            <p className="text-gray-500">هیچ اعلانی وجود ندارد</p>
          </div>
        </div>
      ) : (
        <>
          {/* Unread Notifications */}
          {groupedNotifications.unread.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                اعلان‌های خوانده نشده ({groupedNotifications.unread.length})
              </h2>
              <div className="space-y-3">
                {groupedNotifications.unread.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            </div>
          )}

          {/* Read Notifications */}
          {groupedNotifications.read.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                اعلان‌های خوانده شده ({groupedNotifications.read.length})
              </h2>
              <div className="space-y-3">
                {groupedNotifications.read.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationSystem;