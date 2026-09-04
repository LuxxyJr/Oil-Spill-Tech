import React from 'react';
import { SlickIncident, LiveMarineConditions } from '../types';
import { ArrowRight, ShieldCheck, Cpu, RefreshCw, Layers } from 'lucide-react';

interface SpillSummaryPanelProps {
  incident: SlickIncident;
  marineConditions: LiveMarineConditions;
  onProceedToVessel: () => void;
  onOpenMLModal: () => void;
}

export const SpillSummaryPanel: React.FC<SpillSummaryPanelProps> = ({
  incident,
  marineConditions,
  onProceedToVessel,
  onOpenMLModal
}) => {
  return (
    <div className="flex flex-col gap-5">
      
      {/* Spill Summary Main Card (Matching Image 1 left container) */}
      <div className="w-full rounded-lg border border-[var(--color-outline-variant)]/70 bg-[var(--color-surface)] p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-colors">
        <div>
          {/* Header & Confidence Badge */}
          <div className="flex items-center justify-between gap-2 border-b border-[var(--color-outline-variant)]/40 pb-4">
            <h2 className="font-serif-display text-2xl font-bold text-[var(--color-on-surface)]">
              Spill Summary
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium tracking-wide bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
              High Confidence
            </span>
          </div>

          {/* Oil Type & Signature */}
          <div className="pt-4">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-outline)]">
              Oil Type & Signature
            </span>
            <p className="font-sans text-sm font-medium text-[var(--color-on-surface)] mt-1 leading-relaxed">
              {incident.oilType} with {incident.oilSignature.toLowerCase()}.
            </p>
          </div>

          {/* Quantitative Metrics Grid (28.4 MT & 14.8 km) */}
          <div className="grid grid-cols-2 gap-4 py-5 border-y border-[var(--color-outline-variant)]/40 my-4">
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-outline)]">
                Estimated Mass
              </span>
              <div className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--color-primary)] mt-0.5">
                {incident.estimatedSpillMT} MT
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-outline)]">
                Plume Length
              </span>
              <div className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--color-on-surface)] mt-0.5">
                {incident.plumeLengthKm} km
              </div>
            </div>
          </div>

          {/* Technical Sensor Spec List */}
          <div className="flex flex-col gap-2.5 text-xs">
            
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-on-surface-variant)]">Detection Sensor:</span>
              <span className="font-mono font-medium text-[var(--color-on-surface)]">
                {incident.detectionSensor}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--color-on-surface-variant)]">Current Sea Drift:</span>
              <span className="font-mono font-medium text-[var(--color-on-surface)]">
                {incident.currentSeaDrift}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--color-on-surface-variant)]">Surface Wind:</span>
              <span className="font-mono font-medium text-[var(--color-on-surface)]">
                {marineConditions.seaState}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--color-on-surface-variant)]">Closest Point of Approach:</span>
              <span className="font-mono font-bold text-[var(--color-primary)]">
                {incident.closestPointOfApproach}
              </span>
            </div>

          </div>
        </div>

        {/* Action Button: Proceed to Vessel Inspection */}
        <div className="mt-6 pt-4 border-t border-[var(--color-outline-variant)]/40">
          <button
            onClick={onProceedToVessel}
            className="w-full py-2.5 px-4 rounded border border-[var(--color-outline)]/40 bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <span>Proceed to Vessel Inspection</span>
            <ArrowRight className="w-4 h-4 text-[var(--color-primary)]" />
          </button>
        </div>

      </div>

      {/* Chain-of-Custody Notice Card (Matching Image 1 bottom box) */}
      <div className="w-full rounded-lg border border-[var(--color-outline-variant)]/60 bg-[var(--color-surface-container)]/50 p-4 sm:p-5 text-xs transition-colors">
        <div className="flex items-center gap-2 font-mono uppercase font-bold tracking-wider text-[11px] text-[var(--color-on-surface)] mb-1.5">
          <ShieldCheck className="w-4 h-4 text-[var(--color-secondary)]" />
          <span>Chain-of-Custody Notice</span>
        </div>
        <p className="text-[var(--color-on-surface-variant)] leading-relaxed">
          Telemetry data is cryptographically timestamped and ready for submission to the Director General of Shipping for statutory enforcement.
        </p>
        <div className="mt-2.5 pt-2 border-t border-[var(--color-outline-variant)]/40 flex items-center justify-between text-[10px] font-mono text-[var(--color-outline)]">
          <span>E2EE SHA-256 SEAL</span>
          <span className="text-[var(--color-primary)] font-semibold truncate max-w-[120px]">
            {incident.evidentiaryHash.slice(0, 16)}...
          </span>
        </div>
      </div>

      {/* Quick ML Pipeline Diagnostics Tile */}
      <div 
        onClick={onOpenMLModal}
        className="w-full rounded-lg border border-dashed border-[var(--color-outline)]/40 hover:border-[var(--color-primary)] p-3.5 bg-[var(--color-surface)] text-xs flex items-center justify-between cursor-pointer transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
          <div>
            <div className="font-mono font-semibold text-[var(--color-on-surface)]">SlickNet-SAR v3.4</div>
            <div className="text-[10px] text-[var(--color-outline)]">FPN ResNet-50 • 94.8% mAP</div>
          </div>
        </div>
        <div className="text-right font-mono text-[11px] text-[var(--color-secondary)]">
          Config &gt;
        </div>
      </div>

    </div>
  );
};
