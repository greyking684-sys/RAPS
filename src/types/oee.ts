export interface MachineRecord {
  n: string; // Machine name (e.g. "Compression 1A", "Borun 01", "320T 01")
  dept: string; // Department name ("Cap Compression", "Blow Moulding", "Injection", "Secondary")
  st: 'Running' | 'Idle' | 'Not scheduled' | string; // Operational status
  target: number; // Target quantity (units)
  good: number; // Good produced units
  dt: number; // Downtime in minutes
  scrap: number; // Scrap weight in kg
  mat: number; // Total material fed in kg
  wt: number; // Unit weight in grams (e.g. 2.5 for caps, 23.5 for bottles)
  loss: number; // Calculated material loss in kg
  att: number | null; // Attainment ratio (good / target)
  av: number; // Availability ratio ((plannedMins - dt) / plannedMins)
  perf: number; // Performance ratio (good / (target * av))
  q: number; // Quality ratio (good kg / mat kg)
  oee: number | null; // OEE ratio (av * perf * q)
  hk: number | null; // Housekeeping score (0..1)
  cav: string; // Cavity configuration e.g. "24/24" or "14/16"
  cyc: number | null; // Actual cycle time in seconds
  unl: boolean; // Unaccounted material loss flag
  causes: string[]; // Downtime cause descriptions
  cm: string; // Handover comments
}

export interface ShiftReport {
  id: string; // e.g. "2026-11-08_night"
  date: string; // ISO date e.g. "2026-11-08"
  shift: 'day' | 'night';
  hrs: number; // 11 for day, 13 for night
  ld: string; // Shift Leader name e.g. "R. Mudzimba"
  flags: string[]; // Urgent flags (red alerts)
  notes: string[]; // General shift handover notes
  ms: MachineRecord[]; // Machines records
  ingestedVia?: 'whatsapp' | 'gmail_apps_script' | 'gemini_manual' | 'manual';
}

export type UserRole = 'admin' | 'managing_director' | 'supervisor' | 'operator' | 'viewer';

export interface DowntimeCauseDetail {
  rootCause: string;
  action: string;
  owner: string;
}

export type TabKey = 'ov' | 'sh' | 'tr' | 'ch' | 'dt' | 'hk' | 'gd' | 'up';
