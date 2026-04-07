import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setProperties, setLoading } from '../redux/propertySlice';
import { propertyAPI, recommendationAPI, showApiErrorToast } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import PropertyFormWizard from '../components/PropertyFormWizard';
import SkeletonLoader from '../components/SkeletonLoader';
import EnhancementChecklist from '../components/EnhancementChecklist';

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

      // Calculate stats safely
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

  const clearPropertySearch = () => {
    setPropertySearchInput('');
    setPropertyPage(1);
    setPropertyQuery('');
  };

  const handlePropertyCreated = async () => {
    setShowForm(false);
    setPropertyPage(1);
    await fetchData(1);
  };

  const totalPropertyPages = Math.max(1, Math.ceil(propertyPagination.count / propertyPagination.limit));
  const propertyFrom = propertyPagination.count === 0 ? 0 : propertyPagination.offset + 1;
  const propertyTo = propertyPagination.offset + properties.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">🏠 Property Command Center</h1>
          <p className="text-slate-500 mt-1">
            Welcome back, <span className="text-blue-600 font-semibold">{user?.firstName || 'User'}</span>! Manage your investments and track growth.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <span className="text-lg">+</span> Add Property
          </button>
        </div>
      </div>

      {dashboardError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p>{dashboardError}</p>
        </div>
      )}

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-white">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Your Assets</p>
                <p className="text-2xl font-bold">{stats.totalProperties}</p>
              </div>
              <div className="bg-white/20 p-2.5 rounded-lg text-2xl">🏙️</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-xl shadow-lg shadow-emerald-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Portfolio Value</p>
                <p className="text-2xl font-bold">₹{((stats.totalValue || 0) / 100000).toFixed(1)}L</p>
              </div>
              <div className="bg-white/20 p-2.5 rounded-lg text-2xl">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-xl shadow-lg shadow-amber-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Pending Gains</p>
                <p className="text-2xl font-bold">{stats.pendingRecommendations}</p>
              </div>
              <div className="bg-white/20 p-2.5 rounded-lg text-2xl">💡</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 p-6 rounded-xl shadow-lg shadow-purple-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Improvements</p>
                <p className="text-2xl font-bold">{stats.completedImprovements}</p>
              </div>
              <div className="bg-white/20 p-2.5 rounded-lg text-2xl">🛠️</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions & Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              ⚡ Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button 
                onClick={() => setShowForm(true)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏠</span>
                <span className="text-sm font-semibold text-blue-900">Add Property</span>
              </button>
              <button 
                onClick={() => navigate('/valuation')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-teal-100 bg-teal-50/50 hover:bg-teal-50 hover:border-teal-200 transition-colors group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</span>
                <span className="text-sm font-semibold text-teal-900">Get Valuation</span>
              </button>
              <button 
                onClick={() => navigate('/recommendations')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-200 transition-colors group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">💡</span>
                <span className="text-sm font-semibold text-amber-900">View Tips</span>
              </button>
              <button 
                onClick={() => navigate('/roi-planner')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-200 transition-colors group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📈</span>
                <span className="text-sm font-semibold text-purple-900">ROI Planner</span>
              </button>
            </div>
          </div>

          {/* Properties Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900">Your Properties ({propertyPagination.count})</h2>
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  placeholder="Search..."
                  value={propertySearchInput}
                  onChange={e => setPropertySearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applyPropertySearch()}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button onClick={applyPropertySearch} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                  Search
                </button>
              </div>
            </div>

            {loading ? (
              <SkeletonLoader type="property-list" />
            ) : properties.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {properties.map(property => (
                    <div key={property._id} className="group bg-slate-50 border border-slate-100 rounded-xl p-5 hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{property.title}</h3>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          property.status === 'approved' ? 'bg-green-100 text-green-700' :
                          property.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {property.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs line-clamp-2 mb-4">{property.description || 'No description provided.'}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-600 mb-4">
                        <span>📍 {property.location?.city}</span>
                        <span>🏠 {property.propertyType}</span>
                        <span>🛏️ {property.bedrooms} BHK</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                        <div>
                          <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter">Current Value</p>
                          <p className="text-lg font-bold text-emerald-600">₹{(Number(property.currentValue) || 0).toLocaleString()}</p>
                        </div>
                        <Link to={`/properties/${property._id}`} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:border-blue-500 hover:text-blue-600 transition-all">
                          Manage →
                        </Link>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200/60">
                         <EnhancementChecklist propertyId={property.id || property._id} userId={property.userId} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPropertyPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button 
                      disabled={propertyPage === 1}
                      onClick={() => setPropertyPage(p => p - 1)}
                      className="p-2 border border-slate-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      ←
                    </button>
                    <span className="text-sm font-medium text-slate-600">Page {propertyPage} of {totalPropertyPages}</span>
                    <button 
                      disabled={!propertyPagination.hasMore}
                      onClick={() => setPropertyPage(p => p + 1)}
                      className="p-2 border border-slate-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500 mb-4 font-medium">No properties found. Add your first property to start tracking!</p>
                <button onClick={() => setShowForm(true)} className="btn-primary">Add Property</button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Market Insights */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              🌠 Market Insights
              <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Live</span>
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs text-slate-400 mb-1 font-bold">MARKET TREND</p>
                <p className="text-sm font-medium">Properties in <span className="text-blue-400">Bangalore</span> up 12.5% this quarter.</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs text-slate-400 mb-1 font-bold">HOT IMPROVEMENT</p>
                <p className="text-sm font-medium">Solar panels adding <span className="text-emerald-400">₹2.4L</span> average value on resale.</p>
              </div>
            </div>
            <button onClick={() => navigate('/analytics')} className="w-full mt-6 py-2 bg-blue-600 rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors">
              Full Market Analysis
            </button>
          </div>

          {/* Top Recommendations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">💡 Top Opportunities</h2>
            <div className="space-y-4">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)
              ) : recommendations.length > 0 ? (
                recommendations.slice(0, 3).map(rec => (
                  <div key={rec._id} className="p-3 border border-slate-100 rounded-xl hover:border-amber-200 hover:bg-amber-50/30 transition-all group">
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{rec.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">{rec.difficulty}</span>
                      <span className="text-xs font-bold text-emerald-600">ROI: {rec.expectedROI}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic">No recommendations found.</p>
              )}
              <button 
                onClick={() => navigate('/recommendations')}
                className="w-full text-center text-sm font-bold text-blue-600 hover:text-blue-700 pt-2"
              >
                View all tips →
              </button>
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
