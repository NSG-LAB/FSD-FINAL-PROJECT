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
  Info
} from 'lucide-react';

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
      link.download = `Valuation_Report_${new Date().toLocaleDateString()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="min-h-screen ui-page py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Smart <span className="text-indigo-900 border-b-4 border-amber-400">Valuation</span> Estimator
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover the current market worth of your property and uncover its hidden potential with high-precision AI estimation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Side - Column width 5 */}
          <div className="lg:col-span-5 space-y-8">
            <div className="ui-card glass-card p-8 rounded-3xl border border-slate-100 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Home size={120} />
              </div>
              
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Info size={24} className="text-amber-500" />
                Property Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <Maximize size={16} /> Area (sqft)
                    </label>
                    <input
                      name="areaSqft"
                      type="number"
                      placeholder="e.g. 1800"
                      value={form.areaSqft}
                      onChange={handleChange}
                      className="premium-input w-full py-2 text-xl font-bold text-slate-800"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <Calendar size={16} /> Age (years)
                    </label>
                    <input
                      name="ageYears"
                      type="number"
                      placeholder="e.g. 10"
                      value={form.ageYears}
                      onChange={handleChange}
                      className="premium-input w-full py-2 text-xl font-bold text-slate-800"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <Bed size={16} /> Bedrooms
                    </label>
                    <input
                      name="bedrooms"
                      type="number"
                      placeholder="e.g. 3"
                      value={form.bedrooms}
                      onChange={handleChange}
                      className="premium-input w-full py-2 text-xl font-bold text-slate-800"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <Bath size={16} /> Bathrooms
                    </label>
                    <input
                      name="bathrooms"
                      type="number"
                      placeholder="e.g. 2"
                      value={form.bathrooms}
                      onChange={handleChange}
                      className="premium-input w-full py-2 text-xl font-bold text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Award size={18} className="text-amber-500" /> Current Condition
                    </label>
                    <span className="text-sm font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                      Score: {form.conditionScore}/5
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
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-900"
                  />
                  
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider">
                    <span>Poor</span>
                    <span>Fair</span>
                    <span>Good</span>
                    <span>Excellent</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gold-gradient-bg py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Analyzing Market Data...</span>
                    </div>
                  ) : (
                    <>
                      <span>Estimate Current Value</span>
                      <ChevronRight size={22} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Result Side - Column width 7 */}
          <div className="lg:col-span-7 space-y-8">
            {result ? (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
                <div className="ui-card glass-card result-card-glow p-8 rounded-3xl border border-indigo-100 shadow-2xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Estimated Market Value</p>
                      <h3 className="text-5xl font-black text-indigo-950 tracking-tighter">
                        ₹{result.currentValue?.toLocaleString('en-IN')}
                      </h3>
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-100 shadow-sm">
                        <TrendingUp size={16} />
                        Market Trend: +5.2% (Forecasted)
                      </div>
                    </div>
                    
                    <button
                      onClick={exportReport}
                      className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 hover:text-indigo-900 transition-colors shadow-sm group"
                      title="Download PDF Report"
                    >
                      <Download size={24} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                    <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Potential Value</p>
                      <p className="text-3xl font-bold text-indigo-900">₹{result.potentialValue?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-500 mt-2 font-medium">Expected after premium upgrades</p>
                    </div>
                    <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Unlockable Equity</p>
                      <p className="text-3xl font-bold text-amber-700">₹{result.valueIncrease?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-500 mt-2 font-medium">{result.percentageIncrease?.toFixed(1)}% growth potential</p>
                    </div>
                  </div>
                </div>

                <div className="ui-card glass-card p-8 rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                  <h3 className="text-xl font-bold mb-8 text-slate-800">Value Appreciation Projection</h3>
                  <ValuationChart valuationResult={result} formData={form} />
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[500px] flex items-center justify-center border-4 border-dashed border-slate-100 rounded-[3rem] p-12 text-center group">
                <div className="max-w-md space-y-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                    <TrendingUp size={48} className="text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-400">Ready for Assessment</h3>
                  <p className="text-slate-400 font-medium">
                    Enter your property details in the left panel to generate a comprehensive value estimation and market growth projection.
                  </p>
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