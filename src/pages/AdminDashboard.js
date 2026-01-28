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
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Create Recommendation'}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 border-t pt-6">
              <h2 className="text-2xl font-semibold mb-4">Create New Recommendation</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
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
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Min Cost (₹)</label>
                  <input
                    type="number"
                    name="costMin"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      estimatedCost: { ...prev.estimatedCost, min: e.target.value }
                    }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Cost (₹)</label>
                  <input
                    type="number"
                    name="costMax"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      estimatedCost: { ...prev.estimatedCost, max: e.target.value }
                    }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expected ROI (%)</label>
                  <input
                    type="number"
                    name="expectedROI"
                    value={formData.expectedROI}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option>easy</option>
                    <option>moderate</option>
                    <option>difficult</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timeframe</label>
                  <input
                    type="text"
                    name="timeframe"
                    value={formData.timeframe}
                    onChange={handleChange}
                    placeholder="e.g., 2-3 weeks"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
              >
                Create Recommendation
              </button>
            </form>
          )}

          <div className="border-t pt-6">
            <h2 className="text-2xl font-semibold mb-4">Recommendations ({recommendations.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map(rec => (
                <div key={rec._id} className="border rounded-lg p-4 hover:shadow-lg transition">
                  <h3 className="font-bold text-lg mb-2">{rec.title}</h3>
                  <p className="text-gray-600 mb-2 text-sm">{rec.description.substring(0, 100)}...</p>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{rec.category}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{rec.difficulty}</span>
                  </div>
                  <p className="text-sm text-gray-500">ROI: <strong>{rec.expectedROI}%</strong></p>
                  {rec.estimatedCost && (
                    <p className="text-sm text-gray-500">Cost: ₹{rec.estimatedCost.min?.toLocaleString()} - ₹{rec.estimatedCost.max?.toLocaleString()}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
