import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setRecommendations, setLoading, addRecommendation } from '../redux/recommendationSlice';
import { recommendationAPI } from '../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { recommendations } = useSelector(state => state.recommendation);
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

  const fetchRecommendations = async () => {
    dispatch(setLoading(true));
    try {
      const response = await recommendationAPI.getRecommendations();
      dispatch(setRecommendations(response.data.recommendations));
    } catch (error) {
      toast.error('Failed to fetch recommendations');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await recommendationAPI.createRecommendation(formData);
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
    } catch (error) {
      toast.error('Failed to create recommendation');
    }
  };

  return (
    <div className="min-h-screen ui-page py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="ui-card rounded-xl p-8">
          <h1 className="ui-card-title text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 mb-6">Create and manage enhancement recommendations for all users.</p>

          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-6 btn-primary px-6 py-2.5"
          >
            {showForm ? 'Cancel' : 'Create Recommendation'}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 border-t border-slate-200 pt-6">
              <h2 className="text-2xl font-semibold mb-4">Create New Recommendation</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>kitchen-bathroom</option>
                    <option>flooring</option>
                    <option>wall-paint</option>
                    <option>lighting-fixtures</option>
                    <option>garden-outdoor</option>
                    <option>safety-security</option>
                    <option>energy-efficiency</option>
                    <option>interior-design</option>
                    <option>electrical-plumbing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Cost (₹)</label>
                  <input
                    type="number"
                    name="costMin"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      estimatedCost: { ...prev.estimatedCost, min: e.target.value }
                    }))}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Cost (₹)</label>
                  <input
                    type="number"
                    name="costMax"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      estimatedCost: { ...prev.estimatedCost, max: e.target.value }
                    }))}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected ROI (%)</label>
                  <input
                    type="number"
                    name="expectedROI"
                    value={formData.expectedROI}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>easy</option>
                    <option>moderate</option>
                    <option>difficult</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
                  <input
                    type="text"
                    name="timeframe"
                    value={formData.timeframe}
                    onChange={handleChange}
                    placeholder="e.g., 2-3 weeks"
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-success py-2.5"
              >
                Create Recommendation
              </button>
            </form>
          )}

          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-2xl font-semibold mb-4">Recommendations ({recommendations.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map(rec => (
                <div key={rec._id} className="ui-card-item rounded-xl p-5 hover:shadow-lg transition">
                  <h3 className="ui-card-title font-bold text-lg mb-2">{rec.title}</h3>
                  <p className="text-gray-600 mb-2 text-sm">{rec.description ? `${rec.description.substring(0, 100)}...` : 'No description available.'}</p>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{rec.category}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{rec.difficulty}</span>
                  </div>
                  <p className="text-sm text-gray-500">ROI: <strong className="ui-positive">{rec.expectedROI}%</strong></p>
                  {rec.estimatedCost && (
                    <p className="text-sm text-gray-500">Cost: ₹{rec.estimatedCost.min?.toLocaleString()} - ₹{rec.estimatedCost.max?.toLocaleString()}</p>
                  )}
                </div>
              ))}
            </div>
            {recommendations.length === 0 && (
              <p className="text-gray-500 mt-4">No recommendations available yet. Create one to get started.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
