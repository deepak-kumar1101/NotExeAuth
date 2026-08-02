import React from 'react';

export type CommandCategory = 
  | 'Navigation'
  | 'Applications'
  | 'Users'
  | 'Licenses'
  | 'Resellers'
  | 'Variables'
  | 'Commands'
  | 'Admin';

export type UserRole = 'guest' | 'developer' | 'admin';

export interface CommandActionParams {
  navigate?: (path: string) => void;
  openModal?: (modalId: string) => void;
  setTab?: (tabName: string) => void;
  setApp?: (appName: string) => void;
  executeCustom?: () => void | Promise<void>;
  [key: string]: any;
}

export interface CommandItemData {
  id: string;
  title: string;
  description: string;
  category: CommandCategory;
  iconName: string;
  shortcut?: string;
  keywords?: string[];
  roleRequired: UserRole;
  action: (params: CommandActionParams) => void | Promise<void>;
  metadata?: Record<string, any>;
}

export interface CommandGroupData {
  category: CommandCategory;
  items: CommandItemData[];
}

export interface CommandPaletteContextData {
  userRole: UserRole;
  currentPath: string;
  apps?: Record<string, any>;
  users?: Record<string, any>;
  licenses?: Record<string, any>;
  variables?: Record<string, any>;
  resellers?: Record<string, any>;
  currentApp?: string;
  userSecret?: string;
  actions?: {
    openCreateAppModal?: () => void;
    openCreateUserModal?: () => void;
    openCreateLicenseModal?: () => void;
    openCreateVariableModal?: () => void;
    openCreateResellerModal?: () => void;
    switchTab?: (tab: string) => void;
    selectApp?: (appName: string) => void;
    toggleMaintenance?: () => void;
  };
}
