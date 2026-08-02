import { CommandItemData, CommandGroupData, CommandPaletteContextData, UserRole, CommandCategory } from '../types/commandPalette';

class CommandPaletteService {
  private contextData: CommandPaletteContextData = {
    userRole: 'guest',
    currentPath: '/',
    apps: {},
    users: {},
    licenses: {},
    variables: {},
    resellers: {}
  };

  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public updateContextData(update: Partial<CommandPaletteContextData>): void {
    const nextData = {
      ...this.contextData,
      ...update,
      actions: {
        ...this.contextData.actions,
        ...update.actions
      }
    };

    const hasRoleChanged = this.contextData.userRole !== nextData.userRole;
    const hasPathChanged = this.contextData.currentPath !== nextData.currentPath;
    const hasAppChanged = this.contextData.currentApp !== nextData.currentApp;
    const hasSecretChanged = this.contextData.userSecret !== nextData.userSecret;

    const oldApps = Object.keys(this.contextData.apps || {}).join(',');
    const newApps = Object.keys(nextData.apps || {}).join(',');
    const oldUsers = Object.keys(this.contextData.users || {}).join(',');
    const newUsers = Object.keys(nextData.users || {}).join(',');
    const oldLics = Object.keys(this.contextData.licenses || {}).join(',');
    const newLics = Object.keys(nextData.licenses || {}).join(',');

    const hasDataChanged = oldApps !== newApps || oldUsers !== newUsers || oldLics !== newLics;

    this.contextData = nextData;

    if (hasRoleChanged || hasPathChanged || hasAppChanged || hasSecretChanged || hasDataChanged) {
      this.notify();
    }
  }

  public getContextData(): CommandPaletteContextData {
    return this.contextData;
  }

