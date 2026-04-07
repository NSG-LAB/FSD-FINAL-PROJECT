import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setRecommendations, setLoading, addRecommendation } from '../redux/recommendationSlice';
import SkeletonLoader from '../components/SkeletonLoader';
import { recommendationAPI, analyticsAPI, showApiErrorToast } from '../services/api';
import { toast } from 'react-toastify';
import { 
  Users, 
  Home, 
  Zap, 
  Bell, 
  Activity, 
  Shield, 
  Database, 
  Plus, 
  X,
  TrendingUp,
  Settings,
  ChevronRight,
  PieChart,
  HardDrive
} from 'lucide-react';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { recommendations, loading: recommendationsLoading } = useSelector(state => state.recommendation);
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [recommendationsError, setRecommendationsError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    overview: null,
    userActivity: null,
    properties: null,
    performance: null
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'kitchen-bathroom',
    description: '',
    benefits: [],
    estimatedCost: { min: 0, max: 0 },
    expectedROI: 0,
    difficulty: 'moderate',
    timeframe: '',
    tips: [],
    applicablePropertyTypes: ['all'],
    applicableConditions: [],
  });

  useEffect(() => {
    fetchRecommendations();
  }, []);

  useEffect(() => {
    if (activeTab === 'recommendations') {
      return;
    }

    const analyticsKey = activeTab === 'activity' ? 'userActivity' : activeTab;
    if (!analyticsData[analyticsKey]) {
      fetchAnalyticsData(activeTab);
    }
  }, [activeTab, analyticsData]);

  const fetchRecommendations = async () => {
    dispatch(setLoading(true));
    setRecommendationsError(null);
    try {
      const response = await recommendationAPI.getRecommendations();
      dispatch(setRecommendations(response.data.recommendations));
    } catch (error) {
      setRecommendationsError('Could not load recommendations at the moment.');
      showApiErrorToast({
        error,
        fallbackMessage: 'Failed to fetch recommendations. Please try again.',
        onRetry: fetchRecommendations,
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchAnalyticsData = async (tab = activeTab) => {
    const requestByTab = {
      overview: analyticsAPI.getOverview,
      activity: analyticsAPI.getUserActivity,
      properties: analyticsAPI.getProperties,
      performance: analyticsAPI.getPerformance,
    };
    const dataKeyByTab = {
      overview: 'overview',
      activity: 'userActivity',
      properties: 'properties',
      performance: 'performance',
    };

    const request = requestByTab[tab];
    const dataKey = dataKeyByTab[tab];
    if (!request || !dataKey) {
      return;
    }

    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const response = await request();

      setAnalyticsData((prev) => ({
        ...prev,
        [dataKey]: response.data.data,
      }));
    } catch (error) {
      setAnalyticsError('Analytics data is currently unavailable for this tab.');
      showApiErrorToast({
        error,
        fallbackMessage: 'Failed to fetch analytics data. Please try again.',
        onRetry: () => fetchAnalyticsData(tab),
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createRecommendation = async (payload) => {
    const response = await recommendationAPI.createRecommendation(payload);
    dispatch(addRecommendation(response.data.recommendation));
    toast.success('Recommendation created successfully!');
    setShowForm(false);
    setFormData({
      title: '',
      category: 'kitchen-bathroom',
      description: '',
      benefits: [],
      estimatedCost: { min: 0, max: 0 },
      expectedROI: 0,
      difficulty: 'moderate',
      timeframe: '',
      tips: [],
      applicablePropertyTypes: ['all'],
      applicableConditions: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };

    try {
      await createRecommendation(payload);
    } catch (error) {
      showApiErrorToast({
        error,
        fallbackMessage: 'Failed to create recommendation. Please try again.',
        onRetry: () => createRecommendation(payload),
      });
    }
  };

  const renderAnalyticsState = (emptyMessage = 'No data available.') => {
    if (analyticsLoading) {
      return (
        <div className="space-y-4">
          <SkeletonLoader type="dashboard-stats" />
          <SkeletonLoader type="table" />
        </div>
      );
    }

    if (analyticsError) {
      return (
        <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">Unable to load analytics</h3>
          <p className="text-red-700 mb-5">{analyticsError}</p>
          <button
            type="button"
            onClick={fetchAnalyticsData}
            className="btn-secondary px-5 py-2.5"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  };

  const renderOverviewTab = () => {
    if (!analyticsData.overview) {
      return renderAnalyticsState('No overview data available yet.');
    }

    const { users, properties, recommendations, notifications } = analyticsData.overview;

    const stats = [
      { label: 'Total Users', value: users.total, change: `+${users.new} this month`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Total Properties', value: properties.total, change: `+${properties.new} this month`, icon: Home, color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Recommendations', value: recommendations.total, change: `${recommendations.active} active`, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Notifications', value: notifications.total, change: `${notifications.unread} unread`, icon: Bell, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass p-6 rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 group">
            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon className={stat.color} size={28} />
            </div>
            <h3 className="text-3xl font-black text-indigo-950 mb-1">{stat.value}</h3>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-xs font-bold text-slate-500">{stat.change}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderUserActivityTab = () => {
    if (!analyticsData.userActivity) {
      return renderAnalyticsState('No user activity data available yet.');
    }

    const { userRegistrations, propertySubmissions, topUsers } = analyticsData.userActivity;

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="ui-card-item rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">User Registrations (Last 30 Days)</h3>
            <div className="space-y-2">
              {userRegistrations.slice(-7).map((reg, index) => (
                <div key={index} className="flex justify-between">
                  <span>{new Date(reg.date).toLocaleDateString()}</span>
                  <span className="font-semibold">{reg.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ui-card-item rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Property Submissions (Last 30 Days)</h3>
            <div className="space-y-2">
              {propertySubmissions.slice(-7).map((sub, index) => (
                <div key={index} className="flex justify-between">
                  <span>{new Date(sub.date).toLocaleDateString()}</span>
                  <span className="font-semibold">{sub.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="ui-card-item rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Top Active Users</h3>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div key={user.id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{user.name}</span>
                  <span className="text-gray-500 text-sm ml-2">({user.email})</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {user.propertyCount} properties
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPropertiesTab = () => {
    if (!analyticsData.properties) {
      return renderAnalyticsState('No property analytics data available yet.');
    }

    const { statusDistribution, locationDistribution, averageValues } = analyticsData.properties;

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="ui-card-item rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Property Status</h3>
            <div className="space-y-2">
              {statusDistribution.map((status, index) => (
                <div key={index} className="flex justify-between">
                  <span className="capitalize">{status.status}</span>
                  <span className="font-semibold">{status.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ui-card-item rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Top Locations</h3>
            <div className="space-y-2">
              {locationDistribution.slice(0, 10).map((loc, index) => (
                <div key={index} className="flex justify-between">
                  <span>{loc.location}</span>
                  <span className="font-semibold">{loc.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ui-card-item rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Average Values by Type</h3>
            <div className="space-y-2">
              {averageValues.map((type, index) => (
                <div key={index} className="flex justify-between">
                  <span className="capitalize">{type.type}</span>
                  <span className="font-semibold">₹{type.avgValue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceTab = () => {
    if (!analyticsData.performance) {
      return renderAnalyticsState('No system performance data available yet.');
    }

    const { system, database, cache } = analyticsData.performance;

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="glass p-8 rounded-[2.5rem] border border-white/50 shadow-xl group">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <HardDrive size={24} />
               </div>
               <h3 className="text-xl font-black text-indigo-950">System Core</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center group/item pb-4 border-b border-slate-50">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded">Uptime</span>
                <span className="text-sm font-bold text-indigo-950">{Math.floor(system.uptime / 3600)}h {Math.floor((system.uptime % 3600) / 60)}m</span>
              </div>
              <div className="flex justify-between items-center group/item pb-4 border-b border-slate-50">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded">Memory</span>
                <span className="text-sm font-bold text-indigo-950">{(system.memoryUsage.heapUsed / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <div className="flex justify-between items-center group/item pb-4 border-b border-slate-50">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded">Engine</span>
                <span className="text-sm font-bold text-indigo-950">Node {system.nodeVersion}</span>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-[2.5rem] border border-white/50 shadow-xl group">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Database size={24} />
               </div>
               <h3 className="text-xl font-black text-indigo-950">Relational Logic</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center group/item pb-4 border-b border-slate-50">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded">Connectivity</span>
                <span className={`text-sm font-black px-3 py-1 rounded-full uppercase tracking-tighter ${database.status === 'connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {database.status?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center group/item pb-4 border-b border-slate-50">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded">Dialect</span>
                <span className="text-sm font-bold text-indigo-950 uppercase">{database.dialect} Engine</span>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-[2.5rem] border border-white/50 shadow-xl group">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Zap size={24} />
               </div>
               <h3 className="text-xl font-black text-indigo-950">Memory Cache</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center group/item pb-4 border-b border-slate-50">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded">Cluster Status</span>
                <span className={`text-sm font-black px-3 py-1 rounded-full uppercase tracking-tighter ${cache.status === 'connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {cache.status?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen ui-page py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-indigo-100 shadow-sm">
            <Shield size={14} /> Administrative Control
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-indigo-950 mb-2">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Command Center</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Monitor platform performance and curate intelligence assets.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 mb-10 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: PieChart },
            { id: 'activity', label: 'User Activity', icon: Activity },
            { id: 'properties', label: 'Properties', icon: Home },
            { id: 'performance', label: 'Performance', icon: Settings },
            { id: 'recommendations', label: 'Recommendations', icon: Zap }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 whitespace-nowrap shadow-sm border ${
                activeTab === tab.id
                  ? 'bg-indigo-950 text-white border-indigo-950 translate-y-[-2px] shadow-lg shadow-indigo-200'
                  : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'activity' && renderUserActivityTab()}
          {activeTab === 'properties' && renderPropertiesTab()}
          {activeTab === 'performance' && renderPerformanceTab()}

          {/* Recommendations Management */}
          {activeTab === 'recommendations' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-indigo-950">Intelligent Recommendations</h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className={`btn-gold px-8 py-3 rounded-2xl font-black transition-all flex items-center gap-2 ${showForm ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-none' : ''}`}
                >
                  {showForm ? <><X size={20} /> Cancel Access</> : <><Plus size={20} /> New Intelligence</>}
                </button>
              </div>

              {showForm && (
                <div className="glass p-8 rounded-[2.5rem] border border-white/50 shadow-2xl mb-12 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">Asset Title</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          placeholder="e.g. Luxury Kitchen Transformation"
                          className="premium-input w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">Category Domain</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="premium-input w-full"
                        >
                          <option value="kitchen-bathroom">Kitchen & Bathroom</option>
                          <option value="flooring">Flooring Systems</option>
                          <option value="wall-paint">Surface Finishing</option>
                          <option value="lighting-fixtures">Ambient Lighting</option>
                          <option value="garden-outdoor">Exterior Landscaping</option>
                          <option value="safety-security">Logic Security</option>
                          <option value="energy-efficiency">Ecological Footprint</option>
                          <option value="interior-design">Spatial Design</option>
                          <option value="electrical-plumbing">Infrastructure</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">Detailed Intelligence</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        required
                        placeholder="Provide high-level strategic reasoning..."
                        className="premium-input w-full"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">Capital Entry (Min ₹)</label>
                        <input
                          type="number"
                          name="costMin"
                          placeholder="50,000"
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            estimatedCost: { ...prev.estimatedCost, min: Number(e.target.value) }
                          }))}
                          className="premium-input w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">Capital Entry (Max ₹)</label>
                        <input
                          type="number"
                          name="costMax"
                          placeholder="2,00,000"
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            estimatedCost: { ...prev.estimatedCost, max: Number(e.target.value) }
                          }))}
                          className="premium-input w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">Projected ROI (%)</label>
                        <input
                          type="number"
                          name="expectedROI"
                          value={formData.expectedROI}
                          onChange={handleChange}
                          placeholder="15"
                          className="premium-input w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">Implementation Difficulty</label>
                        <select
                          name="difficulty"
                          value={formData.difficulty}
                          onChange={handleChange}
                          className="premium-input w-full"
                        >
                          <option value="easy">Optimized (Easy)</option>
                          <option value="moderate">Standard (Moderate)</option>
                          <option value="difficult">Complex (Difficult)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">Estimated Window</label>
                        <input
                          type="text"
                          name="timeframe"
                          value={formData.timeframe}
                          onChange={handleChange}
                          placeholder="e.g. 2-3 Strategic Weeks"
                          className="premium-input w-full"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-gold w-full py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-gold/20 transition-all flex items-center justify-center gap-3"
                    >
                      <span>Inject into Intelligence Engine</span>
                      <ChevronRight size={22} />
                    </button>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {recommendationsLoading ? (
                  [...Array(4)].map((_, index) => (
                    <SkeletonLoader key={index} type="card" className="h-64 rounded-3xl" />
                  ))
                ) : recommendations.length === 0 ? (
                  <div className="col-span-full py-20 text-center glass rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">No strategic assets available. Initiate global intelligence create.</p>
                  </div>
                ) : (
                  recommendations.map(rec => (
                    <div key={rec._id} className="glass p-6 rounded-[2.5rem] border border-slate-50 shadow-lg hover:shadow-2xl transition-all duration-500 group flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                          <Zap size={20} className="text-indigo-600 group-hover:text-white" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full uppercase tracking-wider">{rec.category}</span>
                           <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                             rec.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700' :
                             rec.difficulty === 'moderate' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                           }`}>{rec.difficulty}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-black text-indigo-950 mb-3 group-hover:text-indigo-600 transition-colors">{rec.title}</h3>
                      <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-3 leading-relaxed flex-grow">
                        {rec.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-slate-50">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expected ROI</p>
                          <p className="text-lg font-black text-emerald-600">{rec.expectedROI}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Average Cost</p>
                          <p className="text-lg font-black text-indigo-950">₹{(rec.estimatedCost.min + rec.estimatedCost.max) / 2000}K</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default AdminDashboard;
