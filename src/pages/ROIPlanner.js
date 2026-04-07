import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { reportAPI, roiAPI } from '../services/api';
import { 
  Wallet, 
  MapPin, 
  Layers, 
  Zap, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  FileText,
  Sparkles
} from 'lucide-react';

const ROIPlanner = () => {
  const [form, setForm] = useState({
    budget: '',
    propertyType: 'apartment',
    propertyCondition: 'good',
    city: '',
    topN: 5,
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.budget) {
      toast.info('Please enter your investment budget');
      return;
    }
    
    setLoading(true);
    setPlan(null);

    try {
      const response = await roiAPI.generatePlan({
        budget: Number(form.budget || 0),
        propertyType: form.propertyType,
        propertyCondition: form.propertyCondition,
        city: form.city.trim() || undefined,
        topN: Number(form.topN),
      });

      setPlan(response.data.plan);
      toast.success('Optimization plan generated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate ROI plan');
    } finally {
      setLoading(false);
    }
  };

  const exportPlan = async () => {
    if (!plan) return;

    try {
      const response = await reportAPI.exportValuationPdf({
        valuationInput: {
          propertyType: form.propertyType,
          propertyCondition: form.propertyCondition,
          city: form.city,
        },
        valuationResult: {
          currentValue: plan.totalCost,
          improvedValue: (plan.totalCost || 0) + (plan.totalEstimatedGain || 0),
          confidence: 'high',
          range: { min: plan.totalCost, max: plan.totalEstimatedGain },
        },
        roiPlan: plan,
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ROI_Strategy_${new Date().toLocaleDateString()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export strategy report');
    }
  };

  return (
    <div className="min-h-screen ui-page py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              ROI <span className="text-indigo-900 border-b-4 border-amber-400">Optimization</span> Planner
            </h1>
            <p className="text-slate-600 text-lg">
              Strategize your property upgrades based on real market ROI data.
            </p>
          </div>
          
          {plan && (
            <button
              onClick={exportPlan}
              className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-sm"
            >
              <FileText size={20} />
              Export Strategy
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="ui-card glass-card p-6 rounded-2xl border border-slate-100 shadow-lg mb-10">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 items-end">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <Wallet size={14} className="text-amber-500" /> Budget (₹)
              </label>
              <input
                name="budget"
                type="number"
                placeholder="Ex: 5,00,000"
                value={form.budget}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-indigo-900 focus:ring-2 focus:ring-amber-400 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <Layers size={14} className="text-amber-500" /> Prop Type
              </label>
              <select
                name="propertyType"
                value={form.propertyType}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:ring-2 focus:ring-amber-400 outline-none transition-all"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="townhouse">Townhouse</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <Zap size={14} className="text-amber-500" /> Condition
              </label>
              <select
                name="propertyCondition"
                value={form.propertyCondition}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:ring-2 focus:ring-amber-400 outline-none transition-all"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="needs-work">Needs Work</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <MapPin size={14} className="text-amber-500" /> City
              </label>
              <input
                name="city"
                placeholder="Ex: Mumbai"
                value={form.city}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:ring-2 focus:ring-amber-400 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gold-gradient-bg w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Sparkles size={20} />}
              <span>{loading ? 'Optimizing...' : 'Plan ROI'}</span>
            </button>
          </form>
        </div>

        {plan ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            {/* Summary Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Cost</p>
                <p className="text-2xl font-black text-indigo-950">₹{plan.totalCost?.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute -right-2 -top-2 opacity-5">
                   <ArrowUpRight size={80} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Value Addition</p>
                <p className="text-2xl font-black text-green-600">₹{plan.totalEstimatedGain?.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-indigo-900 p-6 rounded-3xl shadow-xl">
                <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Blended ROI</p>
                <p className="text-3xl font-black text-amber-400">{plan.blendedROI}%</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Upgrades Found</p>
                <p className="text-2xl font-black text-indigo-950">{plan.selectedCount}</p>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {plan.recommendations.map((item, idx) => (
                <div key={item.id} className="group ui-card hover:border-amber-200 transition-all duration-300 p-6 rounded-[2rem] flex flex-col md:flex-row gap-6 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400 rounded-l-[2rem]"></div>
                   
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-indigo-100">
                          {item.category}
                        </span>
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${
                          item.difficulty === 'easy' ? 'bg-green-50 text-green-700 border-green-100' : 
                          item.difficulty === 'moderate' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {item.difficulty}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-indigo-950 mb-4 group-hover:text-indigo-700 transition-colors">
                        {item.title}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-slate-600">
                           <Clock size={16} className="text-slate-400" />
                           <span className="text-sm font-medium">{item.durationMonths} Months</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                           <CheckCircle2 size={16} className="text-slate-400" />
                           <span className="text-sm font-medium">{item.paybackMonths} Mo Payback</span>
                        </div>
                      </div>
                   </div>

                   <div className="md:w-48 flex flex-col justify-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Cost</p>
                        <p className="text-lg font-bold text-slate-700">₹{item.estimatedCost?.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Value Gain</p>
                        <p className="text-xl font-black text-green-600">+{item.roiPercentage}%</p>
                      </div>
                   </div>
                </div>
              ))}
            </div>

            {plan.recommendations.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                 <p className="text-xl font-bold text-slate-400">No matching upgrades found for this budget.</p>
                 <p className="text-slate-400">Try increasing your budget or changing property filters.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-24 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
             <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet size={48} className="text-slate-200" />
             </div>
             <h3 className="text-2xl font-bold text-slate-300">Set your budget to begin</h3>
             <p className="text-slate-400 max-w-sm mx-auto mt-2">
                We'll analyze thousands of renovation data points to find the best ROI-positive improvements for your property.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ROIPlanner;

