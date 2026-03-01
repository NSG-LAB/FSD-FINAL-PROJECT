import React, { useEffect, useState } from 'react';
import { recommendationAPI } from '../services/api';
import { toast } from 'react-toastify';

const DEFAULT_RECOMMENDATION_PAGE_SIZE = 9;

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ category: '', difficulty: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_RECOMMENDATION_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [pagination, setPagination] = useState({
    count: 0,
    limit: DEFAULT_RECOMMENDATION_PAGE_SIZE,
    offset: 0,
    hasMore: false
  });

  const truncate = (text, length = 110) => {
    if (!text) {
      return 'No description available.';
    }
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  useEffect(() => {
    fetchRecommendations();
  }, [filters, page, pageSize, query]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const response = await recommendationAPI.getRecommendations({
        ...filters,
        q: query,
        limit: pageSize,
        offset,
        sortBy: 'priority',
        order: 'DESC'
      });
      setRecommendations(response.data.recommendations || []);
      setPagination({
        count: response.data.count || 0,
        limit: response.data.limit || pageSize,
        offset: response.data.offset || 0,
        hasMore: Boolean(response.data.hasMore)
      });
    } catch (error) {
      toast.error('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applySearch = () => {
    setPage(1);
    setQuery(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput('');
    setPage(1);
    setQuery('');
  };

  const totalPages = Math.max(1, Math.ceil(pagination.count / pagination.limit));
  const showingFrom = pagination.count === 0 ? 0 : pagination.offset + 1;
  const showingTo = pagination.offset + recommendations.length;

  return (
    <div className="min-h-screen ui-page py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="ui-card rounded-xl p-8">
          <h1 className="ui-card-title text-3xl font-bold mb-2">Property Enhancement Recommendations</h1>
          <p className="text-gray-600 mb-6">Browse improvements by category and difficulty to prioritize your next upgrade.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="kitchen-bathroom">Kitchen & Bathroom</option>
                <option value="flooring">Flooring</option>
                <option value="wall-paint">Wall & Paint</option>
                <option value="lighting-fixtures">Lighting & Fixtures</option>
                <option value="garden-outdoor">Garden & Outdoor</option>
                <option value="safety-security">Safety & Security</option>
                <option value="energy-efficiency">Energy Efficiency</option>
                <option value="interior-design">Interior Design</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Difficulty Levels</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="difficult">Difficult</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    applySearch();
                  }
                }}
                placeholder="Title contains..."
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rows Per Page</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPage(1);
                  setPageSize(Number(e.target.value));
                }}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={9}>9</option>
                <option value={18}>18</option>
                <option value={36}>36</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={applySearch}
                className="btn-secondary px-4 py-2.5 text-sm"
              >
                Search
              </button>
              {query && (
                <button
                  onClick={clearSearch}
                  className="btn-secondary px-4 py-2.5 text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-600 py-10">Loading recommendations...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map(rec => (
                <div key={rec._id} className="ui-card-item rounded-xl p-5 hover:shadow-lg transition">
                  <h3 className="ui-card-title font-bold text-lg mb-2">{rec.title}</h3>
                  <p className="text-gray-600 mb-3 text-sm min-h-[60px]">{truncate(rec.description)}</p>

                  <div className="mb-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{rec.category}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        rec.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        rec.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {rec.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>ROI:</strong> <span className="ui-positive">{rec.expectedROI ?? 0}%</span>
                    </p>
                    {rec.estimatedCost && (
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Cost:</strong> ₹{rec.estimatedCost.min?.toLocaleString()}-₹{rec.estimatedCost.max?.toLocaleString()}
                      </p>
                    )}
                    {rec.timeframe && (
                      <p className="text-sm text-gray-700">
                        <strong>Duration:</strong> {rec.timeframe}
                      </p>
                    )}
                  </div>

                  {rec.benefits && rec.benefits.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Benefits:</p>
                      <ul className="text-xs text-gray-600">
                        {rec.benefits.slice(0, 3).map((benefit, idx) => (
                          <li key={idx}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && recommendations.length === 0 && (
            <p className="text-center text-gray-500 py-10">No recommendations found for the selected filters.</p>
          )}

          {!loading && (
            <p className="mt-4 text-xs text-gray-500 text-center">
              {pagination.count > 0 ? `Showing ${showingFrom}–${showingTo} of ${pagination.count}` : 'Showing 0 of 0'}
            </p>
          )}

          {!loading && pagination.count > pagination.limit && (
            <div className="mt-8 flex items-center justify-between gap-4 border-t border-gray-200 pt-4">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || loading}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!pagination.hasMore || loading}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
