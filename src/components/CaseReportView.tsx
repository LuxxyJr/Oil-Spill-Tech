import React, { useState } from 'react';
import { SlickIncident, VesselProfile, AuditChecklistItem, TenantProfile } from '../types';
import { 
  Download, 
  FileText, 
  CheckCircle2, 
  Send, 
  Lock, 
  ShieldCheck, 
  Copy, 
  Check, 
  Table,
  Layers
} from 'lucide-react';
import { downloadOfficialReportPDF, downloadTelemetryCSV, downloadGeoJSON } from '../services/exportService';

interface CaseReportViewProps {
  incident: SlickIncident;
  vessel: VesselProfile;
  checklist: AuditChecklistItem[];
  tenant: TenantProfile;
  onOpenCustomReportModal: () => void;
}

export const CaseReportView: React.FC<CaseReportViewProps> = ({
  incident,
  vessel,
  checklist,
  tenant,
  onOpenCustomReportModal
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [transmittedDGS, setTransmittedDGS] = useState(false);
  const [transmittedICG, setTransmittedICG] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(incident.evidentiaryHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleTransmitDGS = () => {
    setTransmittedDGS(true);
    setTimeout(() => alert('Evidentiary Docket #SLICK-2024-0091 successfully transmitted with SHA-256 digital signature to DG Shipping Enforcement Division.'), 100);
  };

  const handleTransmitICG = () => {
    setTransmittedICG(true);
    setTimeout(() => alert('Maritime Pollution Alert broadcast sent to Indian Coast Guard MRCC Mumbai & Offshore Patrol Vessel ICGS Samrat.'), 100);
  };

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--color-outline-variant)] pb-5 mb-8 gap-4">
        <div>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-normal tracking-tight text-[var(--color-on-surface)]">
            Official Incident Case Report
          </h2>
          <p className="font-sans text-sm text-[var(--color-on-surface-variant)] mt-1">
            Statutory evidentiary dossier compiled under MARPOL Annex I & UNCLOS Art. 220.
          </p>
        </div>
        <div className="font-mono text-xs text-[var(--color-outline)]">
          Docket: {incident.docketNumber} • Case Ref {incident.referenceNumber}
        </div>
      </div>

      {/* Main Grid: Left Docket Summary / Right Export & Transmission */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        
        {/* Left Column: Official Report Docket & Executive Summary (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <div className="w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 sm:p-7 shadow-xs">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-outline-variant)]/60 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
                <h3 className="font-serif-display text-2xl font-bold text-[var(--color-on-surface)]">
                  Official Report Docket & Executive Summary
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium tracking-wide bg-[var(--color-primary-container)] text-[var(--color-primary)] border border-[var(--color-primary)]/30">
                Statutory Prima Facie
              </span>
            </div>

            {/* Case Ref & Classification Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
              
              <div className="p-4 rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-outline)]">
                  Case Reference
                </span>
                <div className="font-mono text-base font-bold text-[var(--color-on-surface)] mt-0.5">
                  {incident.referenceNumber}
                </div>
                <div className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
                  Indian EEZ Sector IV
                </div>
              </div>

              <div className="p-4 rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-outline)]">
                  Incident Classification
                </span>
                <div className="font-serif-display text-base font-bold text-[var(--color-primary)] mt-0.5">
                  Tier-2 Operational Bunker Discharge
                </div>
                <div className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
                  {incident.estimatedSpillMT} MT estimated
                </div>
              </div>

            </div>

            {/* Structured Prima Facie Specs Table */}
            <div className="flex flex-col gap-3.5 py-4 border-y border-[var(--color-outline-variant)]/60 text-xs">
              
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-on-surface-variant)]">Prima Facie Attribution:</span>
                <span className="font-serif-display text-sm font-bold text-[var(--color-on-surface)]">
                  {incident.primaFacieAttribution}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--color-on-surface-variant)]">Kinematic Trajectory Correlation:</span>
                <span className="font-mono font-medium text-[var(--color-on-surface)]">
                  {incident.trajectoryMatchPercent}% hydro-kinematic correlation (CPA 180m)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--color-on-surface-variant)]">Detection Telemetry:</span>
                <span className="font-mono font-medium text-[var(--color-on-surface)]">
                  {incident.detectionSensor} • {incident.satellitePassDate}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--color-on-surface-variant)]">Geographic Coordinates:</span>
                <span className="font-mono font-medium text-[var(--color-on-surface)]">
                  18°54'12"N, 71°48'36"E ({incident.locationName})
                </span>
              </div>

            </div>

            {/* Key Statutory Action Box */}
            <div className="my-5 p-4 rounded-md border border-[var(--color-primary)]/30 bg-[var(--color-primary-container)]/25 flex items-start gap-3">
              <div className="p-1.5 rounded bg-[var(--color-primary-container)] text-[var(--color-primary)] shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif-display text-sm font-bold text-[var(--color-primary)]">
                  Key Statutory Action: Notice of Detention & Security Deposit Order
                </h4>
                <p className="font-sans text-xs text-[var(--color-on-surface)] mt-1 leading-relaxed">
                  Formal statutory detention notice lodged under Indian Merchant Shipping Act (Sec 356H) and MARPOL Annex I. Mandatory Security Deposit Bond set at <strong className="font-bold text-[var(--color-primary)]">{incident.statutoryDepositINR} / {incident.statutoryDepositUSD}</strong> prior to port clearance release from JNPT.
                </p>
              </div>
            </div>

            {/* Evidentiary Cryptographic Seal */}
            <div className="p-3.5 rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                <span className="font-mono text-[11px] text-[var(--color-on-surface-variant)]">
                  Evidentiary Seal:
                </span>
                <span className="font-mono font-semibold text-[var(--color-on-surface)] truncate max-w-[200px]">
                  SHA-256: {incident.evidentiaryHash.slice(0, 7)}...{incident.evidentiaryHash.slice(-8)}
                </span>
                <button
                  onClick={handleCopyHash}
                  className="p-1 text-[var(--color-outline)] hover:text-[var(--color-on-surface)]"
                  title="Copy full cryptographic SHA-256 seal"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-medium tracking-wide bg-[var(--color-secondary-container)] text-[var(--color-secondary)] border border-[var(--color-secondary)]/30 self-start sm:self-auto">
                Tamper-Evident Verified
              </span>
            </div>

          </div>

        </div>

        {/* Right Column: Dossier Export & Transmission (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 sm:p-7 shadow-xs">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-outline-variant)]/60 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                <h3 className="font-serif-display text-2xl font-bold text-[var(--color-on-surface)]">
                  Dossier Export & Transmission
                </h3>
              </div>
              <span className="font-mono text-xs text-[var(--color-outline)]">
                Regulatory Packet
              </span>
            </div>

            {/* Primary Action: Download Official Report (PDF) */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => downloadOfficialReportPDF(incident, vessel, checklist)}
                className="w-full py-3.5 px-4 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:scale-[0.99] text-white text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Official Report (PDF)</span>
              </button>

              {/* Secondary Action: Export Telemetry Data (GeoJSON / CSV) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => downloadTelemetryCSV(incident, vessel, checklist)}
                  className="py-2.5 px-3 rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface)] text-xs font-medium tracking-wide flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Table className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => downloadGeoJSON(incident)}
                  className="py-2.5 px-3 rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface)] text-xs font-medium tracking-wide flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>Export GeoJSON</span>
                </button>
              </div>

              {/* Custom Report Builder Trigger */}
              <button
                onClick={onOpenCustomReportModal}
                className="w-full py-2 px-3 rounded-md border border-dashed border-[var(--color-outline)] hover:border-[var(--color-primary)] text-[11px] font-mono text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
              >
                + Open Custom Report Builder Tool
              </button>
            </div>

            {/* Included Evidence Docket Checklist */}
            <div className="mt-6 pt-5 border-t border-[var(--color-outline-variant)]/60">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-outline)] mb-3">
                Included Evidence Docket Checklist
              </span>

              <div className="flex flex-col gap-2.5 text-xs text-[var(--color-on-surface)]">
                
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-secondary)] shrink-0" />
                  <span>Sentinel-1B SAR radar calibrated imagery (IW GRD)</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-secondary)] shrink-0" />
                  <span>AIS track trajectory & Closest Point of Approach log (180m)</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-secondary)] shrink-0" />
                  <span>Hydro-kinematic reverse drift simulation model</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-secondary)] shrink-0" />
                  <span>Port State Control boarding checklist & sampling order</span>
                </div>

              </div>
            </div>

            {/* Transmit Directly to Authorities */}
            <div className="mt-6 pt-5 border-t border-[var(--color-outline-variant)]/60">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-outline)] mb-3">
                Transmit Directly to Authorities
              </span>

              <div className="flex flex-col gap-2.5">
                
                <button
                  onClick={handleTransmitDGS}
                  disabled={transmittedDGS}
                  className={`w-full py-2.5 px-3.5 rounded-md border border-[var(--color-outline-variant)] text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                    transmittedDGS
                      ? 'bg-[var(--color-secondary-container)] text-[var(--color-secondary)]'
                      : 'bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface)]'
                  }`}
                >
                  <Send className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>{transmittedDGS ? 'Transmitted to DG Shipping' : 'Transmit to Director General of Shipping'}</span>
                </button>

                <button
                  onClick={handleTransmitICG}
                  disabled={transmittedICG}
                  className={`w-full py-2.5 px-3.5 rounded-md border border-[var(--color-outline-variant)] text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                    transmittedICG
                      ? 'bg-[var(--color-secondary-container)] text-[var(--color-secondary)]'
                      : 'bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface)]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                  <span>{transmittedICG ? 'Notified ICG MRCC' : 'Notify Indian Coast Guard MRCC'}</span>
                </button>

              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Official Bottom Footer Notice */}
      <div className="w-full border-t border-[var(--color-outline-variant)] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[var(--color-outline)] gap-2">
        <div>
          SlickTrack Maritime Pollution Telemetry • Confidential Operational Dossier
        </div>
        <div>
          Standard: IMO GISIS MARPOL I/II • Generated: 2024-10-24T05:00:00Z
        </div>
      </div>

    </div>
  );
};
