import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import SkeletonLoader from '../components/SkeletonLoader';
import { notificationAPI, showApiErrorToast } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    dueAt: '',
  });

  const fetchNotifications = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      setLoadError('We could not load notifications right now.');
      showApiErrorToast({
        error,
        fallbackMessage: 'Failed to load notifications. Please try again.',
        onRetry: fetchNotifications,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const createReminder = async (payload) => {
    await notificationAPI.createReminder(payload);
    toast.success('Reminder created');
    setFormData({ title: '', message: '', dueAt: '' });
    fetchNotifications();
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const payload = {
      title: formData.title,
      message: formData.message,
      dueAt: formData.dueAt ? new Date(formData.dueAt).toISOString() : null,
    };

    try {
      await createReminder(payload);
    } catch (error) {
      showApiErrorToast({
        error,
        fallbackMessage: 'Failed to create reminder. Please try again.',
        onRetry: () => createReminder(payload),
      });
    }
  };

  const markRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
      );
    } catch (error) {
      showApiErrorToast({
        error,
        fallbackMessage: 'Failed to mark notification as read. Please try again.',
        onRetry: () => markRead(id),
      });
    }
  };

  return (
    <div className="min-h-screen ui-page py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="ui-card rounded-xl p-8">
          <h1 className="ui-card-title text-3xl font-bold mb-2">Notifications &amp; Reminders</h1>
          <p className="text-gray-600 mb-6">Create reminders and keep track of pending tasks across your property improvements.</p>

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Reminder title"
              className="px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="datetime-local"
              name="dueAt"
              value={formData.dueAt}
              onChange={handleChange}
              className="px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="btn-primary px-4 py-2.5"
            >
              Add Reminder
            </button>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Reminder details"
              className="md:col-span-3 px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </form>

          {loading ? (
            <div className="space-y-3 py-2">
              {[...Array(3)].map((_, index) => (
                <SkeletonLoader key={index} type="card" className="h-28" />
              ))}
            </div>
          ) : loadError ? (
            <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-xl font-semibold text-red-800 mb-2">Unable to load notifications</h3>
              <p className="text-red-700 mb-5">{loadError}</p>
              <button
                type="button"
                onClick={fetchNotifications}
                className="btn-secondary px-5 py-2.5"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-lg p-4 ${item.isRead ? 'ui-card-item' : 'bg-blue-50 border border-blue-200'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-700 mt-1">{item.message}</p>
                      {item.dueAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Due: {new Date(item.dueAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => markRead(item.id)}
                        className="text-sm px-3 py-1.5 btn-success"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-5xl mb-3">🔔</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
                  <p className="text-gray-600">Create a reminder above to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
