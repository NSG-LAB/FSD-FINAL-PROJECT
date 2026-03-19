import React, { useState } from 'react';
import { propertyAPI } from '../services/api';
import { toast } from 'react-toastify';

const PropertyFormWizard = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
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

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Property name and type' },
    { id: 2, title: 'Property Details', description: 'Size and layout' },
    { id: 3, title: 'Location & Condition', description: 'Address and current state' },
    { id: 4, title: 'Valuation', description: 'Current property value' },
  ];

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

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.title.trim() && formData.propertyType;
      case 2:
        return formData.age && formData.builUpArea && formData.bedrooms && formData.bathrooms;
      case 3:
        return formData.location.city.trim() && formData.location.state.trim() && formData.condition;
      case 4:
        return formData.currentValue;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await propertyAPI.createProperty(formData);
      toast.success('Property submitted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      const validationMessage = error?.response?.data?.errors?.[0]?.message;
      const apiMessage = error?.response?.data?.message;
      toast.error(validationMessage || apiMessage || 'Failed to submit property');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-slideUp">
            <div>
              <label className="block mobile-text font-medium text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., My 2BHK Apartment"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Give your property a descriptive name</p>
            </div>
            <div>
              <label className="block mobile-text font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base touch-target transition-all"
              >
                <option value="apartment">🏢 Apartment</option>
                <option value="house">🏠 Independent House</option>
                <option value="villa">🏘️ Villa</option>
                <option value="townhouse">🏘️ Townhouse</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-slideUp">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mobile-text font-medium text-gray-700 mb-2">
                  Property Age (years) *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  min="0"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all"
                  required
                />
              </div>
              <div>
                <label className="block mobile-text font-medium text-gray-700 mb-2">
                  Built-up Area (sq ft) *
                </label>
                <input
                  type="number"
                  name="builUpArea"
                  value={formData.builUpArea}
                  onChange={handleChange}
                  placeholder="e.g., 1200"
                  min="1"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mobile-text font-medium text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="e.g., 2"
                  min="1"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all"
                  required
                />
              </div>
              <div>
                <label className="block mobile-text font-medium text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  placeholder="e.g., 2"
                  min="1"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-slideUp">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mobile-text font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  placeholder="e.g., Mumbai"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all"
                  required
                />
              </div>
              <div>
                <label className="block mobile-text font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  placeholder="e.g., Maharashtra"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all"
                  required
                />
              </div>
              <div>
                <label className="block mobile-text font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  name="location.pincode"
                  value={formData.location.pincode}
                  onChange={handleChange}
                  placeholder="e.g., 400001"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block mobile-text font-medium text-gray-700 mb-2">
                Current Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base touch-target transition-all"
              >
                <option value="excellent">⭐ Excellent - Like new condition</option>
                <option value="good">✅ Good - Well maintained</option>
                <option value="average">⚠️ Average - Needs some repairs</option>
                <option value="needs-work">🔧 Needs Work - Major repairs needed</option>
              </select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-slideUp">
            <div>
              <label className="block mobile-text font-medium text-gray-700 mb-2">
                Current Market Value (₹) *
              </label>
              <input
                type="number"
                name="currentValue"
                value={formData.currentValue}
                onChange={handleChange}
                placeholder="e.g., 5000000"
                min="1"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the current market value of your property. This helps us provide accurate ROI calculations.
              </p>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Property Summary</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Title:</strong> {formData.title || 'Not specified'}</p>
                <p><strong>Type:</strong> {formData.propertyType}</p>
                <p><strong>Size:</strong> {formData.builUpArea || 'N/A'} sq ft</p>
                <p><strong>Location:</strong> {formData.location.city || 'N/A'}, {formData.location.state || 'N/A'}</p>
                <p><strong>Value:</strong> ₹{formData.currentValue ? formData.currentValue.toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Submit Property</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex-1 text-center text-sm font-medium ${
                    step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].description}
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="btn-secondary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary px-6 py-2"
                >
                  Cancel
                </button>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary px-6 py-2"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2"
                  >
                    Submit Property
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyFormWizard;