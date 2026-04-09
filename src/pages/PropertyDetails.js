import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { ArrowLeft, Trash2, MapPin, Home as HomeIcon, Bed, Bath, Expand } from 'lucide-react';
import EnhancementChecklist from '../components/EnhancementChecklist';
import { propertyAPI, recommendationAPI, showApiErrorToast } from '../services/api';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [property, setProperty] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';

  const locationLabel = useMemo(() => {
    if (!property?.location) {
      return 'Location not provided';
    }

    const city = property.location.city || '';
    const state = property.location.state || '';
    const country = property.location.country || '';
    return [city, state, country].filter(Boolean).join(', ') || 'Location not provided';
  }, [property]);

  const loadPropertyDetails = async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    try {
      const [propertyRes, recommendationsRes] = await Promise.all([
        propertyAPI.getPropertyById(id),
        recommendationAPI.getPropertyRecommendations(id),
      ]);

      setProperty(propertyRes?.data?.property || null);
      setRecommendations(recommendationsRes?.data?.recommendations || []);
    } catch (error) {
      showApiErrorToast({
        error,
        fallbackMessage: 'Failed to load property details.',
        onRetry: loadPropertyDetails,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPropertyDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!property?.id) {
      return;
    }

    if (!window.confirm('Delete this property? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await propertyAPI.deleteProperty(property.id);
      toast.success('Property deleted successfully.');
      navigate(dashboardPath);
    } catch (error) {
      showApiErrorToast({
        error,
        fallbackMessage: 'Failed to delete property.',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafbfc] pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl border border-slate-100 bg-white p-10 shadow-xl shadow-indigo-950/5">
            <p className="text-slate-500 font-semibold">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#fafbfc] pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl border border-slate-100 bg-white p-10 shadow-xl shadow-indigo-950/5">
            <h1 className="text-2xl font-black text-indigo-950">Property not found</h1>
            <p className="text-slate-500 font-medium mt-2">This property may have been removed or you may not have access.</p>
            <Link
              to={dashboardPath}
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-indigo-950 text-white text-xs font-black uppercase tracking-widest"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-28 pb-20 px-6">
      <Helmet>
        <title>{property.title} | Property Details</title>
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-indigo-950/5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate(dashboardPath)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest"
            >
              <ArrowLeft size={14} /> Dashboard
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-60"
            >
              <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>

          <div className="mt-6">
            <h1 className="text-3xl md:text-4xl font-black text-indigo-950 tracking-tight">{property.title}</h1>
            <p className="text-slate-500 mt-2 font-medium">{property.description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Value</p>
              <p className="text-xl font-black text-indigo-950 mt-2">{formatCurrency(property.currentValue)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Potential Value Increase</p>
              <p className="text-xl font-black text-indigo-950 mt-2">{formatCurrency(property.potentialValueIncrease)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estimated New Value</p>
              <p className="text-xl font-black text-indigo-950 mt-2">{formatCurrency(property.estimatedNewValue)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
              <p className="text-xl font-black text-indigo-950 mt-2 capitalize">{property.status || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-indigo-950/5">
          <h2 className="text-2xl font-black text-indigo-950">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
            <p className="text-slate-700 font-semibold inline-flex items-center gap-2"><HomeIcon size={16} /> Type: <span className="font-bold">{property.propertyType || 'N/A'}</span></p>
            <p className="text-slate-700 font-semibold inline-flex items-center gap-2"><MapPin size={16} /> Location: <span className="font-bold">{locationLabel}</span></p>
            <p className="text-slate-700 font-semibold inline-flex items-center gap-2"><Bed size={16} /> Bedrooms: <span className="font-bold">{property.bedrooms ?? 'N/A'}</span></p>
            <p className="text-slate-700 font-semibold inline-flex items-center gap-2"><Bath size={16} /> Bathrooms: <span className="font-bold">{property.bathrooms ?? 'N/A'}</span></p>
            <p className="text-slate-700 font-semibold inline-flex items-center gap-2"><Expand size={16} /> Built-up Area: <span className="font-bold">{property.builUpArea ?? 'N/A'} sq ft</span></p>
            <p className="text-slate-700 font-semibold">Condition: <span className="font-bold capitalize">{property.condition || 'N/A'}</span></p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-indigo-950/5">
          <h2 className="text-2xl font-black text-indigo-950">Recommended Improvements</h2>
          {recommendations.length === 0 ? (
            <p className="text-slate-500 font-semibold mt-4">No recommendations available for this property.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {recommendations.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-black text-indigo-950">{item.title}</h3>
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      ROI {Number(item.expectedROI || 0)}%
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm font-medium mt-2">{item.description || 'No description available.'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-indigo-950/5">
          <h2 className="text-2xl font-black text-indigo-950 mb-6">Enhancement Checklist</h2>
          <EnhancementChecklist propertyId={property.id} />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
