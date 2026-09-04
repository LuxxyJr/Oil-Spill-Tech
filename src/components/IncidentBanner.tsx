import React from 'react';
import { SlickIncident, LiveMarineConditions } from '../types';
import { Compass, Wind, Waves } from 'lucide-react';

interface IncidentBannerProps {
  incident: SlickIncident;
  marineConditions: LiveMarineConditions;
}

export const IncidentBanner: React.FC<IncidentBannerProps> = ({ incident, marineConditions }) => {
  return (
    <div className="w-full bg-[var(--color-surface-container)]/50 border-b border-[var(--color-outline-variant)]/60 py-3.5 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6 items-start">
        
        {/* Location */}
        <div>
          <span className="block text-[10px] font-mono tracking-widest uppercase text-[var(--color-outline)]">
            Location
          </span>
          <p className="font-serif-display text-base font-semibold text-[var(--color-on-surface)] truncate">
            {incident.locationName}
          </p>
          <span className="block text-xs font-mono text-[var(--color-on-surface-variant)]">
            {incident.coordinates}
          </span>
        </div>

        {/* Estimated Spill */}
        <div>
          <span className="block text-[10px] font-mono tracking-widest uppercase text-[var(--color-outline)]">
            Estimated Spill
          </span>
          <p className="font-serif-display text-base font-bold text-[var(--color-primary)]">
            {incident.estimatedSpillMT} Metric Tonnes
          </p>
          <span className="block text-xs text-[var(--color-on-surface-variant)]">
            {incident.plumeLengthKm} km plume length
          </span>
        </div>

        {/* Target Vessel */}
        <div>
          <span className="block text-[10px] font-mono tracking-widest uppercase text-[var(--color-outline)]">
            Target Vessel
          </span>
          <p className="font-serif-display text-base font-semibold text-[var(--color-on-surface)] truncate">
            {incident.targetVessel}
          </p>
          <span className="block text-xs text-[var(--color-on-surface-variant)]">
            {incident.trajectoryMatchPercent}% trajectory match
          </span>
        </div>

        {/* Status */}
        <div>
          <span className="block text-[10px] font-mono tracking-widest uppercase text-[var(--color-outline)]">
            Status
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping opacity-75" />
            <p className="font-serif-display text-base font-semibold text-[var(--color-on-surface)]">
              {incident.status}
            </p>
          </div>
          <span className="block text-xs text-[var(--color-on-surface-variant)]">
            Port State Control notified
          </span>
        </div>

        {/* Live Marine Telemetry Feed (Real Open-Meteo Integration) */}
        <div className="hidden lg:block col-span-1 border-l border-[var(--color-outline-variant)]/50 pl-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--color-secondary)]">
              Live Ocean Sensor
            </span>
            <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 px-1 rounded">
              {marineConditions.isRealtime ? 'LIVE API' : 'CACHED'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-on-surface)]">
            <Wind className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
            <span className="font-medium">{marineConditions.seaState}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--color-on-surface-variant)] mt-0.5">
            <Waves className="w-3.5 h-3.5 opacity-70" />
            <span>Wave {marineConditions.waveHeightMeters}m @ {marineConditions.wavePeriodSeconds}s • {marineConditions.seaWaterTemperatureC}°C</span>
          </div>
        </div>

      </div>
    </div>
  );
};
