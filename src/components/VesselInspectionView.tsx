import React, { useState } from 'react';
import { VesselProfile, AuditChecklistItem, CustodyEvent, SlickIncident } from '../types';
import { 
  Send
} from 'lucide-react';

interface VesselInspectionViewProps {
  incident: SlickIncident;
  vessel: VesselProfile;
  checklist: AuditChecklistItem[];
  timeline: CustodyEvent[];
  onUpdateChecklistItem: (id: string, newStatus: AuditChecklistItem['status'], notes?: string) => void;
  onDispatchBoardingParty: () => void;
  isBoardingDispatched: boolean;
}

export const VesselInspectionView: React.FC<VesselInspectionViewProps> = ({
  incident,
  vessel,
  checklist,
  timeline,
  onUpdateChecklistItem,
  onDispatchBoardingParty,
  isBoardingDispatched
}) => {
  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      
      {/* Title & Statutory Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--color-outline-variant)] pb-5 mb-8 gap-4">
        <div>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-normal tracking-tight text-[var(--color-on-surface)]">
            Vessel Inspection & Statutory Verification
          </h2>
          <p className="font-sans text-sm text-[var(--color-on-surface-variant)] mt-1">
            Target vessel MARPOL Annex I compliance audit and physical boarding docket.
          </p>
        </div>
        <div className="font-mono text-xs text-[var(--color-outline)]">
          Target IMO: {vessel.imo} • ETA JNPT: {vessel.eta}
        </div>
      </div>

      {/* Main Grid: Left Vessel Profile / Right Mandatory Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        
        {/* Left Column: Target Vessel Profile (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5 sm:p-6 shadow-xs">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-outline-variant)]/60 pb-4">
              <h3 className="font-serif-display text-2xl font-bold text-[var(--color-on-surface)]">
                Target Vessel Profile
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium tracking-wide bg-[var(--color-primary-container)] text-[var(--color-primary)] border border-[var(--color-primary)]/30">
                Priority Audit
              </span>
            </div>

            {/* Spec Table */}
            <div className="flex flex-col gap-3.5 py-5 border-b border-[var(--color-outline-variant)]/60 text-xs">
              
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-on-surface-variant)]">Vessel Name:</span>
                <span className="font-serif-display text-sm font-bold text-[var(--color-on-surface)]">
                  {vessel.name}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--color-on-surface-variant)]">Identifier / MMSI:</span>
                <span className="font-mono font-medium text-[var(--color-on-surface)]">
                  MMSI: {vessel.mmsi}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--color-on-surface-variant)]">Type & Flag:</span>
                <span className="font-sans font-medium text-[var(--color-on-surface)]">
                  {vessel.vesselType} • {vessel.flag}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--color-on-surface-variant)]">Gross Tonnage:</span>
                <span className="font-mono font-medium text-[var(--color-on-surface)]">
                  {vessel.grossTonnage.toLocaleString()} GT (Built {vessel.builtYear})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--color-on-surface-variant)]">Navigation Status:</span>
                <span className="font-sans font-medium text-[var(--color-on-surface)]">
                  {vessel.navigationStatus}
                </span>
              </div>

            </div>

            {/* Key Anomalies Recorded */}
            <div className="py-4 bg-[var(--color-surface-container)] p-4 rounded-md my-4 border border-[var(--color-outline-variant)]">
              <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2.5">
                Key Anomalies Recorded
              </span>
              
              <ul className="flex flex-col gap-2 text-xs">
                {vessel.anomalies.map((anom, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[var(--color-on-surface)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1.5 shrink-0" />
                    <span>
                      <strong className="font-semibold">{anom.title}: </strong>
                      <span className="text-[var(--color-on-surface-variant)]">{anom.description}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dispatch Port State Boarding Party Button */}
            <div className="pt-2">
              <button
                onClick={onDispatchBoardingParty}
                disabled={isBoardingDispatched}
                className={`w-full py-3 px-4 rounded-md text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all shadow-xs ${
                  isBoardingDispatched
                    ? 'bg-[var(--color-secondary)] text-white cursor-default'
                    : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white active:scale-[0.99]'
                }`}
              >
                <span>{isBoardingDispatched ? 'Boarding Party En Route to JNPT' : 'Dispatch Port State Boarding Party'}</span>
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Statutory Enforcement Authority */}
          <div className="w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)]/70 p-4 sm:p-5 text-xs">
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--color-on-surface)] mb-1.5">
              Statutory Enforcement Authority
            </h4>
            <p className="text-[var(--color-on-surface-variant)] leading-relaxed">
              Authorized under Merchant Shipping Act (Sec 356H) & MARPOL Annex I. Inspection boarding coordinated via Indian Coast Guard District HQ 2 Pollution Cell.
            </p>
          </div>

        </div>

        {/* Right Column: MARPOL Annex I Mandatory Checklist & Evidence (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5 sm:p-6 shadow-xs">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-outline-variant)]/60 pb-4 mb-4">
              <h3 className="font-serif-display text-2xl font-bold text-[var(--color-on-surface)]">
                MARPOL Annex I Mandatory Checklist & Evidence
              </h3>
              <span className="font-mono text-xs text-[var(--color-outline)]">
                {checklist.length} Mandatory Audits
              </span>
            </div>

            {/* Checklist Items */}
            <div className="flex flex-col gap-4">
              {checklist.map((item) => {
                const isFlagged = item.status === 'Flagged Discrepancy';
                const isPending = item.status === 'Pending Inspection';
                const isSampling = item.status === 'Sampling Kit Assigned';

                return (
                  <div 
                    key={item.id}
                    className={`rounded-lg border p-4 sm:p-5 transition-colors ${
                      isFlagged 
                        ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary-container)]/30' 
                        : 'border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      
                      <div className="flex items-start gap-2.5">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          isFlagged ? 'bg-[var(--color-primary)]' : isPending ? 'bg-amber-600' : isSampling ? 'bg-[var(--color-secondary)]' : 'bg-emerald-700'
                        }`} />
                        <div>
                          <h4 className="font-serif-display text-base sm:text-lg font-bold text-[var(--color-on-surface)]">
                            {item.title}
                          </h4>
                          <p className="font-sans text-xs text-[var(--color-on-surface-variant)] mt-1 leading-relaxed">
                            {item.requirement}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-mono font-medium ${
                          isFlagged 
                            ? 'bg-[var(--color-primary-container)] text-[var(--color-primary)] border border-[var(--color-primary)]/40'
                            : isPending 
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : isSampling
                            ? 'bg-[var(--color-secondary-container)] text-[var(--color-secondary)] border border-[var(--color-secondary)]/30'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                    </div>

                    {/* Inspection Notes & Auditor Stamp */}
                    {item.notes && (
                      <div className="mt-3.5 pt-3 border-t border-[var(--color-outline-variant)]/60 flex flex-wrap items-center justify-between text-xs font-mono text-[var(--color-on-surface-variant)] gap-2">
                        <div>
                          <span className="text-[var(--color-outline)]">Surveyor Note: </span>
                          <span>{item.notes}</span>
                        </div>
                        {item.auditor && (
                          <div className="text-[10px] text-[var(--color-outline)]">
                            Signed: {item.auditor}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interactive quick status toggle */}
                    <div className="mt-3 flex items-center gap-2 pt-2 text-[11px] font-mono">
                      <span className="text-[var(--color-outline)]">Update Status:</span>
                      <button
                        onClick={() => onUpdateChecklistItem(item.id, 'Flagged Discrepancy')}
                        className={`px-2 py-0.5 rounded border transition-colors ${
                          item.status === 'Flagged Discrepancy' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'hover:bg-[var(--color-surface-container)] border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)]'
                        }`}
                      >
                        Flag
                      </button>
                      <button
                        onClick={() => onUpdateChecklistItem(item.id, 'Pending Inspection')}
                        className={`px-2 py-0.5 rounded border transition-colors ${
                          item.status === 'Pending Inspection' ? 'bg-amber-700 text-white border-amber-700' : 'hover:bg-[var(--color-surface-container)] border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)]'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => onUpdateChecklistItem(item.id, 'Sampling Kit Assigned')}
                        className={`px-2 py-0.5 rounded border transition-colors ${
                          item.status === 'Sampling Kit Assigned' ? 'bg-[var(--color-secondary)] text-white border-[var(--color-secondary)]' : 'hover:bg-[var(--color-surface-container)] border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)]'
                        }`}
                      >
                        Sampling
                      </button>
                      <button
                        onClick={() => onUpdateChecklistItem(item.id, 'Verified Compliant')}
                        className={`px-2 py-0.5 rounded border transition-colors ${
                          item.status === 'Verified Compliant' ? 'bg-emerald-700 text-white border-emerald-700' : 'hover:bg-[var(--color-surface-container)] border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)]'
                        }`}
                      >
                        Clear
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

      {/* Chain-of-Custody Timeline */}
      <div className="w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[var(--color-outline-variant)]/60 pb-3 mb-5">
          <h3 className="font-serif-display text-xl font-bold text-[var(--color-on-surface)]">
            Chain-of-Custody Timeline
          </h3>
          <span className="font-mono text-xs text-[var(--color-outline)]">
            Statutory Enforcement Protocol
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {timeline.slice(0, 3).map((event, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-md border border-[var(--color-outline-variant)]/60 bg-[var(--color-surface-container-low)] text-xs"
            >
              <div className="font-mono font-bold text-xs text-[var(--color-primary)]">
                {event.timestamp}
              </div>
              <div className="font-serif-display text-base font-semibold text-[var(--color-on-surface)] mt-0.5">
                {event.eventType}
              </div>
              <div className="font-sans text-xs text-[var(--color-on-surface-variant)] mt-1">
                By: {event.actor}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
