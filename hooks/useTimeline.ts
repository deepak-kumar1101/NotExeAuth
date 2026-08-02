import { useState, useEffect, useMemo, useCallback } from 'react';
import { AuditLogItem, AuditFilterState, AuditCategory, AuditSeverity, AuditActorType } from '../types/audit';
import { auditService } from '../services/auditService';

export function useTimeline(
  userRole: 'admin' | 'developer' | 'reseller' | 'guest' = 'developer',
  userEmail?: string,
  userSecret?: string
) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLimit, setPageLimit] = useState(25);

  const [filters, setFilters] = useState<AuditFilterState>({
    dateRange: 'all',
    category: 'all',
    severity: 'all',
    actorType: 'all',
    application: 'all',
    searchQuery: ''
  });

  // Live real-time listener
  useEffect(() => {
    setLoading(true);

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    const unsubscribe = auditService.subscribe(userRole, userEmail, userSecret, rawLogs => {
      clearTimeout(safetyTimer);
      setLogs(rawLogs);
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, [userRole, userEmail, userSecret]);

  // Extract unique available application names from logs for filter dropdown
  const availableApplications = useMemo(() => {
    const apps = new Set<string>();
    logs.forEach(l => {
      if (l.application) apps.add(l.application);
    });
    return Array.from(apps);
  }, [logs]);

  // Filter & Search computation
  const filteredLogs = useMemo(() => {
    const queryStr = filters.searchQuery.trim().toLowerCase();
    const now = new Date();

    return logs.filter(log => {
      // 1. Date Range Filtering
      if (filters.dateRange !== 'all') {
        const logDate = new Date(log.timestamp);
        const diffMs = now.getTime() - logDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (filters.dateRange === 'today' && logDate.toDateString() !== now.toDateString()) return false;
        if (filters.dateRange === 'yesterday') {
          const yesterday = new Date();
          yesterday.setDate(now.getDate() - 1);
          if (logDate.toDateString() !== yesterday.toDateString()) return false;
        }
        if (filters.dateRange === '7days' && diffDays > 7) return false;
        if (filters.dateRange === '30days' && diffDays > 30) return false;
      }

      // 2. Category Filter
      if (filters.category !== 'all' && log.category !== filters.category) return false;

      // 3. Severity Filter
      if (filters.severity !== 'all' && log.severity !== filters.severity) return false;

      // 4. Actor Type Filter
      if (filters.actorType !== 'all' && log.actorType !== filters.actorType) return false;

      // 5. Application Filter
      if (filters.application !== 'all' && log.application !== filters.application) return false;

      // 6. Search Query
      if (queryStr) {
        const descMatch = log.description?.toLowerCase().includes(queryStr);
        const userMatch = log.username?.toLowerCase().includes(queryStr);
        const emailMatch = log.actorEmail?.toLowerCase().includes(queryStr);
        const appMatch = log.application?.toLowerCase().includes(queryStr);
        const licMatch = log.licenseKey?.toLowerCase().includes(queryStr);
        const typeMatch = log.type?.toLowerCase().includes(queryStr);

        return descMatch || userMatch || emailMatch || appMatch || licMatch || typeMatch;
      }

      return true;
    });
  }, [logs, filters]);

  // Paginated View Slice
  const visibleLogs = useMemo(() => {
    return filteredLogs.slice(0, pageLimit);
  }, [filteredLogs, pageLimit]);

  const hasMore = visibleLogs.length < filteredLogs.length;

  const loadMore = useCallback(() => {
    setPageLimit(prev => prev + 25);
  }, []);

  const updateFilters = useCallback((update: Partial<AuditFilterState>) => {
    setFilters(prev => ({ ...prev, ...update }));
    setPageLimit(25); // Reset pagination on filter change
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      dateRange: 'all',
      category: 'all',
      severity: 'all',
      actorType: 'all',
      application: 'all',
      searchQuery: ''
    });
    setPageLimit(25);
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = logs.length;
    const criticalCount = logs.filter(l => l.severity === 'Critical').length;
    const warningCount = logs.filter(l => l.severity === 'Warning').length;
    const successCount = logs.filter(l => l.severity === 'Success').length;
    const infoCount = logs.filter(l => l.severity === 'Info').length;

    return { total, criticalCount, warningCount, successCount, infoCount };
  }, [logs]);

  return {
    logs: visibleLogs,
    totalFilteredCount: filteredLogs.length,
    totalRawCount: logs.length,
    loading,
    hasMore,
    loadMore,
    filters,
    updateFilters,
    resetFilters,
    availableApplications,
    metrics
  };
}
