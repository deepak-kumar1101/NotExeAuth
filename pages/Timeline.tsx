import React, { useState } from 'react';
import { useTimeline } from '../hooks/useTimeline';
import { TimelineHeader } from '../components/timeline/TimelineHeader';
import { TimelineSearch } from '../components/timeline/TimelineSearch';
import { TimelineFilters } from '../components/timeline/TimelineFilters';
import { TimelineCard } from '../components/timeline/TimelineCard';
import { TimelineDrawer } from '../components/timeline/TimelineDrawer';
import { AuditLogItem } from '../types/audit';
import { ADMIN_EMAIL } from '../constants';
import { auth } from '../services/firebase';
import { Loader2, Activity, ShieldCheck } from 'lucide-react';

export const Timeline: React.FC<{ userSecret?: string }> = ({ userSecret }) => {
  const currentUser = auth.currentUser;
  const userEmail = currentUser?.email || '';
  const isAdmin = userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const userRole = isAdmin ? 'admin' : (currentUser ? 'developer' : 'guest');

  const {
    logs,
    totalFilteredCount,
    totalRawCount,
    loading,
    hasMore,
    loadMore,
    filters,
    updateFilters,
    resetFilters,
    availableApplications,
    metrics
  } = useTimeline(userRole, userEmail, userSecret);

  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header with summary stats & export actions */}
      <TimelineHeader logs={logs} metrics={metrics} />

      {/* Realtime Search Input */}
      <TimelineSearch
        value={filters.searchQuery}
        onChange={query => updateFilters({ searchQuery: query })}
        resultCount={totalFilteredCount}
        totalCount={totalRawCount}
      />

      {/* Advanced Filters */}
      <TimelineFilters
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        applications={availableApplications}
      />

      {/* Main Timeline Card List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-16 text-center space-y-3 glass-card rounded-3xl">
            <Loader2 size={32} className="text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              Connecting to Realtime Audit Stream...
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center space-y-3 glass-card rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-300">No Audit Events Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              No matching activity events were recorded for the selected search query and filter rules.
            </p>
          </div>
        ) : (
          <>
            {logs.map(log => (
              <TimelineCard key={log.eventId} log={log} onSelect={setSelectedLog} />
            ))}

            {/* Infinite Scroll Load More Button */}
            {hasMore && (
              <div className="pt-4 text-center">
                <button
                  onClick={loadMore}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-mono font-bold uppercase tracking-wider rounded-2xl border border-white/10 transition-all shadow-sm cursor-pointer"
                >
                  Load More Events ({totalFilteredCount - logs.length} Remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Event Side Drawer Inspector */}
      <TimelineDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
};

export default Timeline;