  public buildAllCommands(ctx: CommandPaletteContextData): CommandItemData[] {
    const items: CommandItemData[] = [];
    const role = ctx.userRole;

    // ==========================================
    // NAVIGATION COMMANDS (Guest / Developer / Admin)
    // ==========================================
    items.push(
      {
        id: 'nav-dashboard',
        title: 'Go to Dashboard',
        description: 'View metrics, applications, users, and licensing',
        category: 'Navigation',
        iconName: 'LayoutDashboard',
        shortcut: 'G D',
        keywords: ['dashboard', 'home', 'main', 'overview', 'app'],
        roleRequired: 'developer',
        action: ({ navigate, setTab }) => {
          if (navigate) navigate('/dashboard');
          if (setTab) setTab('application');
        }
      },
      {
        id: 'nav-shop',
        title: 'Go to Credit Shop',
        description: 'Purchase developer credits and upgrade system plans',
        category: 'Navigation',
        iconName: 'ShoppingCart',
        shortcut: 'G S',
        keywords: ['shop', 'store', 'credits', 'buy', 'upgrade', 'plan'],
        roleRequired: 'developer',
        action: ({ navigate }) => {
          if (navigate) navigate('/shop');
        }
      },
      {
        id: 'nav-docs',
        title: 'Go to Documentation & SDKs',
        description: 'Explore developer integration guides and code generators',
        category: 'Navigation',
        iconName: 'BookOpen',
        shortcut: 'G K',
        keywords: ['docs', 'documentation', 'sdk', 'api', 'guide', 'integration'],
        roleRequired: 'guest',
        action: ({ navigate }) => {
          if (navigate) navigate('/docs');
        }
      },
      {
        id: 'nav-timeline',
        title: 'Go to Audit Activity Timeline',
        description: 'Inspect live security events, authentication attempts, and activity logs',
        category: 'Navigation',
        iconName: 'Activity',
        shortcut: 'G L',
        keywords: ['timeline', 'audit', 'logs', 'activity', 'security', 'events', 'history'],
        roleRequired: 'developer',
        action: ({ navigate, setTab }) => {
          if (navigate) navigate('/timeline');
          if (setTab) setTab('timeline');
        }
      },
      {
        id: 'nav-settings',
        title: 'Go to Application Settings',
        description: 'Manage app encryption secrets, HWID enforcement, and Turnstile',
        category: 'Navigation',
        iconName: 'Settings',
        shortcut: 'G T',
        keywords: ['settings', 'config', 'encryption', 'security', 'preferences'],
        roleRequired: 'developer',
        action: ({ navigate, setTab }) => {
          if (navigate) navigate('/dashboard');
          if (setTab) setTab('settings');
        }
      }
    );

    if (role === 'admin') {
      items.push({
        id: 'nav-admin',
        title: 'Go to Admin Console',
        description: 'System-wide user control, credit approvals, and system maintenance',
        category: 'Navigation',
        iconName: 'Crown',
        shortcut: 'G A',
        keywords: ['admin', 'console', 'system', 'approval', 'credits', 'maintenance'],
        roleRequired: 'admin',
        action: ({ navigate }) => {
          if (navigate) navigate('/admin');
        }
      });
    }

    // ==========================================
    // DEVELOPER ACTION COMMANDS
    // ==========================================
    if (role === 'developer' || role === 'admin') {
      items.push(
        {
          id: 'cmd-create-app',
          title: 'Create New Application',
          description: 'Deploy a new software product key under your account',
          category: 'Commands',
          iconName: 'PlusCircle',
          keywords: ['create app', 'new application', 'add app', 'deploy app'],
          roleRequired: 'developer',
          action: ({ navigate, setTab, actions }) => {
            if (navigate) navigate('/dashboard');
            if (setTab) setTab('application');
            if (actions?.openCreateAppModal) actions.openCreateAppModal();
          }
        },
        {
          id: 'cmd-create-user',
          title: 'Open Create User Modal',
          description: 'Add a new user credential to the current application',
          category: 'Commands',
          iconName: 'UserPlus',
          shortcut: 'Alt+U',
          keywords: ['create user', 'add user', 'new user', 'register user'],
          roleRequired: 'developer',
          action: ({ navigate, setTab, actions }) => {
            if (navigate) navigate('/dashboard');
            if (setTab) setTab('users');
            if (actions?.openCreateUserModal) actions.openCreateUserModal();
          }
        },
        {
          id: 'cmd-create-license',
          title: 'Open Create License Modal',
          description: 'Generate single or bulk license keys with custom duration',
          category: 'Commands',
          iconName: 'Key',
          shortcut: 'Alt+L',
          keywords: ['create license', 'generate license', 'add key', 'new license'],
          roleRequired: 'developer',
          action: ({ navigate, setTab, actions }) => {
            if (navigate) navigate('/dashboard');
            if (setTab) setTab('license');
            if (actions?.openCreateLicenseModal) actions.openCreateLicenseModal();
          }
        },
        {
          id: 'cmd-open-variables',
          title: 'Open Cloud Variables',
          description: 'Manage remote encrypted environment key-value pairs',
          category: 'Commands',
          iconName: 'Database',
          shortcut: 'Alt+V',
          keywords: ['open variables', 'cloud vars', 'environment', 'remote vars'],
          roleRequired: 'developer',
          action: ({ navigate, setTab }) => {
            if (navigate) navigate('/dashboard');
            if (setTab) setTab('variables');
          }
        },
        {
          id: 'cmd-open-webhooks',
          title: 'Open Webhooks & Interrogation',
          description: 'Configure Discord rich security alerts and bot synchronization',
          category: 'Commands',
          iconName: 'Share2',
          shortcut: 'Alt+W',
          keywords: ['webhooks', 'discord', 'alerts', 'interrogation', 'bot'],
          roleRequired: 'developer',
          action: ({ navigate, setTab }) => {
            if (navigate) navigate('/dashboard');
            if (setTab) setTab('interrogation');
          }
        },
        {
          id: 'cmd-open-resellers',
          title: 'Open Resellers Portal Manager',
          description: 'Manage sub-accounts, user quotas, and white-label branding',
          category: 'Commands',
          iconName: 'ShieldCheck',
          shortcut: 'Alt+R',
          keywords: ['resellers', 'subaccounts', 'white-label', 'partner', 'quotas'],
          roleRequired: 'developer',
          action: ({ navigate, setTab }) => {
            if (navigate) navigate('/dashboard');
            if (setTab) setTab('resellers');
          }
        },
        {
          id: 'cmd-open-sdk-gen',
          title: 'Open SDK Code Generator',
          description: 'Generate ready-to-use integration code for C++, C#, Python, Rust, Go',
          category: 'Commands',
          iconName: 'Code2',
          keywords: ['sdk', 'code', 'generator', 'python', 'csharp', 'cpp', 'rust'],
          roleRequired: 'developer',
          action: ({ navigate }) => {
            if (navigate) navigate('/docs');
          }
        }
      );
    }

    // ==========================================
    // ADMIN ACTION COMMANDS
    // ==========================================
    if (role === 'admin') {
      items.push(
        {
          id: 'cmd-admin-plans',
          title: 'Open System Plan Manager',
          description: 'Configure global subscription plans, limits, and prices',
          category: 'Admin',
          iconName: 'Sliders',
          keywords: ['plan manager', 'subscription plans', 'pricing', 'tier'],
          roleRequired: 'admin',
          action: ({ navigate, setTab }) => {
            if (navigate) navigate('/admin');
            if (setTab) setTab('plans');
          }
        },
        {
          id: 'cmd-admin-credits',
          title: 'Open Credit Top-Up Approvals',
          description: 'Review developer payment proof uploads and approve credit top-ups',
          category: 'Admin',
          iconName: 'CreditCard',
          keywords: ['credit approvals', 'payment proof', 'top-up', 'requests'],
          roleRequired: 'admin',
          action: ({ navigate, setTab }) => {
            if (navigate) navigate('/admin');
            if (setTab) setTab('credits');
          }
        },
        {
          id: 'cmd-admin-audit',
          title: 'Open System Audit Logs',
          description: 'Inspect real-time security events, admin actions, and threat activity',
          category: 'Admin',
          iconName: 'FileText',
          keywords: ['audit logs', 'security logs', 'threats', 'system log'],
          roleRequired: 'admin',
          action: ({ navigate, setTab }) => {
            if (navigate) navigate('/admin');
            if (setTab) setTab('audit');
          }
        },
        {
          id: 'cmd-admin-payment',
          title: 'Open Payment Configuration',
          description: 'Configure UPI payment methods, QR codes, and Merchant UTR details',
          category: 'Admin',
          iconName: 'Settings',
          keywords: ['payment config', 'upi', 'qr code', 'merchant', 'utr'],
          roleRequired: 'admin',
          action: ({ navigate, setTab }) => {
            if (navigate) navigate('/admin');
            if (setTab) setTab('payment');
          }
        },
        {
          id: 'cmd-admin-maintenance',
          title: 'Toggle Maintenance Mode',
          description: 'Enable or disable emergency platform maintenance lockdown',
          category: 'Admin',
          iconName: 'Hammer',
          keywords: ['maintenance', 'lockdown', 'toggle maintenance', 'emergency'],
          roleRequired: 'admin',
          action: async ({ actions }) => {
            if (actions?.toggleMaintenance) {
              const confirmToggle = window.confirm('Are you sure you want to toggle System Maintenance Mode?');
              if (confirmToggle) {
                await actions.toggleMaintenance();
              }
            }
          }
        }
      );
    }

    // ==========================================
    // DYNAMIC DATA ITEMS (Already loaded in memory)
    // ==========================================

    // 1. Applications
    if (ctx.apps && Object.keys(ctx.apps).length > 0) {
      Object.keys(ctx.apps).forEach(appName => {
        const isCurrent = ctx.currentApp === appName;
        items.push({
          id: `app-${appName}`,
          title: appName,
          description: isCurrent ? 'Active Application' : 'Switch active dashboard application',
          category: 'Applications',
          iconName: 'Box',
          shortcut: isCurrent ? 'Active' : undefined,
          keywords: ['app', appName, 'application'],
          roleRequired: 'developer',
          action: ({ navigate, setTab, actions }) => {
            if (navigate) navigate('/dashboard');
            if (setTab) setTab('application');
            if (actions?.selectApp) actions.selectApp(appName);
          },
          metadata: { appName }
        });
      });
    }

    // 2. Users
    if (ctx.users && Object.keys(ctx.users).length > 0) {
      Object.entries(ctx.users).forEach(([username, u]: [string, any]) => {
        const isBanned = u?.isBanned;
        const expiry = u?.expiry === 'lifetime' ? 'Lifetime' : (u?.expiry ? new Date(u.expiry).toLocaleDateString() : 'N/A');
        items.push({
          id: `user-${username}`,
          title: username,
          description: `Expiry: ${expiry} | Status: ${isBanned ? 'Banned' : 'Active'}`,
          category: 'Users',
          iconName: 'Users',
          keywords: ['user', username, isBanned ? 'banned' : 'active', expiry],
          roleRequired: 'developer',
          action: ({ navigate, setTab }) => {
            if (navigate) navigate('/dashboard');
            if (setTab) setTab('users');
          },
          metadata: { username, user: u }
        });
      });
    }

    // 3. Licenses
    if (ctx.licenses && Object.keys(ctx.licenses).length > 0) {
      Object.entries(ctx.licenses).forEach(([key, l]: [string, any]) => {
        const used = l?.used;
        const assigned = l?.associatedUser || (used ? 'Redeemed' : 'Unused');
        items.push({
          id: `lic-${key}`,
          title: key,
          description: `Assigned: ${assigned} | Status: ${used ? 'Used' : 'Available'}`,
          category: 'Licenses',
          iconName: 'Key',
          keywords: ['license', 'key', key, assigned, used ? 'used' : 'unused'],
          roleRequired: 'developer',
          action: ({ navigate, setTab }) => {
            if (navigate) navigate('/dashboard');
            if (setTab) setTab('license');
            try {
              navigator.clipboard.writeText(key);
            } catch (e) {}
          },
          metadata: { key, license: l }
        });
      });
    }

    // 4. Resellers
    if (ctx.resellers && Object.keys(ctx.resellers).length > 0) {
      Object.entries(ctx.resellers).forEach(([hash, r]: [string, any]) => {
        items.push({
          id: `reseller-${r.username || hash}`,
          title: r.username || 'Reseller',
          description: `Panel: ${r.panelName || 'Standard'} | User Limit: ${r.userLimit === -1 ? 'Unlimited' : r.userLimit}`,
          category: 'Resellers',
          iconName: 'ShieldCheck',
          keywords: ['reseller', r.username, r.panelName || 'reseller'],
          roleRequired: 'developer',
          action: ({ navigate, setTab }) => {
            if (navigate) navigate('/dashboard');
            if (setTab) setTab('resellers');
          },
          metadata: { hash, reseller: r }
        });
      });
    }

    // 5. Cloud Variables
    if (ctx.variables && Object.keys(ctx.variables).length > 0) {
      Object.entries(ctx.variables).forEach(([varName, varVal]: [string, any]) => {
        items.push({
          id: `var-${varName}`,
          title: varName,
          description: `Encrypted Value: ${String(varVal).substring(0, 24)}...`,
          category: 'Variables',
          iconName: 'Database',
          keywords: ['variable', 'cloud var', varName],
          roleRequired: 'developer',
          action: ({ navigate, setTab }) => {
            if (navigate) navigate('/dashboard');
            if (setTab) setTab('variables');
          },
          metadata: { varName, varVal }
        });
      });
    }

    return items;
  }

