import React, { useState } from 'react';
import { reportAPI, valuationAPI } from '../services/api';
import { toast } from 'react-toastify';
import ValuationChart from '../components/ValuationChart';

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
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to estimate value');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    if (!result) {
      return;
    }

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
      link.download = 'valuation-report.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="min-h-screen ui-page py-8">
      <div className="max-w-6xl mx-auto mobile-container">
        <div className="ui-card rounded-xl mobile-card">
          <h2 className="ui-card-title mobile-heading font-bold mb-2">Property Valuation Estimator</h2>
          <p className="mobile-text text-gray-600 mb-6">Estimate your current and improved property value using key property factors.</p>

          <form onSubmit={handleSubmit} className="mobile-form-grid mb-8">
            <div>
              <label className="block mobile-text font-medium text-gray-700 mb-2">Area (sqft)</label>
              <input
                name="areaSqft"
                type="number"
                min="0"
                placeholder="e.g. 1200"
                value={form.areaSqft}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base touch-target"
                required
              />
            </div>

            <div>
              <label className="block mobile-text font-medium text-gray-700 mb-2">Age (years)</label>
              <input
                name="ageYears"
                type="number"
                min="0"
                placeholder="e.g. 5"
                value={form.ageYears}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base touch-target"
                required
              />
            </div>

            <div>
              <label className="block mobile-text font-medium text-gray-700 mb-2">Bedrooms</label>
              <input
                name="bedrooms"
                type="number"
                min="0"
                placeholder="e.g. 3"
                value={form.bedrooms}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base touch-target"
                required
              />
            </div>

            <div>
              <label className="block mobile-text font-medium text-gray-700 mb-2">Bathrooms</label>
              <input
                name="bathrooms"
                type="number"
                min="0"
                placeholder="e.g. 2"
                value={form.bathrooms}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base touch-target"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mobile-text font-medium text-gray-700 mb-2">Condition Score (1-5)</label>
              <div className="flex items-center gap-4 mb-2">
                <input
                  name="conditionScore"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={form.conditionScore}
                  onChange={handleChange}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer touch-target"
                />
                <span className="text-lg font-semibold text-blue-600 min-w-[2rem]">{form.conditionScore}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Very Good</span>
                <span>Excellent</span>
              </div>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 btn-primary px-6 py-4 text-lg font-semibold touch-target disabled:opacity-50"
            >
              {loading ? 'Estimating...' : 'Estimate Value'}
            </button>
            {result && (
              <button
                onClick={exportReport}
                className="flex-1 btn-secondary px-6 py-4 text-lg font-semibold touch-target"
              >
                Export Report
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 mobile-text">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg mobile-card">
              <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-4">Valuation Results</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-gray-700 mb-2">Current Value</h4>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    ₹{result.currentValue?.toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">₹{result.pricePerSqft?.toLocaleString('en-IN')}/sqft</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-700 mb-2">Potential Value</h4>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    ₹{result.potentialValue?.toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">After improvements</p>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">Value Increase Potential</h4>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  ₹{result.valueIncrease?.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {result.percentageIncrease?.toFixed(1)}% increase possible
                </p>
              </div>
            </div>
          )}

          {/* Data Visualization */}
          {result && (
            <ValuationChart valuationResult={result} formData={form} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ValuationEstimator;