import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { notificationAPI } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    dueAt: '',
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      toast.error('Failed to load notifications');
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

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      await notificationAPI.createReminder({
        title: formData.title,
        message: formData.message,
        dueAt: formData.dueAt ? new Date(formData.dueAt).toISOString() : null,
      });
      toast.success('Reminder created');
      setFormData({ title: '', message: '', dueAt: '' });
      fetchNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create reminder');
    }
  };

  const markRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
      );
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow border border-slate-200 p-8">
          <h1 className="text-3xl font-bold mb-2">Notifications &amp; Reminders</h1>
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
              className="bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 font-semibold transition"
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
            <p className="text-gray-600 py-6">Loading notifications...</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 ${item.isRead ? 'bg-gray-50 border-slate-200' : 'bg-blue-50 border-blue-200'}`}
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
                        className="text-sm px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <p className="text-gray-500 py-4">No notifications yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
