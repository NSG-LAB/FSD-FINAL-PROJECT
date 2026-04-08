import React, { useState, useEffect } from 'react';
import { recommendationAPI, valuationAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  TrendingUp, 
  ChevronRight,
  Hammer,
  Paintbrush,
  Lightbulb,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap
} from 'lucide-react';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [budget, setBudget] = useState('');
  const [propertyAge, setPropertyAge] = useState('');
  const [userGoals, setUserGoals] = useState('');
  const [costEstimate, setCostEstimate] = useState(null);
  const [estimating, setEstimating] = useState(false);

  const loadRecommendations = async (params = {}) => {
    setLoading(true);
    try {
      const response = await recommendationAPI.getRecommendations({
        limit: 60,
        offset: 0,
        sortBy: params.sortBy || 'priority',
        order: 'DESC',
        ...params,
      });
      setRecommendations(response?.data?.recommendations || []);
    } catch (error) {
      toast.error('Failed to load expert recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const applySmartRanking = async () => {
    await loadRecommendations({
      sortBy: 'personalized',
      city,
      budget: budget || undefined,
      propertyAge: propertyAge || undefined,
      userGoals: userGoals || undefined,
    });
  };

  const estimateCost = async () => {
    setEstimating(true);
    try {
      const response = await valuationAPI.estimateRenovationCost({
        city,
        areaType: 'urban',
        category: filter === 'all' ? 'general' : filter,
        propertyAgeYears: Number(propertyAge || 0),
        budget: Number(budget || 0)
      });
      setCostEstimate(response?.data || null);
    } catch (error) {
      toast.error('Unable to estimate renovation cost for this location.');
    } finally {
      setEstimating(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Intelligence', icon: <Sparkles size={16} /> },
    { id: 'interior-design', label: 'Architectural Interiors', icon: <Paintbrush size={16} /> },
    { id: 'garden-outdoor', label: 'Structural Exteriors', icon: <Hammer size={16} /> },
    { id: 'lighting-fixtures', label: 'Automation', icon: <Smartphone size={16} /> },
    { id: 'energy-efficiency', label: 'Sustainability', icon: <Lightbulb size={16} /> },
  ];

  const filteredItems = recommendations.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                         item.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'interior-design': return <Paintbrush className="text-indigo-400" />;
      case 'garden-outdoor': return <Hammer className="text-amber-500" />;
      case 'energy-efficiency': return <Lightbulb className="text-yellow-400" />;
      case 'lighting-fixtures': return <Smartphone className="text-blue-400" />;
      default: return <Star className="text-amber-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-950 to-transparent opacity-[0.03] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Elite Header */}
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-700 text-xs font-black uppercase tracking-widest mb-6">
            <Sparkles size={14} />
            Market Authority
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-indigo-950 mb-8 leading-[1.1]">
             Elite <span className="instrument-serif italic text-amber-500">Value-Add</span> Catalog
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Curated intelligence for high-yield property enhancements, leveraging national market trends and architectural best practices.
          </p>
        </div>

        {/* Intelligence Controls */}
        <div className="glass-card mb-16 p-2 rounded-[2.5rem] flex flex-col lg:flex-row gap-4 items-center shadow-xl shadow-indigo-950/5">
          <div className="flex flex-wrap gap-2 w-full lg:w-auto p-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-3xl text-sm font-black transition-all duration-300 ${
                  filter === cat.id 
                  ? 'bg-indigo-950 text-white shadow-xl shadow-indigo-950/20' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-950'
                }`}
              >
                {cat.icon}
                <span className="tracking-tight">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full lg:flex-1 h-full px-4 border-l border-slate-100 hidden lg:block">
            <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
            <input
              type="text"
              placeholder="Search intelligence by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-transparent outline-none text-lg font-bold text-indigo-950 placeholder:text-slate-300"
            />
          </div>
        </div>

        <div className="glass-card mb-16 p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-indigo-950/5 bg-white border border-slate-100">
          <h2 className="text-2xl font-black text-indigo-950 tracking-tight mb-5">Smart Recommendation Ranking</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (e.g., Chennai)"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
            />
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Budget"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
            />
            <input
              type="number"
              value={propertyAge}
              onChange={(e) => setPropertyAge(e.target.value)}
              placeholder="Property age (years)"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
            />
            <input
              type="text"
              value={userGoals}
              onChange={(e) => setUserGoals(e.target.value)}
              placeholder="Goals (eco, quick, luxury)"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={applySmartRanking}
              className="px-5 py-3 rounded-xl bg-indigo-950 text-white text-xs font-black uppercase tracking-widest"
            >
              Apply Smart Ranking
            </button>
            <button
              type="button"
              onClick={estimateCost}
              disabled={estimating}
              className="px-5 py-3 rounded-xl bg-amber-400 text-indigo-950 text-xs font-black uppercase tracking-widest disabled:opacity-60"
            >
              {estimating ? 'Estimating...' : 'Estimate Cost by Location'}
            </button>
            <button
              type="button"
              onClick={() => {
                setCity('');
                setBudget('');
                setPropertyAge('');
                setUserGoals('');
                setCostEstimate(null);
                loadRecommendations();
              }}
              className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest"
            >
              Reset
            </button>
          </div>

          {costEstimate?.costRange && (
            <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-xs uppercase tracking-widest font-black text-slate-400">Cost Estimator by Location</p>
              <p className="text-sm text-slate-600 mt-2">
                {costEstimate.city} ({costEstimate.areaType}) • {costEstimate.category}
              </p>
              <p className="text-lg font-black text-indigo-950 mt-1">
                Estimated Range: ₹{Number(costEstimate.costRange.min || 0).toLocaleString()} - ₹{Number(costEstimate.costRange.max || 0).toLocaleString()}
              </p>
              <p className="text-xs font-bold text-slate-500 mt-1">Affordability: {costEstimate.affordability || 'unknown'}</p>
            </div>
          )}
        </div>

        {/* Visual Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[450px] rounded-[3rem] bg-white border border-slate-100 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredItems.map((item, index) => (
              <div 
                key={item.id} 
                className="group relative bg-white border border-slate-100 rounded-[3rem] p-10 hover:shadow-2xl hover:shadow-indigo-950/10 transition-all duration-500 flex flex-col animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-950 group-hover:border-indigo-950 transition-all duration-500">
                    <div className="group-hover:text-amber-400 transition-colors duration-500">
                      {getCategoryIcon(item.category)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-indigo-950 rounded-xl font-black text-[10px] uppercase tracking-wider">
                    <Zap size={12} fill="currentColor" />
                    Strategic ROI
                  </div>
                </div>

                <h3 className="text-3xl font-black text-indigo-950 mb-6 leading-tight group-hover:text-amber-500 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-10 line-clamp-4 flex-grow">
                  {item.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-10 p-6 rounded-3xl bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Timeframe</span>
                     <div className="flex items-center gap-2 text-indigo-950 font-black">
                        <Clock size={16} />
                        {item.durationMonths || 2} Months
                     </div>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Confidence</span>
                     <div className="flex items-center gap-2 text-indigo-950 font-black">
                        <ShieldCheck size={16} />
                        High
                     </div>
                  </div>
                </div>

                <button className="flex items-center justify-between w-full p-2 group/btn">
                  <span className="text-sm font-black text-indigo-950 group-hover/btn:translate-x-2 transition-transform duration-300">Detailed Analysis</span>
                  <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center group-hover/btn:bg-indigo-950 group-hover/btn:text-white transition-all duration-300">
                    <ChevronRight size={20} />
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-40 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
             <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-8">
                <Search size={40} className="text-slate-200" />
             </div>
             <h3 className="text-3xl font-black text-indigo-950 mb-4 tracking-tight">Intelligence Out of Reach</h3>
             <p className="text-slate-500 font-medium mb-10">We couldn't find any upgrades matching your criteria.</p>
             <button 
               onClick={() => {setFilter('all'); setSearch('');}}
               className="px-10 py-5 bg-indigo-950 text-white rounded-2xl font-black text-sm tracking-tight hover:shadow-2xl transition-all active:scale-95"
             >
               Reset Intelligence Filter
             </button>
          </div>
        )}

        {/* Global Strategy Insight */}
        <div className="mt-32 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-indigo-600 rounded-[4rem] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-indigo-950 rounded-[4rem] p-12 md:p-20 flex flex-col md:flex-row items-center gap-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-1/2"></div>
            
            <div className="w-24 h-24 md:w-32 md:h-32 bg-amber-400 rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-2xl shadow-amber-400/20">
               <Lightbulb size={48} className="text-indigo-950" />
            </div>
            
            <div className="flex-1 space-y-6 text-center md:text-left">
               <h3 className="text-3xl md:text-5xl font-black text-white leading-tight">
                  Premium Value <span className="instrument-serif italic text-amber-400">Optimization</span>
               </h3>
               <p className="text-indigo-200/60 text-xl font-medium leading-relaxed max-w-2xl">
                 Our data shows that combining <span className="text-white font-black hover:text-amber-400 cursor-help transition-colors">Lighting Architectural Enhancements</span> with <span className="text-white font-black hover:text-amber-400 cursor-help transition-colors">Smart Climate Controls</span> yields a compounding appreciation effect exceeding 14%.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
