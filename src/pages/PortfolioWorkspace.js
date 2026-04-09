import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import {
  AlertTriangle,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Flag,
  LineChart,
  Plus,
  RefreshCw,
  Save,
  ShieldAlert,
  Upload,
  UserPlus,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  notificationAPI,
  propertyAPI,
  renovationProjectAPI,
  showApiErrorToast,
} from '../services/api';

const ARCHIVE_KEY = 'portfolio_archived_property_ids_v1';
const SCENARIOS_KEY = 'portfolio_saved_scenarios_v1';
const MEDIA_KEY = 'portfolio_media_entries_v1';
const COLLAB_KEY = 'portfolio_collab_state_v1';
const ANOMALY_KEY = 'portfolio_anomaly_reviews_v1';
const LOW_COMPLETION_THRESHOLD = 40;
const HIGH_SPEND_RATIO = 0.7;

const cityTrendMap = {
  Mumbai: 1.08,
  Pune: 1.06,
  Bengaluru: 1.09,
  Hyderabad: 1.07,
  Delhi: 1.05,
  Chennai: 1.06,
};

const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    return JSON.parse(value);
  } catch (_) {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
};

const currency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const confidenceFromScenario = (scenario) => {
  const uplift = Number(scenario.expectedUplift || 0);
  const cost = Number(scenario.cost || 0);
  const timeline = Number(scenario.timelineMonths || 0);
  const roi = cost > 0 ? ((uplift - cost) / cost) * 100 : 0;

  if (scenario.risk === 'high' || roi < 10 || timeline > 18) return 'Low';
  if (scenario.risk === 'medium' || roi < 25 || timeline > 12) return 'Medium';
  return 'High';
};

