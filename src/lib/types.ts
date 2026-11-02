export interface Reminder {
  id: string;
  text: string;
  /** Interval in counts ("in X" / "every X"). */
  every: number;
  /** Count at which the reminder fires next. */
  target: number;
  repeat: boolean;
  /** Set when a one-shot reminder has fired. */
  firedAt?: number;
}

/** A recently used reminder, offered as a quick-pick in the reminder sheet. */
export interface RecentReminder {
  text: string;
  /** Count it was set with; missing for entries saved before this was tracked. */
  every?: number;
  repeat?: boolean;
}

export interface Counter {
  id: string;
  label: string;
  count: number;
  reminders: Reminder[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  counters: Counter[];
}

export interface Settings {
  keepAwake: boolean;
}

export interface AppData {
  version: 1;
  projects: Project[];
  recentReminders: RecentReminder[];
  settings: Settings;
}
