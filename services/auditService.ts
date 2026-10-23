import { ref, push, set, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from './firebase';
import { AuditLogItem, AuditEventType, AuditCategory, AuditSeverity, AuditActorType } from '../types/audit';

const LOCAL_AUDIT_KEY = 'notexe_audit_logs_local';

const SEED_DEMO_LOGS: AuditLogItem[] = [
  {
    eventId: 'evt_demo_101',
    timestamp: new Date().toISOString(),
    type: 'APP_CREATED',
    category: 'Application',
    severity: 'Success',
    actorType: 'developer',
    actorEmail: 'developer@deepxauth.com',
    application: 'MyApplication',
    description: 'Deployed new application container "MyApplication"',
    status: 'SUCCESS'
  },
  {
    eventId: 'evt_demo_102',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    type: 'USER_LOGIN',
    category: 'Authentication',
    severity: 'Success',
    actorType: 'user',
    actorEmail: 'john_doe',
    username: 'john_doe',
    application: 'MyApplication',
    ip: '185.220.101.5',
    country: 'United States',
    hwid: 'HWID-88A4-F291-ALPHA',
    description: 'User john_doe authenticated successfully on MyApplication',
    status: 'SUCCESS'
  },
  {
    eventId: 'evt_demo_103',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    type: 'FAILED_LOGIN',
    category: 'Authentication',
    severity: 'Warning',
    actorType: 'user',
    username: 'unknown_admin',
    application: 'MyApplication',
    ip: '198.51.100.42',
    country: 'Germany',
    description: 'Invalid password attempt for user unknown_admin',
    status: 'FAILURE'
  },
  {
    eventId: 'evt_demo_104',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'HWID_MISMATCH',
    category: 'Security',
    severity: 'Critical',
    actorType: 'user',
    username: 'john_doe',
    application: 'MyApplication',
    ip: '203.0.113.195',
    hwid: 'UNAUTHORIZED-HWID-999',
    description: 'HWID mismatch threat blocked on user john_doe',
    status: 'BLOCKED'
  }
];

function getLocalLogs(): AuditLogItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_AUDIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function saveLocalLog(item: AuditLogItem): void {
  try {
    const current = getLocalLogs();
    const updated = [item, ...current.filter(i => i.eventId !== item.eventId)].slice(0, 100);
    localStorage.setItem(LOCAL_AUDIT_KEY, JSON.stringify(updated));
  } catch (e) {}
}

export class AuditService {
  private static determineCategory(type: AuditEventType): AuditCategory {
    if (type.includes('LOGIN') || type.includes('PASSWORD') || type.includes('ACCOUNT')) return 'Authentication';
    if (type.includes('APP')) return 'Application';
    if (type.includes('USER') || type.includes('HWID')) return 'User';
    if (type.includes('LICENSE')) return 'License';
    if (type.includes('PLAN') || type.includes('SUBSCRIPTION') || type.includes('GRACE')) return 'Subscription';
    if (type.includes('CREDIT') || type.includes('PAYMENT')) return 'Credit';
    if (type.includes('VARIABLE')) return 'Variable';
    if (type.includes('WEBHOOK')) return 'Webhook';
    if (type.includes('RESELLER') || type.includes('QUOTA')) return 'Reseller';
    if (type.includes('MAINTENANCE') || type.includes('CONFIG')) return 'Admin';
    return 'Security';
  }

  private static determineSeverity(type: AuditEventType, status: string): AuditSeverity {
    if (status === 'FAILURE' || status === 'BLOCKED') {
      if (type.includes('MISMATCH') || type.includes('REPLAY') || type.includes('INVALID') || type.includes('WORKER_ERROR')) {
        return 'Critical';
      }
      return 'Warning';
    }
    if (type.includes('DELETED') || type.includes('PAUSED') || type.includes('BANNED') || type.includes('MAINTENANCE')) {
      return 'Warning';
    }
    if (type.includes('CREATED') || type.includes('SUCCESS') || type.includes('APPROVED') || type.includes('PURCHASED')) {
      return 'Success';
    }
    return 'Info';
  }

  public async log(params: {
    type: AuditEventType;
    actorType: AuditActorType;
    actorEmail?: string;
    actorSecret?: string;
    application?: string;
    username?: string;
    licenseKey?: string;
    ip?: string;
    country?: string;
    device?: string;
    os?: string;
    hwid?: string;
    description: string;
    metadata?: Record<string, any>;
    previousValue?: any;
    newValue?: any;
    status?: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'BLOCKED';
    severity?: AuditSeverity;
    category?: AuditCategory;
  }): Promise<string> {
    try {
      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const timestamp = new Date().toISOString();
      const status = params.status || 'SUCCESS';
      const category = params.category || AuditService.determineCategory(params.type);
      const severity = params.severity || AuditService.determineSeverity(params.type, status);

      const logItem: AuditLogItem = {
        eventId,
        timestamp,
        type: params.type,
        category,
        severity,
        actorType: params.actorType,
        actorEmail: params.actorEmail ? params.actorEmail.replace(/,/g, '.') : undefined,
        actorSecret: params.actorSecret ? `${params.actorSecret.substring(0, 8)}...` : undefined,
        application: params.application,
        username: params.username,
        licenseKey: params.licenseKey,
        ip: params.ip || '127.0.0.1',
        country: params.country || 'Global',
        device: params.device || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'),
        os: params.os || 'Edge Worker/Web',
        hwid: params.hwid,
        description: params.description,
        metadata: sanitizeObject(params.metadata),
        previousValue: sanitizeObject(params.previousValue),
        newValue: sanitizeObject(params.newValue),
        status
      };

      saveLocalLog(logItem);

      try {
        const auditRef = ref(db, `system/auditLogs/${eventId}`);
        await set(auditRef, logItem);
      } catch (fErr) {
        console.warn('[AuditService] Firebase set warning, local log preserved:', fErr);
      }

      return eventId;
    } catch (err) {
      console.error('[AuditService] Failed to record audit event:', err);
      return '';
    }
  }

  public subscribe(
    userRole: 'admin' | 'developer' | 'reseller' | 'guest',
    userEmail?: string,
    userSecret?: string,
    callback?: (logs: AuditLogItem[]) => void
  ): () => void {
    const logsRef = ref(db, 'system/auditLogs');

    const handleLogs = (rawData: any) => {
      let remoteLogs: AuditLogItem[] = typeof rawData === 'object' && rawData !== null ? Object.values(rawData) : [];
      const localLogs = getLocalLogs();

      // Combine remote and local real logs
      const combinedMap = new Map<string, AuditLogItem>();
      localLogs.forEach(l => combinedMap.set(l.eventId, l));
      remoteLogs.forEach(l => combinedMap.set(l.eventId, l));

      let logsList: AuditLogItem[] = Array.from(combinedMap.values());

      // If no real user/system logs exist yet, show seed demo logs
      if (logsList.length === 0) {
        logsList = [...SEED_DEMO_LOGS];
      }

      // Sort newest first (newest timestamp at top)
      logsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (callback) callback(logsList);
    };

    return onValue(logsRef, snapshot => {
      handleLogs(snapshot.exists() ? snapshot.val() : null);
    }, (error) => {
      console.warn('[AuditService] Subscription warning, serving fallback logs:', error);
      handleLogs(null);
    });
  }

  public exportToCSV(logs: AuditLogItem[], filename = `audit_logs_${Date.now()}.csv`): void {
    if (!logs || logs.length === 0) return;

    const headers = ['Event ID', 'Timestamp', 'Type', 'Category', 'Severity', 'Status', 'Actor Type', 'Actor Email', 'Application', 'Username', 'Description', 'IP Address'];
    const rows = logs.map(l => [
      l.eventId,
      l.timestamp,
      l.type,
      l.category,
      l.severity,
      l.status,
      l.actorType,
      l.actorEmail || 'N/A',
      l.application || 'N/A',
      l.username || 'N/A',
      `"${l.description.replace(/"/g, '""')}"`,
      l.ip || 'N/A'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  public exportToJSON(logs: AuditLogItem[], filename = `audit_logs_${Date.now()}.json`): void {
    if (!logs || logs.length === 0) return;
    const jsonContent = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  public exportToPDF(logs: AuditLogItem[], filename = `audit_logs_${Date.now()}.html`): void {
    if (!logs || logs.length === 0) return;
    // Generate clean printable HTML report suitable for Save to PDF in browser
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Not Exe Audit Log Report</title>
      <style>
        body { font-family: monospace, sans-serif; background: #07080c; color: #f8fafc; padding: 20px; }
        h1 { color: #6366f1; border-bottom: 2px solid #333; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
        th, td { border: 1px solid rgba(255,255,255,0.1); padding: 8px; text-align: left; }
        th { background: rgba(99,102,241,0.2); color: #fff; }
        tr:nth-child(even) { background: rgba(255,255,255,0.02); }
        .severity-Critical { color: #f43f5e; font-weight: bold; }
        .severity-Warning { color: #fbbf24; font-weight: bold; }
        .severity-Success { color: #10b981; font-weight: bold; }
        .severity-Info { color: #38bdf8; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>🛡️ Not Exe Audit Activity Report</h1>
      <p>Generated: ${new Date().toLocaleString()} | Total Records: ${logs.length}</p>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Type</th>
            <th>Severity</th>
            <th>Actor</th>
            <th>Application</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${logs.map(l => `
            <tr>
              <td>${l.timestamp}</td>
              <td>${l.type}</td>
              <td class="severity-${l.severity}">${l.severity}</td>
              <td>${l.actorEmail || l.actorType}</td>
              <td>${l.application || '-'}</td>
              <td>${l.description}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export const auditService = new AuditService();
