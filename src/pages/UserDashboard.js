import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setProperties, setLoading } from '../redux/propertySlice';
import { propertyAPI } from '../services/api';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { properties } = useSelector(state => state.property);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    propertyType: 'apartment',
    age: '',
    builUpArea: '',
    bedrooms: '',
    bathrooms: '',
    location: { city: '', state: '', pincode: '' },
    condition: 'good',
    currentValue: '',
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    dispatch(setLoading(true));
    try {
      const response = await propertyAPI.getProperties();
      dispatch(setProperties(response.data.properties));
    } catch (error) {
      toast.error('Failed to fetch properties');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await propertyAPI.createProperty(formData);
      toast.success('Property submitted successfully!');
      setShowForm(false);
      setFormData({
        title: '',
        propertyType: 'apartment',
        age: '',
        builUpArea: '',
        bedrooms: '',
        bathrooms: '',
        location: { city: '', state: '', pincode: '' },
        condition: 'good',
        currentValue: '',
      });
      fetchProperties();
    } catch (error) {
      toast.error('Failed to submit property');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow border border-slate-200 p-8">
          <h1 className="text-3xl font-bold mb-2">User Dashboard</h1>
          <p className="text-gray-600 mb-6">Track your submitted properties and add new ones for tailored recommendations.</p>

          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-6 bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 font-semibold transition"
          >
            {showForm ? 'Cancel' : 'Submit Property'}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 border-t border-slate-200 pt-6">
              <h2 className="text-2xl font-semibold mb-4">Submit Your Property</h2>

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>apartment</option>
                    <option>house</option>
                    <option>villa</option>
                    <option>townhouse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Built-up Area (sq ft)</label>
                  <input
                    type="number"
                    name="builUpArea"
                    value={formData.builUpArea}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    name="location.pincode"
                    value={formData.location.pincode}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>excellent</option>
                    <option>good</option>
                    <option>average</option>
                    <option>needs-work</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Value (₹)</label>
                  <input
                    type="number"
                    name="currentValue"
                    value={formData.currentValue}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700 font-semibold transition"
              >
                Submit Property
              </button>
            </form>
          )}

          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-2xl font-semibold mb-4">Your Properties ({properties.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map(property => (
                <div key={property._id} className="border border-slate-200 rounded-xl p-5 hover:shadow-lg transition">
                  <h3 className="font-bold text-lg mb-2">{property.title}</h3>
                  <p className="text-gray-600 mb-2">{property.location.city}, {property.location.state}</p>
                  <p className="text-sm text-gray-500">{property.propertyType} • {property.bedrooms} BHK</p>
                  <p className="mt-2 text-green-600 font-semibold">₹{property.currentValue?.toLocaleString()}</p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    {property.status}
                  </span>
                </div>
              ))}
            </div>
            {properties.length === 0 && (
              <p className="text-gray-500 mt-4">No properties yet. Submit your first property to get started.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
