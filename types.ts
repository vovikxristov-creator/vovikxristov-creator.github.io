import { MANAGERS_LIST, SOURCES_LIST, PERIOD_OPTIONS } from './constants';

export type Manager = typeof MANAGERS_LIST[number];
export type Source = typeof SOURCES_LIST[number];
// Fix: defined Status as a literal type to break circular dependency with constants.ts
export type Status = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Won' | 'Lost';
export type Period = typeof PERIOD_OPTIONS[number];
export type MessageBoxType = 'info' | 'error' | 'success';

export interface Lead {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  manager: Manager;
  source: Source;
  status: Status;
  value: number;
  sourceDescription: string;
  kpi: number;
}

export type NewLead = Omit<Lead, 'id' | 'createdAt'>;

interface StorageAPI {
    list(prefix: string, isPrivate: boolean): Promise<{ keys: string[] } | null>;
    get(key: string, isPrivate: boolean): Promise<{ value: string } | null>;
    set(key: string, value: string, isPrivate: boolean): Promise<void>;
    delete(key: string, isPrivate: boolean): Promise<void>;
}

declare global {
    interface Window {
        storage: StorageAPI;
    }
}