const createCsvAndDownload = (filename, rows) => {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

const PortfolioWorkspace = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [archivedIds, setArchivedIds] = useState(() => readJson(ARCHIVE_KEY, []));
  const [scenarios, setScenarios] = useState(() => readJson(SCENARIOS_KEY, []));
  const [mediaEntries, setMediaEntries] = useState(() => readJson(MEDIA_KEY, []));
  const [collabState, setCollabState] = useState(() =>
    readJson(COLLAB_KEY, {
      members: [],
      tasks: [],
      comments: [],
      activities: [],
    })
  );
  const [anomalyReviews, setAnomalyReviews] = useState(() => readJson(ANOMALY_KEY, []));
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    type: 'apartment',
    city: '',
    state: '',
    purchasePrice: '',
    currentValue: '',
  });
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [scenarioForm, setScenarioForm] = useState({
    name: '',
    propertyId: '',
    cost: '',
    timelineMonths: '',
    expectedUplift: '',
    risk: 'medium',
  });
  const [compareIds, setCompareIds] = useState([]);
  const [mediaForm, setMediaForm] = useState({
    propertyId: '',
    category: 'invoice',
    linkedItem: '',
    notes: '',
  });
  const [selectedFileName, setSelectedFileName] = useState('');
  const [memberForm, setMemberForm] = useState({ name: '', email: '', role: 'contractor' });
  const [taskForm, setTaskForm] = useState({ title: '', assignee: '', propertyId: '', dueDate: '' });
  const [commentForm, setCommentForm] = useState({ propertyId: '', text: '' });
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [propertyRes, projectRes] = await Promise.all([
          propertyAPI.getProperties({ limit: 200, offset: 0, sortBy: 'createdAt', order: 'DESC' }),
          renovationProjectAPI.getProjects({ limit: 200, offset: 0 }),
        ]);
        const fetchedProperties = propertyRes?.data?.properties || [];
        const fetchedProjects = projectRes?.data?.projects || [];
        setProperties(fetchedProperties);
        setProjects(fetchedProjects);

      } catch (error) {
        showApiErrorToast({
          error,
          fallbackMessage: 'Unable to load workspace data.',
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const defaultPropertyId = properties[0]?.id;
    if (!defaultPropertyId) return;

    setScenarioForm((prev) => (prev.propertyId ? prev : { ...prev, propertyId: defaultPropertyId }));
    setMediaForm((prev) => (prev.propertyId ? prev : { ...prev, propertyId: defaultPropertyId }));
  }, [properties]);

  useEffect(() => {
    writeJson(ARCHIVE_KEY, archivedIds);
  }, [archivedIds]);

  useEffect(() => {
    writeJson(SCENARIOS_KEY, scenarios);
  }, [scenarios]);

  useEffect(() => {
    writeJson(MEDIA_KEY, mediaEntries);
  }, [mediaEntries]);

  useEffect(() => {
    writeJson(COLLAB_KEY, collabState);
  }, [collabState]);

  useEffect(() => {
    writeJson(ANOMALY_KEY, anomalyReviews);
  }, [anomalyReviews]);

  const activeProperties = useMemo(
    () => properties.filter((property) => !archivedIds.includes(property.id)),
    [properties, archivedIds]
  );

  const portfolioSummary = useMemo(() => {
    const totalCurrentValue = activeProperties.reduce((sum, item) => sum + Number(item.currentValue || 0), 0);
    const totalPurchaseValue = activeProperties.reduce((sum, item) => sum + Number(item.purchasePrice || 0), 0);
    const scenarioRoiAvg =
      scenarios.length === 0
        ? 0
        : scenarios.reduce((sum, item) => {
            const cost = Number(item.cost || 0);
            const uplift = Number(item.expectedUplift || 0);
            return sum + (cost > 0 ? ((uplift - cost) / cost) * 100 : 0);
          }, 0) / scenarios.length;

    const riskScoreBase = scenarios.reduce((sum, item) => {
      if (item.risk === 'high') return sum + 35;
      if (item.risk === 'medium') return sum + 20;
      return sum + 10;
    }, 0);

    return {
      activeCount: activeProperties.length,
      archivedCount: archivedIds.length,
      totalCurrentValue,
      appreciation: totalCurrentValue - totalPurchaseValue,
      averageRoi: Number(scenarioRoiAvg.toFixed(1)),
      riskScore: Math.min(100, scenarios.length ? Math.round(riskScoreBase / scenarios.length) : 0),
    };
  }, [activeProperties, archivedIds.length, scenarios]);

  const compareScenarios = useMemo(
    () => scenarios.filter((scenario) => compareIds.includes(scenario.id)),
    [compareIds, scenarios]
  );

  const generatedAlerts = useMemo(() => {
    const scenarioAlerts = scenarios.flatMap((scenario) => {
      const cost = Number(scenario.cost || 0);
      const uplift = Number(scenario.expectedUplift || 0);
      const timeline = Number(scenario.timelineMonths || 0);
      const alerts = [];

      if (cost > uplift) {
        alerts.push({
          id: `budget-${scenario.id}`,
          type: 'budget-overrun',
          severity: 'high',
          title: `${scenario.name}: projected spend exceeds expected uplift`,
          action: 'Re-scope tasks and renegotiate vendor quotes.',
        });
      }

      if (timeline > 12) {
        alerts.push({
          id: `timeline-${scenario.id}`,
          type: 'timeline-delay',
          severity: timeline > 18 ? 'high' : 'medium',
          title: `${scenario.name}: delivery timeline risk (${timeline} months)`,
          action: 'Split into phases and assign milestone owners.',
        });
      }

      return alerts;
    });

    const projectAlerts = projects
      .filter((project) =>
        Number(project.completionPercentage || 0) < LOW_COMPLETION_THRESHOLD
        && Number(project.spentBudget || 0) > Number(project.plannedBudget || 0) * HIGH_SPEND_RATIO
      )
      .map((project) => ({
        id: `project-${project.id}`,
        type: 'execution-risk',
        severity: 'high',
        title: `${project.title}: low completion with high spend`,
        action: 'Trigger weekly review and freeze non-essential tasks.',
      }));

    const bestAction = compareScenarios
      .map((scenario) => {
        const cost = Number(scenario.cost || 0);
        const uplift = Number(scenario.expectedUplift || 0);
        const roi = cost > 0 ? ((uplift - cost) / cost) * 100 : -999;
        return { scenario, roi };
      })
      .sort((a, b) => b.roi - a.roi)[0];

    const recommendation = {
      id: 'best-next-action',
      type: 'best-next-action',
      severity: 'info',
      title: bestAction
        ? `Prioritize "${bestAction.scenario.name}" (ROI ${bestAction.roi.toFixed(1)}%)`
        : 'Add and compare scenarios to generate a best next action.',
      action: bestAction
        ? 'Convert this scenario into assigned tasks and milestone dates.'
        : 'Create at least 2 scenarios and select them in compare mode.',
    };

    return [...scenarioAlerts, ...projectAlerts, recommendation];
  }, [projects, scenarios, compareScenarios]);

  const riskCandidates = useMemo(
    () => generatedAlerts.filter((item) => item.severity === 'high'),
    [generatedAlerts]
  );

  const marketTrendRows = useMemo(() => {
    const grouped = activeProperties.reduce((acc, property) => {
      const city = property.location?.city || property.city || 'Unknown';
      if (!acc[city]) {
        acc[city] = { city, count: 0, value: 0 };
      }
      acc[city].count += 1;
      acc[city].value += Number(property.currentValue || 0);
      return acc;
    }, {});

    return Object.values(grouped).map((row) => {
      const trendMultiplier = cityTrendMap[row.city] || 1.04;
      return {
        ...row,
        trendMultiplier,
        projectedQuarterValue: Math.round(row.value * trendMultiplier),
      };
    });
  }, [activeProperties]);

  const assignedTaskItems = useMemo(
    () => (collabState.tasks.length === 0
      ? <p className="text-xs text-slate-500">No tasks assigned.</p>
      : collabState.tasks.map((task) => (
        <div key={task.id} className="text-xs mb-2 pb-2 border-b border-slate-200">
          <p className="font-bold text-slate-800">{task.title}</p>
          <p className="text-slate-500">{task.assigneeName} • Due {task.dueDate || 'TBD'}</p>
        </div>
      ))),
    [collabState.tasks]
  );

  const recentActivityItems = useMemo(
    () => (collabState.activities.length === 0
      ? <p className="text-xs text-slate-500">No activity yet.</p>
      : collabState.activities.map((item) => (
        <div key={item.id} className="text-xs mb-2 pb-2 border-b border-slate-200">
          <p className="font-semibold text-slate-700">{item.text}</p>
          <p className="text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
        </div>
      ))),
    [collabState.activities]
  );

  const addActivity = (text) => {
    setCollabState((prev) => ({
      ...prev,
      activities: [
        {
          id: `activity-${Date.now()}`,
          text,
          createdAt: new Date().toISOString(),
        },
        ...prev.activities,
      ].slice(0, 30),
    }));
  };

  const submitProperty = async (event) => {
    event.preventDefault();
    const payload = {
      title: propertyForm.title,
      propertyType: propertyForm.type,
      purchasePrice: Number(propertyForm.purchasePrice || 0),
      currentValue: Number(propertyForm.currentValue || 0),
      location: {
        city: propertyForm.city,
        state: propertyForm.state,
      },
    };

    try {
      if (editingPropertyId) {
        await propertyAPI.updateProperty(editingPropertyId, payload);
        toast.success('Property updated.');
      } else {
        await propertyAPI.createProperty(payload);
        toast.success('Property created.');
      }

      const response = await propertyAPI.getProperties({ limit: 200, offset: 0, sortBy: 'createdAt', order: 'DESC' });
      setProperties(response?.data?.properties || []);
      setPropertyForm({
        title: '',
        type: 'apartment',
        city: '',
        state: '',
        purchasePrice: '',
        currentValue: '',
      });
      setEditingPropertyId(null);
    } catch (error) {
      showApiErrorToast({ error, fallbackMessage: 'Unable to save property.' });
    }
  };

  const beginEditProperty = (property) => {
    setEditingPropertyId(property.id);
    setPropertyForm({
      title: property.title || '',
      type: property.propertyType || 'apartment',
      city: property.location?.city || '',
      state: property.location?.state || '',
      purchasePrice: String(property.purchasePrice || ''),
      currentValue: String(property.currentValue || ''),
    });
  };

  const toggleArchive = (id) => {
    setArchivedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const saveScenario = (event) => {
    event.preventDefault();
    if (!scenarioForm.propertyId) {
      toast.error('Select a property first.');
      return;
    }

    setScenarios((prev) => [
      {
        id: `scenario-${Date.now()}`,
        name: scenarioForm.name,
        propertyId: scenarioForm.propertyId,
        cost: Number(scenarioForm.cost || 0),
        timelineMonths: Number(scenarioForm.timelineMonths || 0),
        expectedUplift: Number(scenarioForm.expectedUplift || 0),
        risk: scenarioForm.risk,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setScenarioForm((prev) => ({
      ...prev,
      name: '',
      cost: '',
      timelineMonths: '',
      expectedUplift: '',
      risk: 'medium',
    }));
  };

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const createReminderFromAlert = async (alert) => {
    const payload = {
      title: `Automation Alert: ${alert.type}`,
      message: `${alert.title} — ${alert.action}`,
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    try {
      await notificationAPI.createReminder(payload);
      toast.success('Reminder created from alert.');
    } catch (error) {
      showApiErrorToast({
        error,
        fallbackMessage: 'Unable to create reminder from alert.',
      });
    }
  };

  const submitMedia = (event) => {
    event.preventDefault();
    if (!selectedFileName) {
      toast.error('Select a file first.');
      return;
    }

    setMediaEntries((prev) => [
      {
        id: `media-${Date.now()}`,
        propertyId: mediaForm.propertyId,
        category: mediaForm.category,
        linkedItem: mediaForm.linkedItem,
        notes: mediaForm.notes,
        fileName: selectedFileName,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setSelectedFileName('');
    setMediaForm((prev) => ({ ...prev, linkedItem: '', notes: '' }));
    toast.success('Document metadata linked successfully.');
  };

  const addMember = (event) => {
    event.preventDefault();
    setCollabState((prev) => ({
      ...prev,
      members: [
        {
          id: `member-${Date.now()}`,
          name: memberForm.name,
          email: memberForm.email,
          role: memberForm.role,
          status: 'invited',
        },
        ...prev.members,
      ],
    }));
    addActivity(`Invited ${memberForm.name} as ${memberForm.role}.`);
    setMemberForm({ name: '', email: '', role: 'contractor' });
  };

  const addTask = (event) => {
    event.preventDefault();
    const assignee = collabState.members.find((member) => member.id === taskForm.assignee);

    setCollabState((prev) => ({
      ...prev,
      tasks: [
        {
          id: `task-${Date.now()}`,
          title: taskForm.title,
          assigneeId: taskForm.assignee,
          assigneeName: assignee?.name || 'Unassigned',
          propertyId: taskForm.propertyId,
          dueDate: taskForm.dueDate,
          status: 'open',
        },
        ...prev.tasks,
      ],
    }));

    addActivity(`Task assigned: ${taskForm.title}${assignee?.name ? ` → ${assignee.name}` : ''}.`);
    setTaskForm({ title: '', assignee: '', propertyId: '', dueDate: '' });
  };

  const addComment = (event) => {
    event.preventDefault();
    setCollabState((prev) => ({
      ...prev,
      comments: [
        {
          id: `comment-${Date.now()}`,
          propertyId: commentForm.propertyId,
          text: commentForm.text,
          author: user?.firstName || 'Team Member',
          createdAt: new Date().toISOString(),
        },
        ...prev.comments,
      ],
    }));

    addActivity('New collaboration comment added.');
    setCommentForm({ propertyId: '', text: '' });
  };

  const resolveAnomaly = (id) => {
    setAnomalyReviews((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'reviewed' } : item))
    );
  };

  const refreshAnomaliesFromRisks = () => {
    const autoQueue = riskCandidates.map((item) => ({
      id: item.id,
      title: item.title,
      action: item.action,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }));
    setAnomalyReviews(autoQueue);
    toast.success('Anomaly queue refreshed from current risk alerts.');
  };

  const exportCsvReport = () => {
    const rows = [
      ['Section', 'Metric', 'Value'],
      ['Portfolio', 'Active Properties', portfolioSummary.activeCount],
      ['Portfolio', 'Archived Properties', portfolioSummary.archivedCount],
      ['Portfolio', 'Total Current Value', portfolioSummary.totalCurrentValue],
      ['Portfolio', 'Appreciation', portfolioSummary.appreciation],
      ['Portfolio', 'Average Scenario ROI %', portfolioSummary.averageRoi],
      ['Portfolio', 'Risk Score', portfolioSummary.riskScore],
      ...scenarios.map((scenario) => [
        'Scenario',
        scenario.name,
        `Cost ${scenario.cost} | Uplift ${scenario.expectedUplift} | Timeline ${scenario.timelineMonths} months | Confidence ${confidenceFromScenario(scenario)}`,
      ]),
    ];

    createCsvAndDownload(`portfolio-workspace-${Date.now()}.csv`, rows);
  };

  const exportPdfSummary = () => {
    const html = `
      <html>
        <head><title>Portfolio Workspace Summary</title></head>
        <body style="font-family: Arial; padding: 24px;">
          <h1>Portfolio Workspace Summary</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <h2>Portfolio</h2>
          <ul>
            <li>Active Properties: ${portfolioSummary.activeCount}</li>
            <li>Archived Properties: ${portfolioSummary.archivedCount}</li>
            <li>Total Current Value: ${currency(portfolioSummary.totalCurrentValue)}</li>
            <li>Appreciation: ${currency(portfolioSummary.appreciation)}</li>
            <li>Average Scenario ROI: ${portfolioSummary.averageRoi}%</li>
            <li>Risk Score: ${portfolioSummary.riskScore}/100</li>
          </ul>
          <h2>Alerts</h2>
          <ul>
            ${generatedAlerts.map((alert) => `<li>${alert.title} — ${alert.action}</li>`).join('')}
          </ul>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      toast.error('Popup blocked. Allow popups for this site, or use Export CSV as a fallback.');
      return;
    }

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const resetOnboarding = () => {
    if (!user?.id) return;
    localStorage.removeItem(`onboarding_completed_${user.id}`);
    toast.success('Onboarding walkthrough reset. It will re-open on Home.');
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-28 pb-20 px-6">
      <Helmet>
        <title>Portfolio Workspace | GharMulya</title>
        <meta
          name="description"
          content="Unified workspace for portfolio management, scenario planning, collaboration, and admin controls."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="glass-card bg-white border border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-indigo-950/5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-indigo-950">Portfolio Workspace</h1>
              <p className="text-slate-500 mt-2">
                End-to-end command center for portfolio management, compare modeling, collaboration, and operational controls.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportCsvReport}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest"
              >
                <Download size={14} /> Export CSV
              </button>
              <button
                type="button"
                onClick={exportPdfSummary}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-950 text-white text-xs font-black uppercase tracking-widest"
              >
                <FileText size={14} /> Export PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mt-7">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Active Assets</p>
              <p className="text-2xl font-black text-indigo-950 mt-2">{portfolioSummary.activeCount}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Archived</p>
              <p className="text-2xl font-black text-indigo-950 mt-2">{portfolioSummary.archivedCount}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Portfolio Value</p>
              <p className="text-2xl font-black text-indigo-950 mt-2">{currency(portfolioSummary.totalCurrentValue)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Appreciation</p>
              <p className="text-2xl font-black text-indigo-950 mt-2">{currency(portfolioSummary.appreciation)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Avg ROI</p>
              <p className="text-2xl font-black text-indigo-950 mt-2">{portfolioSummary.averageRoi}%</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Risk Score</p>
              <p className="text-2xl font-black text-indigo-950 mt-2">{portfolioSummary.riskScore}/100</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-indigo-950/5">
            <h2 className="text-xl font-black text-indigo-950 flex items-center gap-2">
              <Building2 size={18} /> Property Portfolio Management
            </h2>
            <form onSubmit={submitProperty} className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
              <input
                value={propertyForm.title}
                onChange={(e) => setPropertyForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Property title"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                required
              />
              <select
                value={propertyForm.type}
                onChange={(e) => setPropertyForm((prev) => ({ ...prev, type: e.target.value }))}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="commercial">Commercial</option>
              </select>
              <input
                value={propertyForm.city}
                onChange={(e) => setPropertyForm((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="City"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <input
                value={propertyForm.state}
                onChange={(e) => setPropertyForm((prev) => ({ ...prev, state: e.target.value }))}
                placeholder="State"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <input
                type="number"
                min="0"
                value={propertyForm.purchasePrice}
                onChange={(e) => setPropertyForm((prev) => ({ ...prev, purchasePrice: e.target.value }))}
                placeholder="Purchase price"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <input
                type="number"
                min="0"
                value={propertyForm.currentValue}
                onChange={(e) => setPropertyForm((prev) => ({ ...prev, currentValue: e.target.value }))}
                placeholder="Current value"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <button
                type="submit"
                className="md:col-span-2 inline-flex justify-center items-center gap-2 px-4 py-3 rounded-xl bg-indigo-950 text-white text-xs font-black uppercase tracking-widest"
              >
                <Save size={14} /> {editingPropertyId ? 'Update Property' : 'Create Property'}
              </button>
            </form>

            <div className="mt-6 space-y-3 max-h-72 overflow-auto pr-1">
              {loading ? (
                <p className="text-sm text-slate-500 font-semibold">Loading properties...</p>
              ) : activeProperties.length === 0 ? (
                <p className="text-sm text-slate-500 font-semibold">No active properties. Create one above.</p>
              ) : (
                activeProperties.map((property) => (
                  <div key={property.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-black text-indigo-950 text-sm">{property.title}</p>
                        <p className="text-xs text-slate-500">
                          {(property.location?.city || 'N/A')} • {currency(property.currentValue)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => beginEditProperty(property)} className="px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 font-bold">
                          Edit
                        </button>
                        <button type="button" onClick={() => toggleArchive(property.id)} className="px-3 py-1.5 text-xs rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-bold">
                          Archive
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-indigo-950/5">
            <h2 className="text-xl font-black text-indigo-950 flex items-center gap-2">
              <LineChart size={18} /> Saved Scenarios &amp; Compare
            </h2>
            <form onSubmit={saveScenario} className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
              <input
                value={scenarioForm.name}
                onChange={(e) => setScenarioForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Scenario name"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                required
              />
              <select
                value={scenarioForm.propertyId}
                onChange={(e) => setScenarioForm((prev) => ({ ...prev, propertyId: e.target.value }))}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                required
              >
                <option value="">Select property</option>
                {activeProperties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title}
                  </option>
                ))}
              </select>
              <input type="number" min="0" value={scenarioForm.cost} onChange={(e) => setScenarioForm((prev) => ({ ...prev, cost: e.target.value }))} placeholder="Estimated cost" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              <input type="number" min="0" value={scenarioForm.expectedUplift} onChange={(e) => setScenarioForm((prev) => ({ ...prev, expectedUplift: e.target.value }))} placeholder="Expected value uplift" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              <input type="number" min="0" value={scenarioForm.timelineMonths} onChange={(e) => setScenarioForm((prev) => ({ ...prev, timelineMonths: e.target.value }))} placeholder="Timeline (months)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              <select value={scenarioForm.risk} onChange={(e) => setScenarioForm((prev) => ({ ...prev, risk: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
              <button type="submit" className="md:col-span-2 inline-flex justify-center items-center gap-2 px-4 py-3 rounded-xl bg-indigo-950 text-white text-xs font-black uppercase tracking-widest">
                <Plus size={14} /> Save Scenario
              </button>
            </form>

            <div className="mt-5 space-y-3 max-h-72 overflow-auto pr-1">
              {scenarios.length === 0 ? (
                <p className="text-sm text-slate-500 font-semibold">No scenarios saved.</p>
              ) : (
                scenarios.map((scenario) => {
                  const cost = Number(scenario.cost || 0);
                  const uplift = Number(scenario.expectedUplift || 0);
                  const roi = cost > 0 ? ((uplift - cost) / cost) * 100 : 0;
                  const confidence = confidenceFromScenario(scenario);

                  return (
                    <div key={scenario.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex flex-wrap justify-between gap-2">
                        <div>
                          <p className="font-black text-indigo-950 text-sm">{scenario.name}</p>
                          <p className="text-xs text-slate-500">ROI {roi.toFixed(1)}% • {scenario.timelineMonths} months • Confidence {confidence}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCompare(scenario.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${compareIds.includes(scenario.id) ? 'bg-indigo-950 text-white border-indigo-950' : 'bg-white border-slate-200 text-slate-700'}`}
                        >
                          {compareIds.includes(scenario.id) ? 'Compared' : 'Compare'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-3 py-2">Scenario</th>
                    <th className="text-left px-3 py-2">Cost</th>
                    <th className="text-left px-3 py-2">Uplift</th>
                    <th className="text-left px-3 py-2">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {compareScenarios.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-slate-500">Select scenarios to compare side-by-side.</td>
                    </tr>
                  ) : (
                    compareScenarios.map((scenario) => (
                      <tr key={`cmp-${scenario.id}`} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-semibold">{scenario.name}</td>
                        <td className="px-3 py-2">{currency(scenario.cost)}</td>
                        <td className="px-3 py-2">{currency(scenario.expectedUplift)}</td>
                        <td className="px-3 py-2">{scenario.timelineMonths}m</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-indigo-950/5">
            <h2 className="text-xl font-black text-indigo-950 flex items-center gap-2">
              <Bell size={18} /> Alerts &amp; Automation
            </h2>
            <p className="text-sm text-slate-500 mt-2">Automated budget, timeline, and recommendation-driven actions.</p>

            <div className="mt-4 space-y-3 max-h-80 overflow-auto pr-1">
              {generatedAlerts.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-indigo-950 text-sm">{alert.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{alert.action}</p>
                    </div>
                    <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-full ${alert.severity === 'high' ? 'bg-red-100 text-red-700' : alert.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => createReminderFromAlert(alert)}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-950 text-white text-[10px] font-black uppercase tracking-widest"
                  >
                    Create Reminder
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-indigo-950/5">
            <h2 className="text-xl font-black text-indigo-950 flex items-center gap-2">
              <Upload size={18} /> Document &amp; Media Hub
            </h2>
            <form onSubmit={submitMedia} className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
              <select
                value={mediaForm.propertyId}
                onChange={(e) => setMediaForm((prev) => ({ ...prev, propertyId: e.target.value }))}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                required
              >
                <option value="">Select property</option>
                {activeProperties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title}
                  </option>
                ))}
              </select>
              <select
                value={mediaForm.category}
                onChange={(e) => setMediaForm((prev) => ({ ...prev, category: e.target.value }))}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                <option value="invoice">Invoice</option>
                <option value="permit">Permit</option>
                <option value="before-photo">Before Photo</option>
                <option value="after-photo">After Photo</option>
              </select>
              <input
                value={mediaForm.linkedItem}
                onChange={(e) => setMediaForm((prev) => ({ ...prev, linkedItem: e.target.value }))}
                placeholder="Linked task/milestone"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <input
                type="file"
                onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name || '')}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <textarea
                value={mediaForm.notes}
                onChange={(e) => setMediaForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes"
                rows={2}
                className="md:col-span-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <button type="submit" className="md:col-span-2 inline-flex justify-center items-center gap-2 px-4 py-3 rounded-xl bg-indigo-950 text-white text-xs font-black uppercase tracking-widest">
                <Upload size={14} /> Link Media Entry
              </button>
            </form>

            <div className="mt-4 space-y-2 max-h-60 overflow-auto pr-1">
              {mediaEntries.length === 0 ? (
                <p className="text-sm text-slate-500 font-semibold">No linked media entries yet.</p>
              ) : (
                mediaEntries.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-sm font-black text-indigo-950">{item.fileName}</p>
                    <p className="text-xs text-slate-500">{item.category} • {item.linkedItem || 'Unlinked'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-indigo-950/5">
            <h2 className="text-xl font-black text-indigo-950 flex items-center gap-2">
              <Users size={18} /> Collaboration Hub
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <form onSubmit={addMember} className="space-y-3 rounded-xl border border-slate-100 p-4 bg-slate-50">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Invite Collaborator</p>
                <input value={memberForm.name} onChange={(e) => setMemberForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Name" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
                <input value={memberForm.email} onChange={(e) => setMemberForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" type="email" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
                <select value={memberForm.role} onChange={(e) => setMemberForm((prev) => ({ ...prev, role: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="contractor">Contractor</option>
                  <option value="partner">Partner</option>
                  <option value="advisor">Advisor</option>
                </select>
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-950 text-white py-2 text-xs font-black uppercase tracking-widest" type="submit">
                  <UserPlus size={14} /> Invite
                </button>
              </form>

              <form onSubmit={addTask} className="space-y-3 rounded-xl border border-slate-100 p-4 bg-slate-50">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Assign Task</p>
                <input value={taskForm.title} onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Task title" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
                <select value={taskForm.assignee} onChange={(e) => setTaskForm((prev) => ({ ...prev, assignee: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="">Select assignee</option>
                  {collabState.members.map((member) => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
                <select value={taskForm.propertyId} onChange={(e) => setTaskForm((prev) => ({ ...prev, propertyId: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="">Select property</option>
                  {activeProperties.map((property) => (
                    <option key={property.id} value={property.id}>{property.title}</option>
                  ))}
                </select>
                <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm((prev) => ({ ...prev, dueDate: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-950 text-white py-2 text-xs font-black uppercase tracking-widest" type="submit">
                  <ClipboardList size={14} /> Assign
                </button>
              </form>
            </div>

            <form onSubmit={addComment} className="rounded-xl border border-slate-100 p-4 bg-slate-50 mt-4 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Comments &amp; Activity</p>
              <select value={commentForm.propertyId} onChange={(e) => setCommentForm((prev) => ({ ...prev, propertyId: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required>
                <option value="">Select property</option>
                {activeProperties.map((property) => (
                  <option key={property.id} value={property.id}>{property.title}</option>
                ))}
              </select>
              <textarea value={commentForm.text} onChange={(e) => setCommentForm((prev) => ({ ...prev, text: e.target.value }))} rows={2} placeholder="Add collaboration comment" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
              <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-950 text-white px-4 py-2 text-xs font-black uppercase tracking-widest" type="submit">
                <Plus size={14} /> Add Comment
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="rounded-xl border border-slate-100 p-3 max-h-52 overflow-auto bg-slate-50">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Assigned Tasks</p>
                {assignedTaskItems}
              </div>
              <div className="rounded-xl border border-slate-100 p-3 max-h-52 overflow-auto bg-slate-50">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Recent Activity</p>
                {recentActivityItems}
              </div>
            </div>
          </div>

          <div className="glass-card bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-indigo-950/5">
            <h2 className="text-xl font-black text-indigo-950 flex items-center gap-2">
              <LineChart size={18} /> Advanced Analytics + UX / Platform
            </h2>

            <div className="mt-5 rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-3 py-2">City</th>
                    <th className="text-left px-3 py-2">Properties</th>
                    <th className="text-left px-3 py-2">Trend</th>
                    <th className="text-left px-3 py-2">Projected Value</th>
                  </tr>
                </thead>
                <tbody>
                  {marketTrendRows.length === 0 ? (
                    <tr><td className="px-3 py-3 text-slate-500" colSpan={4}>Add properties to view market overlays.</td></tr>
                  ) : marketTrendRows.map((row) => (
                    <tr key={row.city} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-semibold">{row.city}</td>
                      <td className="px-3 py-2">{row.count}</td>
                      <td className="px-3 py-2">{(row.trendMultiplier * 100).toFixed(1)}%</td>
                      <td className="px-3 py-2">{currency(row.projectedQuarterValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-widest font-black text-slate-500">PWA &amp; Offline Readiness</p>
              <div className="flex items-center gap-2 mt-2 text-sm font-semibold text-slate-700">
                {online ? <Wifi size={16} className="text-emerald-600" /> : <WifiOff size={16} className="text-red-600" />}
                {online ? 'Online mode active' : 'Offline mode active'}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                This app is PWA-enabled; tracker/checklist data can remain available via browser caching in installed mode.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button type="button" onClick={() => window.location.reload()} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold">
                  Refresh Cache
                </button>
                <button type="button" onClick={resetOnboarding} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold">
                  Re-run Onboarding
                </button>
              </div>
            </div>

            {user?.role === 'admin' && (
              <div className="mt-4 rounded-xl border border-slate-100 p-4 bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-widest font-black text-slate-500">Admin Controls</p>
                  <button type="button" onClick={refreshAnomaliesFromRisks} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest">
                    <RefreshCw size={12} /> Refresh Queue
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div className="rounded-lg border border-slate-100 bg-white p-3">
                    <p className="text-[10px] uppercase font-black text-slate-400">User Health</p>
                    <p className="text-xl font-black text-indigo-950 mt-1">{collabState.members.length || 0}</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-white p-3">
                    <p className="text-[10px] uppercase font-black text-slate-400">Risk Flags</p>
                    <p className="text-xl font-black text-indigo-950 mt-1">{riskCandidates.length}</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-white p-3">
                    <p className="text-[10px] uppercase font-black text-slate-400">Anomalies Pending</p>
                    <p className="text-xl font-black text-indigo-950 mt-1">{anomalyReviews.filter((item) => item.status !== 'reviewed').length}</p>
                  </div>
                </div>

                <div className="space-y-2 mt-3 max-h-44 overflow-auto pr-1">
                  {anomalyReviews.length === 0 ? (
                    <p className="text-xs text-slate-500">No anomalies in queue.</p>
                  ) : (
                    anomalyReviews.map((item) => (
                      <div key={item.id} className="rounded-lg border border-slate-100 bg-white p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-indigo-950">{item.title}</p>
                            <p className="text-xs text-slate-500 mt-1">{item.action}</p>
                          </div>
                          {item.status === 'reviewed' ? (
                            <span className="text-[10px] uppercase font-black px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center gap-1"><CheckCircle2 size={11} />Reviewed</span>
                          ) : (
                            <button type="button" onClick={() => resolveAnomaly(item.id)} className="text-[10px] uppercase font-black px-2 py-1 rounded-full bg-amber-100 text-amber-700 inline-flex items-center gap-1"><Flag size={11} />Review</button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card bg-white border border-slate-100 rounded-[2rem] p-5 shadow-xl shadow-indigo-950/5 text-sm text-slate-600 flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2 font-semibold text-indigo-950">
            <ShieldAlert size={16} /> Operational Safety
          </span>
          <span className="inline-flex items-center gap-1"><AlertTriangle size={14} className="text-amber-500" /> {riskCandidates.length} high-risk flags</span>
          <span className="inline-flex items-center gap-1"><Bell size={14} className="text-indigo-500" /> {generatedAlerts.length} automation alerts</span>
          <span className="inline-flex items-center gap-1"><FileText size={14} className="text-emerald-500" /> {mediaEntries.length} linked media entries</span>
          <span className="inline-flex items-center gap-1"><Users size={14} className="text-purple-500" /> {collabState.members.length} collaborators</span>
          <span className="inline-flex items-center gap-1"><Wifi size={14} className={online ? 'text-emerald-600' : 'text-red-600'} /> {online ? 'Network stable' : 'Offline mode'}</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioWorkspace;
