import React, { useState } from 'react';
import { reportAPI, valuationAPI } from '../services/api';
import { toast } from 'react-toastify';
import ValuationChart from '../components/ValuationChart';
import { 
  Home, 
  Maximize, 
  ChevronRight, 
  Calendar, 
  Bed, 
  Bath, 
  Award, 
  TrendingUp, 
  Download,
  Info,
  ShieldCheck
} from 'lucide-react';

import { Helmet } from 'react-helmet-async';

const ValuationEstimator = () => {
  const [form, setForm] = useState({
    areaSqft: '',
    ageYears: '',
    bedrooms: '',
    bathrooms: '',
    conditionScore: 3,
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.areaSqft || !form.bedrooms || !form.bathrooms) {
      toast.info('Please fill in the core property details');
      return;
    }

    setError('');
    setResult(null);
    setLoading(true);

    try {
      const { data } = await valuationAPI.estimateValue({
        areaSqft: Number(form.areaSqft),
        ageYears: Number(form.ageYears),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        conditionScore: Number(form.conditionScore),
      });
      setResult(data);
      toast.success('Valuation estimated successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to estimate value');
      toast.error('Could not complete valuation. Check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    if (!result) return;

    try {
      const response = await reportAPI.exportValuationPdf({
        valuationInput: {
          areaSqft: Number(form.areaSqft),
          ageYears: Number(form.ageYears),
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          conditionScore: Number(form.conditionScore),
        },
        valuationResult: result,
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GharMulya_Report_${new Date().toLocaleDateString()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="min-h-screen ui-page py-12 px-4 animate-in fade-in duration-700">
      <Helmet>
        <title>Smart Property Valuation | GharMulya</title>
        <meta name="description" content="Discover the current market worth of your property with our AI-powered valuation estimator. Get institutional-grade insights for Indian real estate." />
      </Helmet>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-indigo-100 shadow-sm">
            <ShieldCheck size={14} /> AI-Powered Estimation Engine
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-indigo-950">
            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Valuation</span> Estimator
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            Discover the current market worth of your property and uncover its hidden potential with high-precision machine learning algorithms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Side */}
          <div className="lg:col-span-5">
            <div className="glass p-8 rounded-3xl border border-white/50 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none transform rotate-12">
                <Home size={240} />
              </div>
              
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-indigo-900">
                <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-200">
                  <Info size={20} className="text-indigo-900" />
                </div>
                Property Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                      <Maximize size={14} className="text-indigo-600" /> Area (sqft)
                    </label>
                    <input
                      name="areaSqft"
                      type="number"
                      placeholder="1800"
                      value={form.areaSqft}
                      onChange={handleChange}
                      className="premium-input w-full py-3 text-xl font-black text-indigo-900 placeholder:text-slate-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                      <Calendar size={14} className="text-indigo-600" /> Age (years)
                    </label>
                    <input
                      name="ageYears"
                      type="number"
                      placeholder="5"
                      value={form.ageYears}
                      onChange={handleChange}
                      className="premium-input w-full py-3 text-xl font-black text-indigo-900"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                      <Bed size={14} className="text-indigo-600" /> Bedrooms
                    </label>
                    <input
                      name="bedrooms"
                      type="number"
                      placeholder="3"
                      value={form.bedrooms}
                      onChange={handleChange}
                      className="premium-input w-full py-3 text-xl font-black text-indigo-900"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                      <Bath size={14} className="text-indigo-600" /> Bathrooms
                    </label>
                    <input
                      name="bathrooms"
                      type="number"
                      placeholder="2"
                      value={form.bathrooms}
                      onChange={handleChange}
                      className="premium-input w-full py-3 text-xl font-black text-indigo-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-sm font-black text-indigo-900">
                      <Award size={18} className="text-amber-500" /> Maintenance Quality
                    </label>
                    <span className="text-xs font-black px-3 py-1 bg-amber-400 text-indigo-950 rounded-full shadow-sm">
                      Level: {form.conditionScore}/5
                    </span>
                  </div>
                  
                  <input
                    name="conditionScore"
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={form.conditionScore}
                    onChange={handleChange}
                    className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-900 shadow-inner"
                  />
                  
                  <div className="flex justify-between text-[10px] font-black text-slate-400 px-1 uppercase tracking-widest">
                    <span>Poor</span>
                    <span>Average</span>
                    <span>Excellent</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full py-5 rounded-2xl font-black text-lg shadow-xl hover:shadow-gold/20 transition-all duration-500 transform hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-70 disabled:transform-none overflow-hidden relative group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-indigo-900/30 border-t-indigo-900 rounded-full animate-spin"></div>
                      <span>Analyzing Market Data...</span>
                    </div>
                  ) : (
                    <>
                      <span>Calculate Precise Value</span>
                      <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Result Side */}
          <div className="lg:col-span-7">
            {result ? (
              <div className="stagger-container space-y-8">
                {/* Primary Result Card */}
                <div className="ui-card-item glass p-8 rounded-3xl border border-indigo-100/50 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="bg-indigo-950 absolute top-0 left-0 w-full h-1"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Estimated Market Value</p>
                      <h3 className="text-6xl font-black text-indigo-950 tracking-tighter mb-4">
                        ₹{result.currentValue?.toLocaleString('en-IN')}
                      </h3>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-700 rounded-xl text-sm font-black border border-green-200">
                        <TrendingUp size={18} />
                        Confidence Level: {result.confidence?.toUpperCase() || 'HIGH'}
                      </div>
                    </div>
                    
                    <button
                      onClick={exportReport}
                      className="p-5 bg-white text-indigo-900 rounded-3xl hover:bg-indigo-950 hover:text-white transition-all duration-500 shadow-xl border border-indigo-50 group"
                      title="Download PDF Report"
                    >
                      <Download size={28} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                    <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 relative group hover:bg-indigo-900 transition-colors duration-500 overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={80} className="group-hover:text-white" />
                      </div>
                      <p className="text-[10px] font-black text-indigo-600 group-hover:text-indigo-200 uppercase tracking-widest mb-1">Potential Value</p>
                      <p className="text-3xl font-black text-indigo-950 group-hover:text-white">₹{result.improvedValue?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-500 group-hover:text-indigo-300 mt-2 font-bold">Estimated after optimization</p>
                    </div>
                    
                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 relative group hover:bg-amber-400 transition-colors duration-500 overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Award size={80} className="group-hover:text-indigo-950" />
                      </div>
                      <p className="text-[10px] font-black text-amber-700 group-hover:text-amber-900 uppercase tracking-widest mb-1">Unlockable Equity</p>
                      <p className="text-3xl font-black text-amber-800 group-hover:text-indigo-950">₹{(result.improvedValue - result.currentValue)?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-amber-600 group-hover:text-indigo-800 mt-2 font-bold">Hidden wealth potential found</p>
                    </div>
                  </div>
                </div>

                {/* Chart Section */}
                <div className="ui-card-item glass p-8 rounded-3xl border border-white/50 shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-black text-indigo-950 flex items-center gap-2">
                       <TrendingUp className="text-indigo-600" size={24} />
                       Value Appreciation Projection
                     </h3>
                     <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded tracking-widest uppercase">12-Month Forecast</span>
                  </div>
                  <ValuationChart valuationResult={result} formData={form} />
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[600px] flex items-center justify-center rounded-[3rem] bg-slate-50/50 border-4 border-dashed border-slate-200 p-12 text-center group hover:bg-white hover:border-amber-200 transition-all duration-700">
                <div className="max-w-md space-y-6">
                  <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 mb-8">
                    <TrendingUp size={48} className="text-slate-300 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-400 group-hover:text-indigo-950 transition-colors tracking-tight">Precision Assessment</h3>
                  <p className="text-slate-400 group-hover:text-slate-600 font-bold leading-relaxed transition-colors">
                    Our AI models weigh factors from maintenance quality to BHK configurations. Enter your data to reveal your property's institutional-grade valuation.
                  </p>
                  <div className="pt-8 flex justify-center gap-4 opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                    {/* Placeholder for small tech icons/badges */}
                    <div className="px-3 py-1 bg-slate-100 rounded text-[9px] font-black uppercase text-slate-500">ML Model v2.4</div>
                    <div className="px-3 py-1 bg-slate-100 rounded text-[9px] font-black uppercase text-slate-500">Market Index Live</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuationEstimator;