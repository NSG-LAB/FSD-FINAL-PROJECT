import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, Filter, LineChart as LineChartIcon, RefreshCw } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { renovationProjectAPI, showApiErrorToast } from '../services/api';

const initialFilters = {
  q: '',
  status: '',
  city: '',
  startDate: '',
  endDate: '',
  minCompletion: '',
  maxCompletion: '',
};

const defaultTableState = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const sortableFields = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' },
  { value: 'title', label: 'Project Title' },
  { value: 'status', label: 'Status' },
  { value: 'city', label: 'City' },
  { value: 'completionPercentage', label: 'Completion %' },
  { value: 'plannedBudget', label: 'Planned Budget' },
  { value: 'spentBudget', label: 'Spent Budget' },
  { value: 'expectedValueUplift', label: 'Expected Uplift' },
];

const currency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const AdminRenovationTrackers = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [projects, setProjects] = useState([]);
  const [analytics, setAnalytics] = useState({ summary: null, timeline: [] });
  const [tableState, setTableState] = useState(defaultTableState);
  const [tableMeta, setTableMeta] = useState({ count: 0, totalPages: 1, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const filterParams = useMemo(() => {
    const entries = Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined);
    return Object.fromEntries(entries);
  }, [filters]);

  const loadData = async (
    nextFilters = appliedFilters,
    nextTableState = tableState,
    { refreshAnalytics = true } = {}
  ) => {
    setLoading(true);
    try {
      const projectRequest = renovationProjectAPI.getProjects({
        ...nextFilters,
        page: nextTableState.page,
        limit: nextTableState.limit,
        sortBy: nextTableState.sortBy,
        sortOrder: nextTableState.sortOrder,
      });

      const analyticsRequest = refreshAnalytics
        ? renovationProjectAPI.getUpliftSpendAnalytics(nextFilters)
        : Promise.resolve(null);

      const [projectsRes, analyticsRes] = await Promise.all([
        projectRequest,
        analyticsRequest,
      ]);

      setProjects(projectsRes?.data?.projects || []);
      setTableMeta({
        count: Number(projectsRes?.data?.count || 0),
        totalPages: Math.max(Number(projectsRes?.data?.totalPages || 1), 1),
        hasMore: Boolean(projectsRes?.data?.hasMore),
      });

      if (analyticsRes) {
        setAnalytics({
          summary: analyticsRes?.data?.summary || null,
          timeline: analyticsRes?.data?.timeline || [],
        });
      }
    } catch (error) {
      showApiErrorToast({
        error,
        fallbackMessage: 'Failed to load admin renovation tracker view.',
        onRetry: () => loadData(nextFilters, nextTableState, { refreshAnalytics }),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData({}, defaultTableState, { refreshAnalytics: true });
  }, []);

  const applyFilters = async () => {
    const nextFilters = filterParams;
    const nextTableState = { ...tableState, page: 1 };
    setAppliedFilters(nextFilters);
    setTableState(nextTableState);
    await loadData(nextFilters, nextTableState, { refreshAnalytics: true });
  };

  const resetFilters = async () => {
    setFilters(initialFilters);
    setAppliedFilters({});
    setTableState(defaultTableState);
    await loadData({}, defaultTableState, { refreshAnalytics: true });
  };

  const updateTableState = async (updates) => {
    const nextTableState = {
      ...tableState,
      ...updates,
    };

    setTableState(nextTableState);
    await loadData(appliedFilters, nextTableState, { refreshAnalytics: false });
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const response = await renovationProjectAPI.exportProjectsCsv(appliedFilters);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `renovation-trackers-${Date.now()}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showApiErrorToast({
        error,
        fallbackMessage: 'Failed to export renovation trackers CSV.',
      });
    } finally {
      setExporting(false);
    }
  };

  const summary = analytics.summary || {
    projectCount: 0,
    plannedBudget: 0,
    spentBudget: 0,
    expectedValueUplift: 0,
    avgCompletion: 0,
  };

  const currentStart = tableMeta.count === 0 ? 0 : (tableState.page - 1) * tableState.limit + 1;
  const currentEnd = tableMeta.count === 0
    ? 0
    : Math.min((tableState.page - 1) * tableState.limit + projects.length, tableMeta.count);

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-28 pb-20 px-6">
      <Helmet>
        <title>Admin Renovation Trackers | GharMulya</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="glass-card bg-white border border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-indigo-950/5">
          <h1 className="text-3xl md:text-4xl font-black text-indigo-950 tracking-tight">
            Admin Renovation Tracker View
          </h1>
          <p className="text-slate-500 mt-2">
            Filter all renovation trackers, export results, and monitor uplift vs spend trends over time.
          </p>
        </div>

        <div className="glass-card bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-xl shadow-indigo-950/5">
          <div className="flex items-center gap-2 text-indigo-950 font-black text-lg mb-5">
            <Filter size={18} />
            Filters
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              value={filters.q}
              onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
              placeholder="Search title/description"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
            >
              <option value="">All statuses</option>
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
            <input
              value={filters.city}
              onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="City"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
            />
            <input
              value={filters.minCompletion}
              onChange={(e) => setFilters((prev) => ({ ...prev, minCompletion: e.target.value }))}
              type="number"
              min="0"
              max="100"
              placeholder="Min completion %"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
            />
            <input
              value={filters.maxCompletion}
              onChange={(e) => setFilters((prev) => ({ ...prev, maxCompletion: e.target.value }))}
              type="number"
              min="0"
              max="100"
              placeholder="Max completion %"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
            />
            <input
              value={filters.startDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              type="date"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
            />
            <input
              value={filters.endDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              type="date"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              type="button"
              onClick={applyFilters}
              className="px-5 py-3 rounded-xl bg-indigo-950 text-white text-xs font-black uppercase tracking-widest"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest"
            >
              <RefreshCw size={14} /> Reset
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-60"
            >
              <Download size={14} /> {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-lg shadow-indigo-950/5">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Projects</p>
            <p className="text-2xl font-black text-indigo-950 mt-2">{summary.projectCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-lg shadow-indigo-950/5">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Planned</p>
            <p className="text-2xl font-black text-indigo-950 mt-2">{currency(summary.plannedBudget)}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-lg shadow-indigo-950/5">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Spent</p>
            <p className="text-2xl font-black text-indigo-950 mt-2">{currency(summary.spentBudget)}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-lg shadow-indigo-950/5">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Expected Uplift</p>
            <p className="text-2xl font-black text-indigo-950 mt-2">{currency(summary.expectedValueUplift)}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-lg shadow-indigo-950/5">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Avg Completion</p>
            <p className="text-2xl font-black text-indigo-950 mt-2">{summary.avgCompletion}%</p>
          </div>
        </div>

        <div className="glass-card bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-xl shadow-indigo-950/5">
          <div className="flex items-center gap-2 text-indigo-950 font-black text-lg mb-4">
            <LineChartIcon size={18} />
            Uplift vs Spend Over Time
          </div>

          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.timeline || []} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => currency(value)}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="spentBudget" name="Spent Budget" stroke="#2563EB" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="expectedValueUplift" name="Expected Value Uplift" stroke="#16A34A" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-xl shadow-indigo-950/5 overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-black text-indigo-950">All Renovation Trackers</h2>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={tableState.sortBy}
                onChange={(e) => updateTableState({ sortBy: e.target.value, page: 1 })}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"
              >
                {sortableFields.map((field) => (
                  <option key={field.value} value={field.value}>{field.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => updateTableState({ sortOrder: tableState.sortOrder === 'asc' ? 'desc' : 'asc', page: 1 })}
                className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest"
              >
                {tableState.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </button>
              <select
                value={tableState.limit}
                onChange={(e) => updateTableState({ limit: Number(e.target.value), page: 1 })}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
          {loading ? (
            <p className="text-slate-500 font-semibold">Loading trackers...</p>
          ) : projects.length === 0 ? (
            <p className="text-slate-500 font-semibold">No trackers found for current filters.</p>
          ) : (
            <>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    <th className="py-3 pr-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Project</th>
                    <th className="py-3 pr-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">User</th>
                    <th className="py-3 pr-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                    <th className="py-3 pr-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Completion</th>
                    <th className="py-3 pr-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Planned</th>
                    <th className="py-3 pr-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Spent</th>
                    <th className="py-3 pr-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Uplift</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b border-slate-50">
                      <td className="py-3 pr-4 text-indigo-950 font-bold">
                        {project.title}
                        <p className="text-xs font-medium text-slate-500 mt-1">{project.property?.title || 'Property'} • {project.city || 'N/A'}</p>
                      </td>
                      <td className="py-3 pr-4 text-slate-700 font-semibold">{project.owner?.email || 'N/A'}</td>
                      <td className="py-3 pr-4 text-slate-700 font-semibold capitalize">{project.status}</td>
                      <td className="py-3 pr-4 text-slate-700 font-semibold">{Number(project.completionPercentage || 0)}%</td>
                      <td className="py-3 pr-4 text-slate-700 font-semibold">{currency(project.plannedBudget)}</td>
                      <td className="py-3 pr-4 text-slate-700 font-semibold">{currency(project.spentBudget)}</td>
                      <td className="py-3 pr-4 text-slate-700 font-semibold">{currency(project.expectedValueUplift)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs md:text-sm font-semibold text-slate-500">
                  Showing {currentStart}-{currentEnd} of {tableMeta.count}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={tableState.page <= 1}
                    onClick={() => updateTableState({ page: tableState.page - 1 })}
                    className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <p className="text-xs font-bold text-slate-600 px-2">
                    Page {tableState.page} of {tableMeta.totalPages}
                  </p>
                  <button
                    type="button"
                    disabled={tableState.page >= tableMeta.totalPages}
                    onClick={() => updateTableState({ page: tableState.page + 1 })}
                    className="px-3 py-2 rounded-xl bg-indigo-950 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRenovationTrackers;
