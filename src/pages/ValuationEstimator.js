import React, { useState } from 'react';
import { reportAPI, valuationAPI } from '../services/api';
import { toast } from 'react-toastify';

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
      <div className="max-w-6xl mx-auto px-4">
        <div className="ui-card rounded-xl p-8">
          <h2 className="ui-card-title text-3xl font-bold mb-2">Property Valuation Estimator</h2>
          <p className="text-gray-600 mb-6">Estimate your current and improved property value using key property factors.</p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqft)</label>
              <input
                name="areaSqft"
                type="number"
                min="0"
                placeholder="e.g. 1200"
                value={form.areaSqft}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
              <input
                name="ageYears"
                type="number"
                min="0"
                placeholder="e.g. 8"
                value={form.ageYears}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <input
                name="bedrooms"
                type="number"
                min="0"
                placeholder="e.g. 3"
                value={form.bedrooms}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <input
                name="bathrooms"
                type="number"
                min="0"
                placeholder="e.g. 2"
                value={form.bathrooms}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition Score (1-5)</label>
              <input
                name="conditionScore"
                type="number"
                min="1"
                max="5"
                value={form.conditionScore}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-6 py-2.5 disabled:opacity-60"
              >
                {loading ? 'Estimating...' : 'Estimate Value'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-xl font-semibold mb-4">Estimated Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="ui-card-item rounded-lg p-4">
                  <p className="text-sm text-gray-600">Current Value</p>
                  <p className="font-bold text-lg">₹{result.currentValue?.toLocaleString()}</p>
                </div>
                <div className="ui-card-item rounded-lg p-4">
                  <p className="text-sm text-gray-600">Improved Value</p>
                  <p className="ui-positive font-bold text-lg">₹{result.improvedValue?.toLocaleString()}</p>
                </div>
                <div className="ui-card-item rounded-lg p-4">
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className="font-bold text-lg capitalize">{result.confidence}</p>
                </div>
                <div className="ui-card-item rounded-lg p-4">
                  <p className="text-sm text-gray-600">Range</p>
                  <p className="font-bold text-lg">₹{result.range?.min?.toLocaleString()} - ₹{result.range?.max?.toLocaleString()}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={exportReport}
                className="mt-5 px-4 py-2 btn-secondary"
              >
                Export PDF Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValuationEstimator;