import React, { useState, useEffect } from 'react';
import { recommendationAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  TrendingUp, 
  Info,
  ChevronRight,
  Hammer,
  Paintbrush,
  Lightbulb,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await recommendationAPI.getAll();
        setRecommendations(response.data);
      } catch (error) {
        toast.error('Failed to load expert recommendations');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const categories = [
    { id: 'all', label: 'All Upgrades', icon: <Search size={16} /> },
    { id: 'Interior', label: 'Interiors', icon: <Paintbrush size={16} /> },
    { id: 'Exterior', label: 'Exteriors', icon: <Hammer size={16} /> },
    { id: 'Smart Home', label: 'Smart Tech', icon: <Smartphone size={16} /> },
    { id: 'Energy', label: 'Energy', icon: <Lightbulb size={16} /> },
  ];

  const filteredItems = recommendations.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                         item.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Interior': return <Paintbrush className="text-indigo-500" />;
      case 'Exterior': return <Hammer className="text-amber-600" />;
      case 'Energy Efficiency': return <Lightbulb className="text-yellow-500" />;
      case 'Smart Home': return <Smartphone className="text-blue-500" />;
      default: return <Star className="text-amber-500" />;
    }
  };

  return (
    <div className="min-h-screen ui-page py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-indigo-950">
            Expert <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">Improvement</span> Catalog
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Curated list of high-impact renovations designed to maximize your property's market value and aesthetic appeal.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                  filter === cat.id 
                  ? 'bg-indigo-900 text-white border-indigo-900 shadow-lg' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search upgrades..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-400 outline-none shadow-sm transition-all text-slate-700 font-medium"
            />
          </div>
        </div>

        {/* Main Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-[2.5rem]"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div key={item.id} className="group ui-card hover:border-amber-200 transition-all duration-500 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl">
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                      <TrendingUp size={14} />
                      <span className="text-[10px] font-black uppercase">High ROI</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-indigo-950 mb-3 leading-tight group-hover:text-indigo-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 line-clamp-3 text-sm font-medium leading-relaxed mb-6">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                       <Clock size={16} className="text-slate-300" />
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.durationMonths || 2} Months</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={16} className="text-slate-300" />
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expert Verified</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-slate-50 group-hover:bg-indigo-900 group-hover:text-white py-4 transition-colors font-bold text-slate-600 flex items-center justify-center gap-2">
                   View Project Details
                   <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-32">
             <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-slate-200" />
             </div>
             <h3 className="text-2xl font-bold text-slate-400">No matching upgrades found</h3>
             <button 
               onClick={() => {setFilter('all'); setSearch('');}}
               className="mt-4 text-indigo-900 font-bold hover:underline"
             >
               Clear all filters
             </button>
          </div>
        )}

        {/* Pro Tip Section */}
        <div className="mt-20 p-10 gold-gradient-bg rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
             <Lightbulb size={40} className="text-white" />
          </div>
          <div className="relative z-10">
             <h3 className="text-2xl font-bold mb-2">Exclusive Premium Tip</h3>
             <p className="text-white/90 text-lg max-w-2xl">
               Combine "Smart Security" with "Modern Landscaping" to achieve up to a <span className="font-black">12% instant boost</span> in curb appeal and property appraisal value.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