  public searchAndGroupCommands(query: string, ctx: CommandPaletteContextData): CommandGroupData[] {
    const allItems = this.buildAllCommands(ctx);
    const role = ctx.userRole;
    const cleanQuery = query.trim().toLowerCase();

    // 1. Role Filtering
    const allowedItems = allItems.filter(item => {
      if (role === 'guest') return item.roleRequired === 'guest';
      if (role === 'developer') return item.roleRequired === 'guest' || item.roleRequired === 'developer';
      if (role === 'admin') return true;
      return false;
    });

    // 2. Fuzzy Search Filtering
    let filteredItems = allowedItems;
    if (cleanQuery) {
      filteredItems = allowedItems.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(cleanQuery);
        const descMatch = item.description.toLowerCase().includes(cleanQuery);
        const catMatch = item.category.toLowerCase().includes(cleanQuery);
        const keywordMatch = item.keywords?.some(k => k.toLowerCase().includes(cleanQuery));

        return titleMatch || descMatch || catMatch || keywordMatch;
      });
    }

    // 3. Category Grouping in Priority Order
    const categoryPriority: CommandCategory[] = [
      'Navigation',
      'Applications',
      'Users',
      'Licenses',
      'Resellers',
      'Variables',
      'Commands',
      'Admin'
    ];

    const groupsMap = new Map<CommandCategory, CommandItemData[]>();

    filteredItems.forEach(item => {
      if (!groupsMap.has(item.category)) {
        groupsMap.set(item.category, []);
      }
      groupsMap.get(item.category)!.push(item);
    });

    const resultGroups: CommandGroupData[] = [];
    categoryPriority.forEach(cat => {
      if (groupsMap.has(cat) && groupsMap.get(cat)!.length > 0) {
        resultGroups.push({
          category: cat,
          items: groupsMap.get(cat)!
        });
      }
    });

    return resultGroups;
  }
}

export const commandPaletteService = new CommandPaletteService();
