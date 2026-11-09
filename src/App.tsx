import React, { useState, useEffect, useMemo } from 'react';
import { ShiftReport, MachineRecord, TabKey } from './types/oee';
import { INITIAL_REPORTS } from './data/initialReports';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { ShiftsTab } from './components/ShiftsTab';
import { TrendsTab } from './components/TrendsTab';
import { ChartsTab } from './components/ChartsTab';
import { DowntimeTab } from './components/DowntimeTab';
import { HousekeepingTab } from './components/HousekeepingTab';
import { GuideTab } from './components/GuideTab';
import { UploadTab } from './components/UploadTab';
import { TvModeOverlay } from './components/TvModeOverlay';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  subscribeToShiftReports,
  saveShiftReportToFirestore,
  seedReportsToFirestore
} from './services/reportSync';

function MainApp() {
  const { isAdmin } = useAuth();

  // Theme state
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('rig_oee_dark');
    if (saved !== null) return saved === 'true';
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  // Active navigation tab
  const [tab, setTab] = useState<TabKey>('ov');

  // Reports collection with localStorage buffer fallback
  const [reports, setReports] = useState<ShiftReport[]>(() => {
    try {
      const saved = localStorage.getItem('rig_oee_reports');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading saved reports from localStorage', e);
    }
    return INITIAL_REPORTS;
  });

  // Real-time Firestore sync status
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  // Selected shift ID (defaults to latest recorded shift)
  const [selId, setSelId] = useState<string>('2026-11-08_night');

  // Date filter (Nov 1+ only filter)
  const [octFilter, setOctFilter] = useState<boolean>(true);

  // Active deep dive modal for selected machine
  const [selectedMachineModal, setSelectedMachineModal] = useState<MachineRecord | null>(null);

  // Success / alert notification banner
  const [banner, setBanner] = useState<string | null>(null);

  // TV Kiosk mode state
  const [tvMode, setTvMode] = useState<boolean>(false);
  const [tvSlide, setTvSlide] = useState<number>(0);
  const [tvPaused, setTvPaused] = useState<boolean>(false);

  // Subscribe to real-time reports from Firestore
  useEffect(() => {
    setIsCloudSyncing(true);
    const unsubscribe = subscribeToShiftReports(
      (firestoreReports) => {
        setIsCloudSyncing(false);
        if (firestoreReports.length > 0) {
          setReports(firestoreReports);
          try {
            localStorage.setItem('rig_oee_reports', JSON.stringify(firestoreReports));
          } catch (e) {
            console.warn('LocalStorage save notice:', e);
          }
        }
      },
      (error) => {
        setIsCloudSyncing(false);
        console.warn('Firestore realtime sync in buffer mode:', error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  // Strict role enforcement: If non-admin attempts to view Upload tab, redirect to Overview
  useEffect(() => {
    if (!isAdmin && tab === 'up') {
      setTab('ov');
    }
  }, [isAdmin, tab]);

  // Sync dark mode class on document.documentElement
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('rig_oee_dark', String(dark));
  }, [dark]);

  // Filtered reports based on Nov 1+ toggle
  const R = useMemo(() => {
    const list = octFilter ? reports : reports.filter((r) => r.date >= '2026-11-01');
    return [...list].sort((a, b) =>
      (a.date + (a.shift === 'day' ? '0' : '1')).localeCompare(
        b.date + (b.shift === 'day' ? '0' : '1')
      )
    );
  }, [reports, octFilter]);

  // Current selected report
  const currentReport = useMemo(() => {
    return (
      R.find((x) => x.id === selId) ||
      R[R.length - 1] ||
      INITIAL_REPORTS[INITIAL_REPORTS.length - 1]
    );
  }, [R, selId]);

  // Auto-slide carousel in TV mode (10s per slide)
  useEffect(() => {
    if (!tvMode || tvPaused) return;
    const timer = setInterval(() => {
      setTvSlide((prev) => (prev + 1) % 4);
    }, 10000);
    return () => clearInterval(timer);
  }, [tvMode, tvPaused]);

  // Auto-dismiss banner after 6 seconds
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 6000);
    return () => clearTimeout(t);
  }, [banner]);

  // Handler for adding a newly uploaded shift report
  const handleAddReport = async (newReport: ShiftReport) => {
    // Optimistic local update
    setReports((prev) => {
      const existingIdx = prev.findIndex((r) => r.id === newReport.id);
      let updated: ShiftReport[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = newReport;
      } else {
        updated = [...prev, newReport];
      }
      try {
        localStorage.setItem('rig_oee_reports', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving updated reports to localStorage', err);
      }
      return updated;
    });

    setSelId(newReport.id);
    setBanner(
      `✓ Broadcast shift ${newReport.date} (${newReport.shift.toUpperCase()}) across plant dashboard in real-time!`
    );
    setTab('ov');

    // Persist to Cloud Firestore for live broadcast across all devices
    try {
      await saveShiftReportToFirestore(newReport);
    } catch (err) {
      console.warn('Real-time cloud broadcast will retry:', err);
    }
  };

  // Handler for seeding 20 historical reports to Firestore
  const handleSeedDatabase = async () => {
    const res = await seedReportsToFirestore(INITIAL_REPORTS);
    setBanner(`✓ Synchronized ${res.count} historical shift reports to Firebase Firestore!`);
  };

  // If in full-screen TV kiosk mode
  if (tvMode) {
    return (
      <TvModeOverlay
        report={currentReport}
        allReports={R}
        tvSlide={tvSlide}
        tvPaused={tvPaused}
        onSetSlide={setTvSlide}
        onTogglePause={() => setTvPaused(!tvPaused)}
        onExit={() => setTvMode(false)}
      />
    );
  }

  return (
    <div
      className={`min-h-screen font-sans text-[14px] leading-[1.45] transition-colors duration-200 pb-20 lg:pb-8 ${
        dark ? 'bg-[#0f172a] text-[#e8ecf1]' : 'bg-[#f8fafc] text-[#18212d]'
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        activeTab={tab}
        onSelectTab={setTab}
        dark={dark}
        onToggleDark={() => setDark(!dark)}
        octFilter={octFilter}
        onToggleOctFilter={() => setOctFilter(!octFilter)}
        shiftCount={R.length}
        onEnterTvMode={() => {
          setTvMode(true);
          setTvSlide(0);
        }}
      />

      {/* Notification Toast Banner */}
      {banner && (
        <div className="max-w-[1240px] mx-auto px-4 pt-3">
          <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex justify-between items-center shadow-md animate-in fade-in duration-200">
            <span>{banner}</span>
            <button
              onClick={() => setBanner(null)}
              className="text-white font-bold px-2 py-0.5 hover:bg-emerald-700 rounded-lg transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="max-w-[1240px] mx-auto p-4 space-y-4">
        {tab === 'ov' && (
          <OverviewTab
            currentReport={currentReport}
            allReports={R}
            selectedId={selId}
            onSelectId={setSelId}
            selectedMachineModal={selectedMachineModal}
            onSelectMachineModal={setSelectedMachineModal}
            dark={dark}
          />
        )}

        {tab === 'sh' && (
          <ShiftsTab
            reports={R}
            selectedId={selId}
            onSelectId={(id) => {
              setSelId(id);
              setTab('ov');
            }}
            onSelectMachineModal={setSelectedMachineModal}
            dark={dark}
          />
        )}

        {tab === 'tr' && <TrendsTab reports={R} dark={dark} />}

        {tab === 'ch' && <ChartsTab reports={R} dark={dark} />}

        {tab === 'dt' && <DowntimeTab reports={R} dark={dark} />}

        {tab === 'hk' && <HousekeepingTab reports={R} dark={dark} />}

        {tab === 'gd' && <GuideTab dark={dark} />}

        {tab === 'up' && isAdmin && (
          <UploadTab
            onAddReport={handleAddReport}
            onSeedDatabase={handleSeedDatabase}
            dark={dark}
          />
        )}
      </main>

      {/* Offline connectivity indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
