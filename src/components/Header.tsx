import React from 'react';
import { 
  Download, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  ChevronDown
} from 'lucide-react';
import { TabType, SlickIncident, TenantProfile } from '../types';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  incident: SlickIncident;
  incidentsList: SlickIncident[];
  onSelectIncident: (inc: SlickIncident) => void;
  tenant: TenantProfile;
  isOffline: boolean;
  onToggleOffline: () => void;
  onOpenMLModal: () => void;
  onOpenTenantModal: () => void;
  onOpenExportMenu: () => void;
  latencyMs: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  incident,
  incidentsList,
  onSelectIncident,
  tenant,
  isOffline,
  onToggleOffline,
  onOpenMLModal,
  onOpenTenantModal,
  onOpenExportMenu,
  latencyMs
}) => {
  const [incidentMenuOpen, setIncidentMenuOpen] = React.useState(false);
  const incidentMenuRef = React.useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (incidentMenuRef.current && !incidentMenuRef.current.contains(event.target as Node)) {
        setIncidentMenuOpen(false);
      }
    };
    if (incidentMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [incidentMenuOpen]);

  return (
    <header className="w-full bg-[var(--color-surface)] border-b border-[var(--color-outline-variant)] sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Brand & Incident Reference Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-on-surface)]">
              SlickTrack
            </h1>
          </div>

          {/* Incident Reference Pill */}
          <div className="relative" ref={incidentMenuRef}>
            <button
              onClick={() => setIncidentMenuOpen(!incidentMenuOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] transition-colors"
              title="Switch Active Maritime Case"
            >
              <span>{incident.referenceNumber}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {incidentMenuOpen && (
              <div 
                className="absolute left-0 mt-1.5 w-64 rounded-md shadow-lg bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIncidentMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--color-outline)] border-b border-[var(--color-outline-variant)]/60">
                  Select Maritime Docket
                </div>
                {incidentsList.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-[var(--color-surface-container-low)] ${
                      inc.id === incident.id ? 'bg-[var(--color-surface-container)] font-semibold text-[var(--color-primary)]' : 'text-[var(--color-on-surface)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono">{inc.referenceNumber}</span>
                      <span className="text-[10px] opacity-70">{inc.status}</span>
                    </div>
                    <span className="text-[11px] text-[var(--color-on-surface-variant)] truncate">{inc.targetVessel} • {inc.locationName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Navigation Tabs (Styled to match the design system pill nav) */}
        <nav className="flex items-center gap-1 sm:gap-1.5 bg-[var(--color-surface-container)] p-1 rounded-full border border-[var(--color-outline-variant)] order-3 md:order-2 w-full md:w-auto justify-center shadow-xs">
          <button
            onClick={() => onTabChange('overview')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
              currentTab === 'overview'
                ? 'bg-[var(--color-primary)] text-white font-semibold shadow-xs'
                : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)]/60'
            }`}
          >
            Overview & Radar
          </button>
          
          <button
            onClick={() => onTabChange('vessel')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
              currentTab === 'vessel'
                ? 'bg-[var(--color-primary)] text-white font-semibold shadow-xs'
                : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)]/60'
            }`}
          >
            Vessel Inspection
          </button>

          <button
            onClick={() => onTabChange('report')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
              currentTab === 'report'
                ? 'bg-[var(--color-primary)] text-white font-semibold shadow-xs'
                : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)]/60'
            }`}
          >
            Case Report
          </button>
        </nav>

        {/* Right: Operational Controls (Simplified & Clean) */}
        <div className="flex items-center gap-2 sm:gap-2.5 order-2 md:order-3">
          
          {/* ML Pipeline Connection Status */}
          <button
            onClick={onOpenMLModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[var(--color-secondary)]/30 bg-[var(--color-secondary-container)]/70 text-[var(--color-secondary)] hover:bg-[var(--color-secondary-container)] transition-colors font-mono"
            title="ML Pipeline Telemetry Hub (Click to inspect pipeline stream)"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--color-secondary)] animate-pulse" />
            <span className="font-semibold">ML {latencyMs}ms</span>
          </button>

          {/* Offline Mode Switch */}
          <button
            onClick={onToggleOffline}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors ${
              isOffline
                ? 'border-amber-600 bg-amber-100 text-amber-900 font-medium'
                : 'border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]'
            }`}
            title={isOffline ? 'Offline Mode Active (Using cached radar tiles)' : 'Online Mode (Click to simulate remote offline)'}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-700" /> : <Wifi className="w-3.5 h-3.5 text-[var(--color-secondary)]" />}
            <span className="text-[11px] font-medium hidden sm:inline">{isOffline ? 'Offline' : 'Online'}</span>
          </button>

          {/* Tenant Switcher Button */}
          <button
            onClick={onOpenTenantModal}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] transition-colors"
            title="Switch Tenant Authority & Access Role"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span className="font-medium truncate max-w-[130px]">{tenant.badge}</span>
          </button>

          {/* Export Report Action Button (Outlined/Primary style from Design System) */}
          <button
            onClick={onOpenExportMenu}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md border border-[var(--color-primary)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold tracking-wide transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Export Report</span>
          </button>

        </div>

      </div>
    </header>
  );
};
