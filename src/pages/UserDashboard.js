import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setProperties, setLoading } from '../redux/propertySlice';
import { propertyAPI, recommendationAPI, showApiErrorToast } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import PropertyFormWizard from '../components/PropertyFormWizard';
import SkeletonLoader from '../components/SkeletonLoader';
import EnhancementChecklist from '../components/EnhancementChecklist';
import { Helmet } from 'react-helmet-async';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  Home, 
  Zap, 
  BarChart3, 
  MapPin, 
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Clock
} from 'lucide-react';

const DEFAULT_PROPERTY_PAGE_SIZE = 6;

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { properties, loading } = useSelector(state => state.property);
  const { user } = useSelector(state => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [propertyPage, setPropertyPage] = useState(1);
  const [propertyPageSize, setPropertyPageSize] = useState(DEFAULT_PROPERTY_PAGE_SIZE);
  const [propertySearchInput, setPropertySearchInput] = useState('');
  const [propertyQuery, setPropertyQuery] = useState('');
  const [dashboardError, setDashboardError] = useState(null);
  const [propertyPagination, setPropertyPagination] = useState({
    count: 0,
    limit: DEFAULT_PROPERTY_PAGE_SIZE,
    offset: 0,
    hasMore: false
  });
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalValue: 0,
    pendingRecommendations: 0,
    completedImprovements: 0
  });

  useEffect(() => {
    fetchData(propertyPage, propertyPageSize, propertyQuery);
  }, [propertyPage, propertyPageSize, propertyQuery]);

  const fetchData = async (page = 1, pageSize = propertyPageSize, query = propertyQuery) => {
    dispatch(setLoading(true));
    setDashboardError(null);
    try {
      const offset = (page - 1) * pageSize;
      const [propertiesRes, recommendationsRes] = await Promise.all([
        propertyAPI.getProperties({
          limit: pageSize,
          offset,
          q: query,
          sortBy: 'createdAt',
          order: 'DESC'
        }),
        recommendationAPI.getRecommendations({
          limit: 3,
          offset: 0,
          sortBy: 'priority',
          order: 'DESC'
        })
      ]);

      const props = propertiesRes.data.properties || [];
      dispatch(setProperties(props));
      setRecommendations(recommendationsRes.data.recommendations || []);
      
      setPropertyPagination({
        count: propertiesRes.data.count || 0,
        limit: propertiesRes.data.limit || pageSize,
        offset: propertiesRes.data.offset || 0,
        hasMore: Boolean(propertiesRes.data.hasMore)
      });

      const totalVal = props.reduce((sum, prop) => sum + (Number(prop.currentValue) || 0), 0);
      
      setStats({
        totalProperties: propertiesRes.data.count || 0,
        totalValue: totalVal,
        pendingRecommendations: recommendationsRes.data.count || 0,
        completedImprovements: 0 
      });
    } catch (error) {
      setDashboardError('Dashboard data is temporarily unavailable.');
      showApiErrorToast({
        error,
        fallbackMessage: 'Failed to fetch dashboard data. Please try again.',
        onRetry: fetchData,
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const applyPropertySearch = () => {
    setPropertyPage(1);
    setPropertyQuery(propertySearchInput.trim());
  };

  const handlePropertyCreated = async () => {
    setShowForm(false);
    setPropertyPage(1);
    setPropertySearchInput('');
    setPropertyQuery('');
    await fetchData(1, propertyPageSize, '');
  };

  const totalPropertyPages = Math.max(1, Math.ceil(propertyPagination.count / propertyPagination.limit));

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-28 pb-20 px-6 relative overflow-hidden">
      <Helmet>
        <title>Property Command Center | GharMulya</title>
        <meta name="description" content="Manage your property portfolio, run valuations, and discover high ROI renovation strategies in your personalized dashboard." />
      </Helmet>
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-[500px] bg-indigo-900/5 blur-[120px] rounded-full -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 animate-fade-in-up">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-900 text-[10px] font-black uppercase tracking-widest mb-4">
               <ShieldCheck size={12} className="text-indigo-600" />
               Institutional Access
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-indigo-950 tracking-tight leading-[1.1]">
               Property <span className="instrument-serif italic text-amber-500">Command</span> Center
            </h1>
            <p className="text-slate-400 mt-4 text-lg font-medium">
              Welcome back, <span className="text-indigo-950 font-bold underline decoration-amber-400 decoration-2 underline-offset-4">{user?.firstName || 'Strategist'}</span>. Here is your portfolio performance summary.
            </p>
          </div>
          
          <button 
            onClick={() => setShowForm(true)}
            className="group relative flex items-center justify-center p-0.5 rounded-[1.25rem] bg-gradient-to-r from-amber-400 to-amber-600 shadow-xl shadow-amber-400/20 active:scale-95 transition-all duration-300"
          >
            <div className="px-10 py-5 bg-indigo-950 rounded-[1.15rem] flex items-center gap-3 text-white font-black text-sm tracking-tight group-hover:bg-transparent transition-colors">
              <Plus size={20} strokeWidth={3} />
              Acquire New Property
            </div>
          </button>
        </div>

        {dashboardError && (
          <div className="glass-card border-red-100 bg-red-50/30 p-6 rounded-[2rem] mb-12 flex items-center gap-4 text-red-900 animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0 font-bold">!</div>
            <p className="font-bold">{dashboardError}</p>
          </div>
        )}

        {/* Stats Cards Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 animate-fade-in-up transition-all delay-100">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-white border border-slate-100 rounded-[2.5rem] animate-pulse"></div>
            ))
          ) : (
            <>
              <div className="glass-card bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-950/5 group hover:bg-indigo-950 transition-all duration-500">
                <div className="flex flex-col justify-between h-full">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <Home className="text-indigo-950 group-hover:text-amber-400 transition-colors" size={24} />
                  </div>
                  <div className="mt-6">
                    <p className="text-slate-400 group-hover:text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Managed Assets</p>
                    <p className="text-3xl font-black text-indigo-950 group-hover:text-white transition-colors">{stats.totalProperties}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-950/5 group hover:bg-indigo-950 transition-all duration-500">
                <div className="flex flex-col justify-between h-full">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <TrendingUp className="text-emerald-600 group-hover:text-amber-400 transition-colors" size={24} />
                  </div>
                  <div className="mt-6">
                    <p className="text-slate-400 group-hover:text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">AUM (Portfolio Value)</p>
                    <div className="flex items-baseline gap-1">
                       <span className="text-3xl font-black text-indigo-950 group-hover:text-white transition-colors">₹{((stats.totalValue || 0) / 100000).toFixed(1)}L</span>
                       <span className="text-xs font-bold text-emerald-500 group-hover:text-amber-400">+4.2%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-950/5 group hover:bg-indigo-950 transition-all duration-500">
                <div className="flex flex-col justify-between h-full">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <Zap className="text-amber-600 group-hover:text-amber-400 transition-colors" size={24} />
                  </div>
                  <div className="mt-6">
                    <p className="text-slate-400 group-hover:text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Strategy Alerts</p>
                    <p className="text-3xl font-black text-indigo-950 group-hover:text-white transition-colors">{stats.pendingRecommendations}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-950/5 group hover:bg-indigo-950 transition-all duration-500">
                <div className="flex flex-col justify-between h-full">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <BarChart3 className="text-purple-600 group-hover:text-amber-400 transition-colors" size={24} />
                  </div>
                  <div className="mt-6">
                    <p className="text-slate-400 group-hover:text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Equity Multiplier</p>
                    <p className="text-3xl font-black text-indigo-950 group-hover:text-white transition-colors">1.4x</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in-up transition-all delay-200">
          {/* Main Portfolio List */}
          <div className="lg:col-span-8 space-y-10">
            <div className="glass-card bg-white border border-slate-100 rounded-[3rem] p-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
                <div>
                   <h2 className="text-3xl font-black text-indigo-950 tracking-tight">Active Portfolio</h2>
                   <p className="text-slate-400 text-sm font-medium mt-1">Found {propertyPagination.count} properties in your network</p>
                </div>
                
                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  <Search className="text-slate-300 ml-3" size={20} />
                  <input 
                    type="text"
                    placeholder="Search ID/Location..."
                    value={propertySearchInput}
                    onChange={e => setPropertySearchInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyPropertySearch()}
                    className="bg-transparent outline-none px-2 py-2 text-sm font-bold text-indigo-950 placeholder:text-slate-300 w-40"
                  />
                  <button onClick={applyPropertySearch} className="px-6 py-2.5 bg-indigo-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-indigo-950/10">
                    Filter
                  </button>
                </div>
              </div>

              {loading ? (
                <SkeletonLoader type="property-list" />
              ) : properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {properties.map(property => (
                    <div key={property.id} className="group relative bg-white border border-slate-200/60 rounded-[2.5rem] p-8 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-950/5 transition-all duration-500 flex flex-col h-full overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-[4rem] group-hover:bg-amber-400/10 transition-colors"></div>
                      
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                           <div className="flex items-center gap-2 mb-2">
                              <MapPin size={10} className="text-slate-300" />
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{property.location?.city || 'India'}</span>
                           </div>
                           <h3 className="text-xl font-black text-indigo-950 group-hover:text-indigo-600 transition-colors leading-tight">{property.title}</h3>
                        </div>
                        <span className={`px-4 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-full border ${
                          property.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          property.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {property.status}
                        </span>
                      </div>
                      
                      <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-8 flex-grow leading-relaxed">{property.description || 'Verified property listing within the GharMulya marketplace.'}</p>
                      
                      <div className="flex flex-wrap gap-4 mb-8">
                         <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500">🏠 {property.propertyType}</div>
                         <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500">🛏️ {property.bedrooms} BHK</div>
                      </div>

                      <div className="flex items-end justify-between pt-8 border-t border-slate-100">
                        <div>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Current Valuation</p>
                          <p className="text-2xl font-black text-indigo-950 tracking-tighter">₹{(Number(property.currentValue) || 0).toLocaleString()}</p>
                        </div>
                        <Link to={`/properties/${property.id}`} className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-950 hover:bg-indigo-950 hover:text-white transition-all duration-300">
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                      
                      {/* Integrated Checklist Preview */}
                      <div className="mt-8 pt-8 border-t border-slate-100">
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Optimization Progress</span>
                            <span className="text-[10px] font-bold text-indigo-950">65% Complete</span>
                         </div>
                         <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 w-[65%] rounded-full shadow-sm shadow-amber-400/20"></div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-950/5">
                     <Plus className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-400 font-bold mb-8">Your property deck is currently empty.</p>
                  <button onClick={() => setShowForm(true)} className="px-10 py-5 bg-indigo-950 text-white rounded-2xl font-black text-sm hover:shadow-2xl transition-all">
                    Initialize First Asset
                  </button>
                </div>
              )}

              {/* Advanced Pagination */}
              {totalPropertyPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-16 pb-4">
                  <button 
                    disabled={propertyPage === 1}
                    onClick={() => setPropertyPage(p => p - 1)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 disabled:opacity-20 hover:border-indigo-950 hover:text-indigo-950 transition-all shadow-sm active:scale-90"
                  >
                    ←
                  </button>
                  <div className="flex items-center gap-2 px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl text-[10px] font-black text-indigo-950 uppercase tracking-widest">
                     Page {propertyPage} of {totalPropertyPages}
                  </div>
                  <button 
                    disabled={!propertyPagination.hasMore}
                    onClick={() => setPropertyPage(p => p + 1)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 disabled:opacity-20 hover:border-indigo-950 hover:text-indigo-950 transition-all shadow-sm active:scale-90"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Market & Intel */}
          <div className="lg:col-span-4 space-y-10">
            {/* Quick Strategic Actions */}
            <div className="glass-card bg-indigo-950 p-8 rounded-[3rem] shadow-2xl shadow-indigo-950/20 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-xl font-black text-white mb-8 flex items-center gap-2 relative z-10 uppercase tracking-tighter">
                <Sparkles className="text-amber-400" size={18} />
                Strategic Access
              </h3>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <button 
                  onClick={() => navigate('/valuation')}
                  className="flex flex-col gap-3 p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-400/50 transition-all duration-300"
                >
                  <BarChart3 className="text-amber-400" size={24} />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest leading-tight">Valuation Engine</span>
                </button>
                <button 
                  onClick={() => navigate('/roi-planner')}
                  className="flex flex-col gap-3 p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-400/50 transition-all duration-300"
                >
                  <TrendingUp className="text-blue-400" size={24} />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest leading-tight">ROI Intelligence</span>
                </button>
                <button 
                  onClick={() => navigate('/recommendations')}
                  className="flex flex-col gap-3 p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-400/50 transition-all duration-300"
                >
                  <Sparkles className="text-emerald-400" size={24} />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest leading-tight">Elite Catalog</span>
                </button>
                <button 
                  onClick={() => navigate('/renovation-tracker')}
                  className="flex flex-col gap-3 p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300"
                >
                  <Clock className="text-purple-400" size={24} />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest leading-tight">Market History</span>
                </button>
              </div>
              <button
                onClick={() => navigate('/portfolio-workspace')}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl border border-amber-400/50 bg-amber-400/10 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-amber-400/20 transition-all"
              >
                <Sparkles size={14} className="text-amber-400" />
                Open Portfolio Workspace
              </button>
            </div>

            {/* Smart Opportunities */}
            <div className="glass-card bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-indigo-950/5">
              <h2 className="text-2xl font-black text-indigo-950 mb-8 tracking-tight">Intelligence Feed</h2>
              <div className="space-y-6">
                {loading ? (
                  [1,2,3].map(i => <div key={i} className="h-24 bg-slate-50 border border-slate-100 rounded-3xl animate-pulse" />)
                ) : recommendations.length > 0 ? (
                  recommendations.slice(0, 3).map(rec => (
                    <div key={rec._id} className="group p-6 border border-slate-100 rounded-[2rem] hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-500 cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-black uppercase text-amber-500 tracking-[0.2em]">{rec.category || 'General'}</span>
                        <TrendingUp className="text-emerald-500" size={14} />
                      </div>
                      <h4 className="text-sm font-black text-indigo-950 line-clamp-1 mb-4 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{rec.title}</h4>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                            <Plus size={10} strokeWidth={3} />
                            ROI: {rec.expectedROI}%
                         </div>
                         <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-indigo-900 shadow-sm group-hover:bg-indigo-950 group-hover:text-white transition-all transform group-hover:translate-x-1">
                            <ChevronRight size={14} />
                         </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 px-6 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No Active Intelligence</p>
                  </div>
                )}
                
                <button 
                  onClick={() => navigate('/recommendations')}
                  className="w-full flex items-center justify-center gap-3 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-indigo-950 uppercase tracking-widest hover:bg-indigo-950 hover:text-white transition-all duration-300"
                >
                  Enter Elite Catalog
                  <ChevronRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Pro Tips / Ad */}
            <div className="relative group overflow-hidden rounded-[3rem]">
               <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 transform group-hover:scale-110 transition-transform duration-700"></div>
               <div className="relative p-10">
                  <BarChart3 className="text-white/20 absolute -right-4 -bottom-4" size={120} />
                  <h4 className="text-indigo-950 text-xl font-black mb-4 relative z-10 leading-tight">Master the <br/><span className="instrument-serif italic text-2xl">Property Market</span></h4>
                  <p className="text-indigo-900/70 text-xs font-bold leading-relaxed mb-6 relative z-10 max-w-[12rem]">
                    Learn how our top investors achieve consistent <span className="font-black text-indigo-950">20%+ CAGR</span> by timing renovations perfectly.
                  </p>
                  <button className="px-6 py-3 bg-indigo-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest relative z-10 hover:shadow-xl transition-all active:scale-95">
                    Unlock Training
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <PropertyFormWizard 
          onClose={() => setShowForm(false)}
          onSuccess={handlePropertyCreated}
        />
      )}
    </div>
  );
};

export default UserDashboard;
