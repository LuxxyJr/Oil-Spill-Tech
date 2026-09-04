import React, { useState, useEffect } from 'react';
import { 
  TabType, 
  SlickIncident, 
  TenantProfile, 
  LiveMarineConditions, 
  VesselProfile, 
  AuditChecklistItem, 
  CustodyEvent 
} from './types';
import { 
  INITIAL_INCIDENT,
  ALTERNATE_INCIDENTS, 
  INITIAL_VESSEL, 
  INITIAL_CHECKLIST, 
  INITIAL_CUSTODY_TIMELINE, 
  AVAILABLE_TENANTS 
} from './data/initialData';
import { fetchLiveMarineConditions } from './services/liveMarineService';
import { saveCachedIncidentData, enqueueOfflineMutation } from './services/offlineStorage';
import { Header } from './components/Header';
import { IncidentBanner } from './components/IncidentBanner';
import { SpillSummaryPanel } from './components/SpillSummaryPanel';
import { TacticalRadarMap } from './components/TacticalRadarMap';
import { VesselInspectionView } from './components/VesselInspectionView';
import { CaseReportView } from './components/CaseReportView';
import { MLPipelineModal } from './components/MLPipelineModal';
import { AuthTenantModal } from './components/AuthTenantModal';
import { CustomReportBuilderModal } from './components/CustomReportBuilderModal';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<TabType>('overview');

  // Incidents Data
  const [incidentsList] = useState<SlickIncident[]>(ALTERNATE_INCIDENTS);
  const [activeIncident, setActiveIncident] = useState<SlickIncident>(INITIAL_INCIDENT);

  // Vessel & Audits
  const [vessel, setVessel] = useState<VesselProfile>(INITIAL_VESSEL);
  const [checklist, setChecklist] = useState<AuditChecklistItem[]>(INITIAL_CHECKLIST);
  const [timeline, setTimeline] = useState<CustodyEvent[]>(INITIAL_CUSTODY_TIMELINE);
  const [isBoardingDispatched, setIsBoardingDispatched] = useState<boolean>(false);

  // Multi-tenant & Security
  const [currentTenant, setCurrentTenant] = useState<TenantProfile>(AVAILABLE_TENANTS[0]);

  // Offline Mode State
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Live Marine Conditions
  const [marineConditions, setMarineConditions] = useState<LiveMarineConditions>({
    windSpeedKnots: 14.2,
    windDirectionDeg: 310,
    seaState: 'NW 14.2 knots (Sea State 3)',
    currentSpeedKnots: 1.2,
    currentDirectionDeg: 188,
    waveHeightMeters: 1.4,
    wavePeriodSeconds: 6.2,
    seaWaterTemperatureC: 28.6,
    isRealtime: false,
    dataSource: 'Copernicus / Open-Meteo'
  });

  // ML Pipeline Simulation Latency
  const [latencyMs, setLatencyMs] = useState<number>(24);

  // Modals state
  const [isMLModalOpen, setIsMLModalOpen] = useState<boolean>(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState<boolean>(false);
  const [isCustomReportModalOpen, setIsCustomReportModalOpen] = useState<boolean>(false);

  // Fetch Live Marine Weather on load and when incident changes
  useEffect(() => {
    let isMounted = true;
    async function loadMarineData() {
      if (isOffline) return;
      const data = await fetchLiveMarineConditions(18.9, 71.8);
      if (isMounted) {
        setMarineConditions(data);
      }
    }
    loadMarineData();
    const interval = setInterval(loadMarineData, 60000); // 1-minute live refresh
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOffline]);

  // Cache active incident locally for offline resiliency
  useEffect(() => {
    saveCachedIncidentData(activeIncident.id, activeIncident);
  }, [activeIncident]);

  // Live ML latency jitter simulator (< 32ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setLatencyMs(prev => Math.max(16, Math.min(38, prev + Math.floor(Math.random() * 5) - 2)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleOffline = () => {
    setIsOffline(prev => !prev);
  };

  const handleUpdateChecklistItem = (id: string, newStatus: AuditChecklistItem['status'], notes?: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: newStatus, notes: notes !== undefined ? notes : item.notes }
          : item
      )
    );

    const updatedItem = checklist.find(c => c.id === id);
    if (updatedItem) {
      enqueueOfflineMutation({
        type: 'CHECKLIST_UPDATE',
        payload: { id, status: newStatus, notes: notes ?? '' }
      });
    }
  };

  const handleDispatchBoardingParty = () => {
    setIsBoardingDispatched(true);
    const newEvent: CustodyEvent = {
      time: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      title: 'Coast Guard Boarding Party Dispatched',
      description: 'Port State Control boarding team launched via ICGS Samrat interceptor craft.',
      agent: currentTenant.userName,
      status: 'in_progress'
    };
    setTimeline(prev => [newEvent, ...prev]);

    enqueueOfflineMutation({
      type: 'BOARDING_ORDER',
      payload: {
        time: newEvent.time,
        title: newEvent.title,
        description: newEvent.description,
        agent: newEvent.agent,
        status: newEvent.status
      }
    });
  };

  const handleUpdateIncidentML = (newConfidence: number, newMass: number) => {
    setActiveIncident(prev => ({
      ...prev,
      trajectoryMatchPercent: newConfidence,
      estimatedSpillMT: newMass
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)] flex flex-col font-sans selection:bg-[var(--color-primary)] selection:text-white">
      
      {/* 1. Header with brand, incident switcher, navigation pills, and system controls */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        incident={activeIncident}
        incidentsList={incidentsList}
        onSelectIncident={setActiveIncident}
        tenant={currentTenant}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        onOpenMLModal={() => setIsMLModalOpen(true)}
        onOpenTenantModal={() => setIsTenantModalOpen(true)}
        onOpenExportMenu={() => setIsCustomReportModalOpen(true)}
        latencyMs={latencyMs}
      />

      {/* 2. Sub-Header 4-Column Incident Banner (Location, Spill, Target Vessel, Status) */}
      <IncidentBanner 
        incident={activeIncident} 
        marineConditions={marineConditions} 
      />

      {/* 3. Main Operational Work Area */}
      <main className="grow">
        
        {/* Tab 1: Overview & Tactical Radar */}
        {currentTab === 'overview' && (
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Spill Summary & Legal Notice (4 cols) */}
              <div className="lg:col-span-4">
                <SpillSummaryPanel
                  incident={activeIncident}
                  marineConditions={marineConditions}
                  onProceedToVessel={() => setCurrentTab('vessel')}
                  onOpenMLModal={() => setIsMLModalOpen(true)}
                />
              </div>

              {/* Right Column: Tactical Radar View Map (8 cols) */}
              <div className="lg:col-span-8">
                <TacticalRadarMap
                  incident={activeIncident}
                  marineConditions={marineConditions}
                  isDarkMode={false}
                />
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Vessel Inspection & Statutory Verification */}
        {currentTab === 'vessel' && (
          <VesselInspectionView
            incident={activeIncident}
            vessel={vessel}
            checklist={checklist}
            timeline={timeline}
            onUpdateChecklistItem={handleUpdateChecklistItem}
            onDispatchBoardingParty={handleDispatchBoardingParty}
            isBoardingDispatched={isBoardingDispatched}
          />
        )}

        {/* Tab 3: Official Incident Case Report & Export */}
        {currentTab === 'report' && (
          <CaseReportView
            incident={activeIncident}
            vessel={vessel}
            checklist={checklist}
            tenant={currentTenant}
            onOpenCustomReportModal={() => setIsCustomReportModalOpen(true)}
          />
        )}

      </main>

      {/* 4. Modals and Dialog Hubs */}
      <MLPipelineModal
        isOpen={isMLModalOpen}
        onClose={() => setIsMLModalOpen(false)}
        incident={activeIncident}
        onUpdateIncidentML={handleUpdateIncidentML}
        latencyMs={latencyMs}
      />

      <AuthTenantModal
        isOpen={isTenantModalOpen}
        onClose={() => setIsTenantModalOpen(false)}
        currentTenant={currentTenant}
        onSelectTenant={setCurrentTenant}
      />

      <CustomReportBuilderModal
        isOpen={isCustomReportModalOpen}
        onClose={() => setIsCustomReportModalOpen(false)}
        incident={activeIncident}
        vessel={vessel}
        checklist={checklist}
      />

    </div>
  );
}
