import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { reportAPI, roiAPI } from '../services/api';

const ROIPlanner = () => {
  const [form, setForm] = useState({
    budget: '',
    propertyType: 'apartment',
    propertyCondition: 'good',
    city: '',
    topN: 5,
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await roiAPI.generatePlan({
        budget: Number(form.budget || 0),
        propertyType: form.propertyType,
        propertyCondition: form.propertyCondition,
        city: form.city.trim() || undefined,
        topN: Number(form.topN),
      });

      setPlan(response.data.plan);
      toast.success('ROI plan generated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate ROI plan');
    } finally {
      setLoading(false);
    }
  };

  const exportPlan = async () => {
    if (!plan) {
      return;
    }

    try {
      const response = await reportAPI.exportValuationPdf({
        valuationInput: {
          propertyType: form.propertyType,
          propertyCondition: form.propertyCondition,
          city: form.city,
        },
        valuationResult: {
          currentValue: plan.totalCost,
          improvedValue: plan.totalEstimatedGain,
          confidence: 'medium',
          range: { min: plan.totalCost, max: plan.totalEstimatedGain },
        },
        roiPlan: plan,
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'roi-plan-report.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export ROI report');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow border border-slate-200 p-8">
          <h1 className="text-3xl font-bold mb-2">Improvement ROI Planner</h1>
          <p className="text-gray-600 mb-6">Generate a budget-aware upgrade plan ranked by ROI and payback period.</p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
              <input
                name="budget"
                type="number"
                min="0"
                value={form.budget}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 500000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select
                name="propertyType"
                value={form.propertyType}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="townhouse">Townhouse</option>
                <option value="studio">Studio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                name="propertyCondition"
                value={form.propertyCondition}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="needs-work">Needs Work</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City (optional)</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Hyderabad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Top Recommendations</label>
              <input
                name="topN"
                type="number"
                min="1"
                max="10"
                value={form.topN}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-60 font-semibold transition"
              >
                {loading ? 'Generating...' : 'Generate ROI Plan'}
              </button>
            </div>
          </form>

          {plan && (
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h2 className="text-xl font-semibold mb-4">Plan Summary</h2>
              <button
                type="button"
                onClick={exportPlan}
                className="mb-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 font-medium transition"
              >
                Export PDF Report
              </button>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="font-bold text-lg">₹{plan.totalCost?.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Estimated Gain</p>
                  <p className="font-bold text-lg">₹{plan.totalEstimatedGain?.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Blended ROI</p>
                  <p className="font-bold text-lg">{plan.blendedROI}%</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Selected Items</p>
                  <p className="font-bold text-lg">{plan.selectedCount}</p>
                </div>
              </div>

              <div className="space-y-3">
                {plan.recommendations.map((item) => (
                  <div key={item.id} className="border border-slate-200 rounded-xl p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <span className="text-sm text-gray-600">{item.category} · {item.difficulty}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 text-sm">
                      <p><strong>Cost:</strong> ₹{item.estimatedCost?.toLocaleString()}</p>
                      <p><strong>ROI:</strong> {item.roiPercentage}%</p>
                      <p><strong>Gain:</strong> ₹{item.estimatedGain?.toLocaleString()}</p>
                      <p><strong>Payback:</strong> {item.paybackMonths} mo</p>
                      <p><strong>Duration:</strong> {item.durationMonths} mo</p>
                    </div>
                  </div>
                ))}
              </div>

              {plan.recommendations.length === 0 && (
                <p className="text-gray-500 mt-4">No recommendations fit this budget and filter combination.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ROIPlanner;
