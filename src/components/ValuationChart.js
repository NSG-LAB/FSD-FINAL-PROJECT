import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ValuationChart = ({ valuationResult, formData }) => {
  if (!valuationResult) return null;

  // Prepare data for improvement breakdown
  const improvementData = valuationResult.improvements?.map((improvement, index) => ({
    name: improvement.title.length > 20 ? improvement.title.substring(0, 20) + '...' : improvement.title,
    cost: improvement.estimatedCost,
    value: improvement.expectedValueIncrease,
    roi: improvement.expectedROI,
    fullName: improvement.title
  })) || [];

  // Prepare data for cost vs value comparison
  const costValueData = [
    {
      name: 'Current Value',
      value: parseFloat(formData.currentValue) || 0,
      fill: '#3b82f6'
    },
    {
      name: 'Potential Value',
      value: valuationResult.improvedValue || 0,
      fill: '#10b981'
    }
  ];

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.fullName || label}</p>
          <p className="text-blue-600">Cost: ₹{payload[0].value?.toLocaleString()}</p>
          <p className="text-green-600">Value Increase: ₹{data.value?.toLocaleString()}</p>
          <p className="text-purple-600">ROI: {data.roi}%</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-blue-600">₹{payload[0].value?.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 mt-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Valuation Analysis</h3>

      {/* Value Comparison Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Current vs Potential Value</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={costValueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
            <Tooltip content={<PieTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600">
          <p><span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>Current Value: ₹{parseFloat(formData.currentValue)?.toLocaleString()}</p>
          <p><span className="inline-block w-3 h-3 bg-green-500 rounded mr-2"></span>Potential Value: ₹{valuationResult.improvedValue?.toLocaleString()}</p>
          <p className="mt-2 font-medium text-green-600">
            Potential Increase: ₹{(valuationResult.improvedValue - parseFloat(formData.currentValue))?.toLocaleString()} ({valuationResult.overallROI?.toFixed(1)}% ROI)
          </p>
        </div>
      </div>

      {/* Improvement Cost Breakdown */}
      {improvementData.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Improvement Cost Analysis</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={improvementData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cost" fill="#ef4444" name="Cost" radius={[2, 2, 0, 0]} />
              <Bar dataKey="value" fill="#10b981" name="Value Increase" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600">
            <p><span className="inline-block w-3 h-3 bg-red-500 rounded mr-2"></span>Cost | <span className="inline-block w-3 h-3 bg-green-500 rounded mr-2"></span>Value Increase</p>
            <p className="mt-2">Hover over bars to see detailed ROI information</p>
          </div>
        </div>
      )}

      {/* ROI Distribution */}
      {improvementData.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">ROI Distribution by Improvement</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={improvementData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, roi }) => `${name}: ${roi}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="roi"
              >
                {improvementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'ROI']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>Distribution of expected ROI across different improvements</p>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">💰 Investment Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">₹{valuationResult.totalImprovementCost?.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Investment</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">₹{valuationResult.totalValueIncrease?.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Value Increase</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{valuationResult.overallROI?.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Overall ROI</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-700">
          <p><strong>Payback Period:</strong> Approximately {Math.ceil(valuationResult.totalImprovementCost / (valuationResult.totalValueIncrease / 12))} months</p>
          <p><strong>Annual Return:</strong> ₹{(valuationResult.totalValueIncrease / 12)?.toLocaleString()} per month</p>
        </div>
      </div>
    </div>
  );
};

export default ValuationChart;