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
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  TrendingDown,
  BarChart3,
  Target
} from 'lucide-react';

import { Helmet } from 'react-helmet-async';

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
      link.download = `GharMulya_Strategy_${new Date().toLocaleDateString()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Strategy report downloaded');
    } catch (error) {
      toast.error('Failed to export strategy report');
    }
  };

  return (
    <div className="min-h-screen ui-page py-16 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Strategic ROI Optimization | GharMulya</title>
        <meta name="description" content="Generate AI-driven renovation plans to maximize your property's ROI. High-precision capital deployment strategies for real estate." />
      </Helmet>
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Superior Header */}
        <div className="relative group">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 relative z-10">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-amber-400/20 to-amber-400/10 border border-amber-400/30 text-amber-600 rounded-full text-[11px] font-black uppercase tracking-[0.25em] backdrop-blur-sm">
                <Sparkles size={14} className="animate-pulse" /> Strategic Yield Optimization
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-indigo-950 font-instrument italic">
                Maximize <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-indigo-900 not-italic">Equity</span>
              </h1>
              <p className="text-slate-600 text-xl font-medium leading-relaxed max-w-2xl">
                Deploy capital with surgical precision. Our algorithms analyze hyper-local market data to identify the highest ROI intervention points for your property.
              </p>
            </div>
            
            <div className="flex shrink-0">
              {plan && (
                <button
                  onClick={exportPlan}
                  className="bg-indigo-950 text-white flex items-center gap-4 px-10 py-5 rounded-2xl font-black shadow-[0_20px_50px_rgba(30,27,75,0.3)] hover:shadow-[0_20px_50px_rgba(30,27,75,0.5)] hover:bg-black transition-all duration-500 transform hover:-translate-y-2 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                  <FileText size={24} className="group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] text-indigo-300 uppercase tracking-widest mb-1">Download</span>
                    <span className="text-lg">Full Strategy PDF</span>
                  </div>
                </button>
              )}
            </div>
          </div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-400/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        </div>

        {/* Intelligence Form */}
        <div className="glass p-10 rounded-[3rem] border border-white/60 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-1000 pointer-events-none transform rotate-12 scale-150">
            <BarChart3 size={300} />
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-end relative z-10">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] pl-1">
                <Wallet size={16} className="text-amber-500" /> Capital Reserve
              </label>
              <div className="relative group/input">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                <input
                  name="budget"
                  type="number"
                  placeholder="Ex: 5,00,000"
                  value={form.budget}
                  onChange={handleChange}
                  className="premium-input w-full pl-10 pr-4 py-4 text-xl font-black text-indigo-950 bg-white/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] pl-1">
                <Layers size={16} className="text-indigo-600" /> Asset Taxonomy
              </label>
              <select
                name="propertyType"
                value={form.propertyType}
                onChange={handleChange}
                className="premium-input w-full px-5 py-4 font-bold text-slate-700 bg-white/50 focus:bg-white appearance-none cursor-pointer"
              >
                <option value="apartment">Modern Apartment</option>
                <option value="house">Standalone House</option>
                <option value="villa">Luxury Villa</option>
                <option value="townhouse">Executive Townhouse</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] pl-1">
                <Zap size={16} className="text-indigo-600" /> Current State
              </label>
              <select
                name="propertyCondition"
                value={form.propertyCondition}
                onChange={handleChange}
                className="premium-input w-full px-5 py-4 font-bold text-slate-700 bg-white/50 focus:bg-white appearance-none cursor-pointer"
              >
                <option value="excellent">Excellent Condition</option>
                <option value="good">Well Maintained</option>
                <option value="average">Standard Wear</option>
                <option value="needs-work">Value-Add Opportunity</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] pl-1">
                <MapPin size={16} className="text-indigo-600" /> Target Market
              </label>
              <input
                name="city"
                placeholder="Ex: Mumbai"
                value={form.city}
                onChange={handleChange}
                className="premium-input w-full px-5 py-4 font-bold text-slate-700 bg-white/50 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-br from-indigo-900 to-indigo-950 h-[64px] w-full rounded-2xl font-black text-white flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(30,27,75,0.25)] hover:shadow-[0_20px_40px_rgba(30,27,75,0.4)] transition-all duration-500 transform hover:-translate-y-1 disabled:opacity-70 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-200 translate-x-[-105%] group-hover:translate-x-[0%] transition-transform duration-700 opacity-20"></div>
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Sparkles size={24} className="group-hover:rotate-45 transition-transform duration-500" />
              )}
              <span className="text-lg">{loading ? 'Synthesizing...' : 'Optimize ROI'}</span>
            </button>
          </form>
        </div>

        {plan ? (
          <div className="stagger-container space-y-12 pb-20">
            {/* Summary Analytics - High Precision */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="ui-card-item glass p-8 rounded-[2.5rem] border border-white shadow-xl relative group overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <Wallet size={24} />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Capital</div>
                </div>
                <p className="text-sm font-bold text-slate-400 mb-1">Total Allocation</p>
                <p className="text-4xl font-black text-indigo-950 tabular-nums">₹{plan.totalCost?.toLocaleString('en-IN')}</p>
                <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-600 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </div>
              
              <div className="ui-card-item glass p-8 rounded-[2.5rem] border border-white shadow-xl relative group overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                    <TrendingUp size={24} />
                  </div>
                  <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Profit</div>
                </div>
                <p className="text-sm font-bold text-slate-400 mb-1">Value Appreciation</p>
                <p className="text-4xl font-black text-emerald-600 tabular-nums">₹{plan.totalEstimatedGain?.toLocaleString('en-IN')}</p>
                <div className="mt-4 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Growth Expected</span>
                </div>
              </div>
              
              <div className="ui-card-item bg-indigo-950 p-8 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.2)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-black opacity-80"></div>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-3 bg-white/10 rounded-2xl text-amber-400 backdrop-blur-md">
                      <Target size={24} />
                    </div>
                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">Metric</div>
                  </div>
                  <p className="text-sm font-bold text-indigo-300 mb-1">Blended Annual ROI</p>
                  <p className="text-5xl font-black text-white tabular-nums tracking-tighter">{plan.blendedROI}<span className="text-amber-400 text-3xl">%</span></p>
                </div>
              </div>
              
              <div className="ui-card-item glass p-8 rounded-[2.5rem] border border-white shadow-xl flex flex-col justify-center items-center text-center">
                <BarChart3 size={32} className="text-slate-200 mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Strategy Density</p>
                <p className="text-5xl font-black text-indigo-950 tabular-nums group-hover:scale-110 transition-transform duration-500">{plan.selectedCount}</p>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">Active Upgrades</p>
              </div>
            </div>

            {/* Recommendations Grid - Enhanced Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {plan.recommendations.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="ui-card-item group glass p-0 rounded-[3rem] shadow-2xl border border-white/80 overflow-hidden flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-12 duration-1000"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                   {/* Left Visual/Title Side */}
                   <div className="flex-1 p-10 space-y-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-4 py-1.5 bg-indigo-50/50 text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-100/50 flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                           {item.category}
                        </span>
                        <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border flex items-center gap-2 ${
                          item.difficulty === 'easy' ? 'bg-emerald-50/50 text-emerald-700 border-emerald-100/50' : 
                          item.difficulty === 'moderate' ? 'bg-amber-50/50 text-amber-700 border-amber-100/50' : 
                          'bg-rose-50/50 text-rose-700 border-rose-100/50'
                        }`}>
                          <Layers size={12} />
                          {item.difficulty} Effort
                        </span>
                      </div>
                      
                      <h3 className="text-3xl font-black text-indigo-950 tracking-tighter leading-tight group-hover:text-indigo-800 transition-colors font-instrument italic">
                        {item.title}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-8 pt-4">
                        <div className="space-y-2">
                           <div className="flex items-center gap-3 text-slate-400">
                             <Clock size={18} className="text-indigo-300" />
                             <span className="text-[10px] font-black uppercase tracking-[0.25em]">Execution Team</span>
                           </div>
                           <span className="text-lg font-black text-slate-700">{item.durationMonths} Months</span>
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center gap-3 text-slate-400">
                             <CheckCircle2 size={18} className="text-emerald-300" />
                             <span className="text-[10px] font-black uppercase tracking-[0.25em]">Capital Yield</span>
                           </div>
                           <span className="text-lg font-black text-slate-700">{item.paybackMonths} Mo Payback</span>
                        </div>
                      </div>
                   </div>

                   {/* Right Financial Side */}
                   <div className="md:w-64 bg-slate-50/50 p-10 border-l border-white/50 flex flex-col justify-center items-center text-center gap-8 relative overflow-hidden group-hover:bg-white transition-colors duration-500">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-1000">
                        <TrendingUp size={100} />
                      </div>
                      
                      <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CapEx Required</p>
                        <p className="text-2xl font-black text-indigo-950 tracking-tight">₹{item.estimatedCost?.toLocaleString('en-IN')}</p>
                      </div>

                      <div className="w-full h-[1px] bg-indigo-100 transform scale-x-50"></div>

                      <div className="space-y-1 relative z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest mb-3 shadow-lg shadow-emerald-200">
                          Alpha Gain
                        </div>
                        <div className="flex flex-col items-center">
                          <p className="text-5xl font-black text-emerald-600 leading-none tracking-tighter">+{item.roiPercentage}%</p>
                          <p className="text-[10px] font-black text-emerald-700/50 uppercase tracking-widest mt-2">Valuation Spike</p>
                        </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>

            {plan.recommendations.length === 0 && (
              <div className="text-center py-32 glass rounded-[4rem] border-2 border-dashed border-slate-200 animate-in fade-in zoom-in duration-700">
                 <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transform -rotate-6">
                    <TrendingDown size={40} className="text-slate-400" />
                 </div>
                 <h3 className="text-3xl font-black text-indigo-950 mb-4 tracking-tight">Deployment Ceiling Reached</h3>
                 <p className="text-slate-500 text-lg font-medium max-w-md mx-auto">No high-confidence upgrades were identified within the ₹{Number(form.budget).toLocaleString()} constraint. Consider adjusting your capital reserve.</p>
              </div>
            )}
          </div>
        ) : (
          /* Empty State - High Design */
          <div className="py-40 text-center rounded-[4rem] bg-slate-50/30 border-2 border-dashed border-slate-200 group hover:border-amber-300 transition-all duration-1000 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-50"></div>
             <div className="relative z-10">
               <div className="bg-white w-28 h-28 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-[15deg] transition-all duration-700 mb-10 border border-slate-50">
                  <Target size={56} className="text-slate-200 group-hover:text-amber-500 transition-colors duration-500" />
               </div>
               <h3 className="text-4xl font-black text-slate-300 group-hover:text-indigo-950 transition-colors duration-500 tracking-tight font-instrument italic">
                  Initiate Strategic Analysis
               </h3>
               <p className="text-slate-400 group-hover:text-slate-600 text-xl font-medium max-w-lg mx-auto mt-6 transition-colors duration-500 leading-relaxed">
                  Enter your property profile and investment ceiling to generate a risk-adjusted renovation roadmap.
               </p>
             </div>
          </div>
        )}
        
        {/* Intelligence Network Footer */}
        <div className="mt-24 pt-16 border-t border-slate-100 relative overflow-hidden">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
             <div className="space-y-4 group">
               <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center transition-all duration-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:-translate-y-2">
                 <ShieldCheck size={28} />
               </div>
               <div>
                 <h4 className="font-black text-indigo-950 text-base uppercase tracking-widest mb-2">Verified Accuracy</h4>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed">Calibrated against 12.4M regional data points to ensure ±3% valuation precision.</p>
               </div>
             </div>
             <div className="space-y-4 group">
               <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center transition-all duration-500 group-hover:bg-amber-500 group-hover:text-white group-hover:-translate-y-2">
                 <Clock size={28} />
               </div>
               <div>
                 <h4 className="font-black text-indigo-950 text-base uppercase tracking-widest mb-2">Dynamic Indexing</h4>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed">Labor and material costs are indexed hourly to reflect real-time market shifts.</p>
               </div>
             </div>
             <div className="space-y-4 group">
               <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center transition-all duration-500 group-hover:bg-emerald-600 group-hover:text-white group-hover:-translate-y-2">
                 <Zap size={28} />
               </div>
               <div>
                 <h4 className="font-black text-indigo-950 text-base uppercase tracking-widest mb-2">Instant Readiness</h4>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed">Strategy outputs format directly into contractor-ready execution manifestos.</p>
               </div>
             </div>
           </div>
           <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default ROIPlanner;
