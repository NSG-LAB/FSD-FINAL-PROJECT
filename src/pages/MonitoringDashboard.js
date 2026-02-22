import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navigation from '../components/Navigation';

const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [pm2Status, setPm2Status] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchMonitoringData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const [metricsRes, pm2Res, logsRes] = await Promise.all([
        api.get('/monitoring/metrics'),
        api.get('/monitoring/pm2-status'),
        api.get('/monitoring/logs?lines=50')
      ]);

      if (metricsRes.data.success) setMetrics(metricsRes.data.data);
      if (pm2Res.data.success) setPm2Status(pm2Res.data.data);
      if (logsRes.data.success) setLogs(logsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'connected':
        return 'text-green-600';
      case 'stopped':
      case 'disconnected':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center">Loading monitoring data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring Dashboard</h1>
          <p className="mt-2 text-gray-600">Real-time performance and health monitoring</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-4">
            {['overview', 'system', 'application', 'logs'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* System Health Cards */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">CPU Usage</h3>
              <div className="text-3xl font-bold text-blue-600">
                {metrics?.system?.cpu_usage_percent?.toFixed(1) || 'N/A'}%
              </div>
              <div className="mt-2 text-sm text-gray-600">Current utilization</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Memory Usage</h3>
              <div className="text-3xl font-bold text-green-600">
                {metrics?.system?.memory_usage_percent?.toFixed(1) || 'N/A'}%
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {metrics?.system?.memory_used_gb?.toFixed(1) || 'N/A'} GB used
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Status</h3>
              <div className={`text-3xl font-bold ${getStatusColor(pm2Status?.process?.pm2_env?.status)}`}>
                {pm2Status?.process?.pm2_env?.status || 'Unknown'}
              </div>
              <div className="mt-2 text-sm text-gray-600">PM2 process status</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Connections</h3>
              <div className="text-3xl font-bold text-purple-600">
                {metrics?.system?.active_connections || 'N/A'}
              </div>
              <div className="mt-2 text-sm text-gray-600">Network connections</div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && metrics?.system && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">System Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">CPU & Memory</h3>
                <div className="space-y-2">
                  <div>CPU Usage: {metrics.system.cpu_usage_percent?.toFixed(1)}%</div>
                  <div>Memory Total: {metrics.system.memory_total_gb?.toFixed(1)} GB</div>
                  <div>Memory Used: {metrics.system.memory_used_gb?.toFixed(1)} GB</div>
                  <div>Memory Usage: {metrics.system.memory_usage_percent?.toFixed(1)}%</div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Storage & Network</h3>
                <div className="space-y-2">
                  <div>Disk Usage: {metrics.system.disk_usage_percent}%</div>
                  <div>Active Connections: {metrics.system.active_connections}</div>
                  <div>Last Updated: {new Date(metrics.timestamp).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application Tab */}
        {activeTab === 'application' && (
          <div className="space-y-6">
            {/* PM2 Status */}
            {pm2Status?.process && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Application Process Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 ${getStatusColor(pm2Status.process.pm2_env.status)}`}>
                      {pm2Status.process.pm2_env.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">PID:</span>
                    <span className="ml-2">{pm2Status.process.pid}</span>
                  </div>
                  <div>
                    <span className="font-medium">Uptime:</span>
                    <span className="ml-2">
                      {pm2Status.process.pm2_env.pm_uptime ?
                        Math.floor((Date.now() - pm2Status.process.pm2_env.pm_uptime) / 1000 / 60) + ' minutes' :
                        'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">CPU:</span>
                    <span className="ml-2">{pm2Status.process.monit?.cpu || 'N/A'}%</span>
                  </div>
                  <div>
                    <span className="font-medium">Memory:</span>
                    <span className="ml-2">
                      {pm2Status.process.monit?.memory ? formatBytes(pm2Status.process.monit.memory) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Restarts:</span>
                    <span className="ml-2">{pm2Status.process.pm2_env.restart_time || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Health Checks */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Health Checks</h2>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Health Endpoint:</span>
                  <span className={`ml-2 ${metrics?.application?.health_endpoint_status === '200' ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics?.application?.health_endpoint_status || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Redis Connection:</span>
                  <span className={`ml-2 ${getStatusColor(metrics?.application?.redis_ping)}`}>
                    {metrics?.application?.redis_ping || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Errors (Last Hour):</span>
                  <span className="ml-2 text-red-600">
                    {metrics?.errors?.total_errors_last_hour || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Application Logs</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No logs available</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringDashboard;