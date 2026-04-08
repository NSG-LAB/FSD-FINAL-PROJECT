import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { Save, ShieldCheck, User } from 'lucide-react';
import { setUser } from '../redux/authSlice';
import { showApiErrorToast, userAPI } from '../services/api';

const emptyForm = {
  firstName: '',
  lastName: '',
  phone: '',
  city: '',
  state: '',
  bio: '',
};

const Profile = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const roleLabel = useMemo(() => (user?.role === 'admin' ? 'Administrator' : 'User'), [user?.role]);

  const syncForm = (profileUser) => {
    setFormData({
      firstName: profileUser?.firstName || '',
      lastName: profileUser?.lastName || '',
      phone: profileUser?.phone || '',
      city: profileUser?.city || '',
      state: profileUser?.state || '',
      bio: profileUser?.bio || '',
    });
  };

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await userAPI.getProfile();
        const profileUser = response?.data?.user;
        if (profileUser) {
          syncForm(profileUser);
          if (token) {
            dispatch(setUser({ user: profileUser, token }));
          }
        }
      } catch (error) {
        showApiErrorToast({
          error,
          fallbackMessage: 'Unable to load profile. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [dispatch, token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await userAPI.updateProfile(formData);
      const updatedUser = response?.data?.user;

      if (updatedUser && token) {
        dispatch(setUser({ user: updatedUser, token }));
        syncForm(updatedUser);
      }

      toast.success('Profile updated successfully.');
    } catch (error) {
      showApiErrorToast({
        error,
        fallbackMessage: 'Failed to update profile. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-28 pb-20 px-6">
      <Helmet>
        <title>{roleLabel} Profile | GharMulya</title>
        <meta name="description" content="Manage your GharMulya profile information and keep your account details up to date." />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="glass-card bg-white border border-slate-100 rounded-[2rem] p-8 md:p-10 shadow-xl shadow-indigo-950/5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-indigo-950 tracking-tight">My Profile</h1>
              <p className="text-slate-500 mt-2 text-sm md:text-base">
                Manage your account details and preferences.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-widest">
              {user?.role === 'admin' ? <ShieldCheck size={14} /> : <User size={14} />}
              {roleLabel}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-card bg-white border border-slate-100 rounded-[2rem] p-8 md:p-10 shadow-xl shadow-indigo-950/5 space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading || saving}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-indigo-950 outline-none focus:border-indigo-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading || saving}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-indigo-950 outline-none focus:border-indigo-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2" htmlFor="role">
                Role
              </label>
              <input
                id="role"
                name="role"
                value={roleLabel}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading || saving}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-indigo-950 outline-none focus:border-indigo-400"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2" htmlFor="city">
                City
              </label>
              <input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={loading || saving}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-indigo-950 outline-none focus:border-indigo-400"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2" htmlFor="state">
                State
              </label>
              <input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={loading || saving}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-indigo-950 outline-none focus:border-indigo-400"
                placeholder="Enter state"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={loading || saving}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-indigo-950 outline-none focus:border-indigo-400"
              placeholder="Write a short bio"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-950 text-white text-sm font-black uppercase tracking-widest disabled:opacity-50 hover:bg-indigo-900 transition-colors"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
