import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { BarChart3, CheckCircle2, Circle, IndianRupee, Plus } from 'lucide-react';
import { propertyAPI, renovationProjectAPI, showApiErrorToast } from '../services/api';

const parseTaskLines = (value) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((title, index) => ({ id: `task-${Date.now()}-${index}`, title, completed: false }));

const currency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const RenovationTracker = () => {
  const [properties, setProperties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    propertyId: '',
    title: '',
    plannedBudget: '',
    expectedValueUplift: '',
    city: '',
    userGoals: '',
    taskLines: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [propertiesRes, projectsRes] = await Promise.all([
        propertyAPI.getProperties({ limit: 100, offset: 0, sortBy: 'createdAt', order: 'DESC' }),
        renovationProjectAPI.getProjects({ limit: 100, offset: 0 })
      ]);

      const fetchedProperties = propertiesRes?.data?.properties || [];
      setProperties(fetchedProperties);
      setProjects(projectsRes?.data?.projects || []);

      if (!form.propertyId && fetchedProperties.length > 0) {
        setForm((prev) => ({ ...prev, propertyId: fetchedProperties[0].id }));
      }
    } catch (error) {
      showApiErrorToast({
        error,
        fallbackMessage: 'Failed to load renovation tracker data.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        propertyId: form.propertyId,
        title: form.title,
        city: form.city,
        plannedBudget: Number(form.plannedBudget || 0),
        expectedValueUplift: Number(form.expectedValueUplift || 0),
        userGoals: form.userGoals
          .split(',')
          .map((goal) => goal.trim())
          .filter(Boolean),
        tasks: parseTaskLines(form.taskLines)
      };

      await renovationProjectAPI.createProject(payload);
      toast.success('Renovation project created.');

      setForm((prev) => ({
        ...prev,
        title: '',
        plannedBudget: '',
        expectedValueUplift: '',
        city: '',
        userGoals: '',
        taskLines: '',
      }));

      await loadData();
    } catch (error) {
      showApiErrorToast({
        error,
        fallbackMessage: 'Failed to create renovation project.',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateProjectTasks = async (project, nextTasks) => {
    try {
      await renovationProjectAPI.updateTasks(project.id, {
        tasks: nextTasks,
        spentBudget: project.spentBudget,
        expectedValueUplift: project.expectedValueUplift,
        note: 'Task completion updated from tracker UI'
      });

      setProjects((prev) =>
        prev.map((item) => {
          if (item.id !== project.id) {
            return item;
          }

          const completed = nextTasks.filter((task) => task.completed).length;
          const completionPercentage = nextTasks.length
            ? Number(((completed / nextTasks.length) * 100).toFixed(1))
            : 0;

          return {
            ...item,
            tasks: nextTasks,
            completionPercentage
          };
        })
      );
    } catch (error) {
      showApiErrorToast({
        error,
        fallbackMessage: 'Unable to update project tasks.',
      });
    }
  };

  const overall = useMemo(() => {
    const totalPlanned = projects.reduce((sum, item) => sum + Number(item.plannedBudget || 0), 0);
    const totalSpent = projects.reduce((sum, item) => sum + Number(item.spentBudget || 0), 0);
    const avgCompletion = projects.length
      ? Number((projects.reduce((sum, item) => sum + Number(item.completionPercentage || 0), 0) / projects.length).toFixed(1))
      : 0;

    return { totalPlanned, totalSpent, avgCompletion };
  }, [projects]);

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-28 pb-20 px-6">
      <Helmet>
        <title>Renovation Project Tracker | GharMulya</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="glass-card bg-white border border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-indigo-950/5">
          <h1 className="text-3xl md:text-4xl font-black text-indigo-950">Renovation Project Tracker</h1>
          <p className="text-slate-500 mt-3">Track tasks, budgets, completion percentages, and expected value uplift in one place.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-widest font-black text-slate-400">Planned Budget</p>
              <p className="text-2xl font-black text-indigo-950 mt-2">{currency(overall.totalPlanned)}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-widest font-black text-slate-400">Spent Budget</p>
              <p className="text-2xl font-black text-indigo-950 mt-2">{currency(overall.totalSpent)}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-widest font-black text-slate-400">Avg Completion</p>
              <p className="text-2xl font-black text-indigo-950 mt-2">{overall.avgCompletion}%</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreate} className="glass-card bg-white border border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-indigo-950/5 space-y-6">
          <div className="flex items-center gap-2 text-indigo-950 font-black text-lg">
            <Plus size={18} />
            New Renovation Project
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={form.propertyId}
              onChange={(event) => setForm((prev) => ({ ...prev, propertyId: event.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
              required
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>{property.title}</option>
              ))}
            </select>

            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
              placeholder="Project title"
              required
            />

            <input
              value={form.plannedBudget}
              onChange={(event) => setForm((prev) => ({ ...prev, plannedBudget: event.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
              placeholder="Planned budget"
              type="number"
              min="0"
            />

            <input
              value={form.expectedValueUplift}
              onChange={(event) => setForm((prev) => ({ ...prev, expectedValueUplift: event.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
              placeholder="Expected value uplift"
              type="number"
              min="0"
            />

            <input
              value={form.city}
              onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
              placeholder="City"
            />

            <input
              value={form.userGoals}
              onChange={(event) => setForm((prev) => ({ ...prev, userGoals: event.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
              placeholder="Goals (comma separated)"
            />
          </div>

          <textarea
            value={form.taskLines}
            onChange={(event) => setForm((prev) => ({ ...prev, taskLines: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
            rows={4}
            placeholder="Task list (one task per line)"
          />

          <button
            type="submit"
            disabled={saving || loading || !form.propertyId}
            className="px-6 py-3 rounded-xl bg-indigo-950 text-white font-black text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Tracker'}
          </button>
        </form>

        <div className="space-y-6">
          {loading ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-8 text-slate-400 font-bold">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500 font-semibold">
              No renovation projects yet. Create your first tracker above.
            </div>
          ) : (
            projects.map((project) => {
              const tasks = Array.isArray(project.tasks) ? project.tasks : [];

              return (
                <div key={project.id} className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-indigo-950/5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black text-indigo-950">{project.title}</h3>
                      <p className="text-slate-500 text-sm mt-1">{project.property?.title || 'Property'} • {project.city || project.property?.location?.city || 'N/A'}</p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-950 text-xs font-black uppercase tracking-widest">
                      <BarChart3 size={14} />
                      {project.completionPercentage || 0}% Complete
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Planned</p>
                      <p className="text-lg font-black text-indigo-950 mt-1">{currency(project.plannedBudget)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Spent</p>
                      <p className="text-lg font-black text-indigo-950 mt-1">{currency(project.spentBudget)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Expected Uplift</p>
                      <p className="text-lg font-black text-indigo-950 mt-1">{currency(project.expectedValueUplift)}</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    {tasks.length === 0 ? (
                      <p className="text-sm text-slate-500">No tasks added.</p>
                    ) : (
                      tasks.map((task, index) => (
                        <button
                          key={task.id || `${project.id}-task-${index}`}
                          type="button"
                          onClick={() => {
                            const updatedTasks = tasks.map((item, itemIndex) => {
                              if (itemIndex !== index) return item;
                              return { ...item, completed: !item.completed };
                            });
                            updateProjectTasks(project, updatedTasks);
                          }}
                          className="w-full flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                        >
                          {task.completed ? (
                            <CheckCircle2 size={18} className="text-emerald-600" />
                          ) : (
                            <Circle size={18} className="text-slate-400" />
                          )}
                          <span className={`text-sm font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-indigo-950'}`}>
                            {task.title}
                          </span>
                          {!!task.estimatedCost && (
                            <span className="ml-auto inline-flex items-center text-xs font-black text-slate-500">
                              <IndianRupee size={12} />{Number(task.estimatedCost).toLocaleString('en-IN')}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RenovationTracker;
