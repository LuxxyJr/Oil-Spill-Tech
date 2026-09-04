import React, { useState } from 'react';
import { SlickIncident, VesselProfile, AuditChecklistItem } from '../types';
import { 
  X, 
  FileText, 
  Download, 
  Table, 
  Layers, 
  CheckSquare, 
  Square, 
  Sliders 
} from 'lucide-react';
import { downloadOfficialReportPDF, downloadTelemetryCSV, downloadGeoJSON } from '../services/exportService';

interface CustomReportBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: SlickIncident;
  vessel: VesselProfile;
  checklist: AuditChecklistItem[];
}

export const CustomReportBuilderModal: React.FC<CustomReportBuilderModalProps> = ({
  isOpen,
  onClose,
  incident,
  vessel,
  checklist
}) => {
  const [includeSAR, setIncludeSAR] = useState(true);
  const [includeAIS, setIncludeAIS] = useState(true);
  const [includeDrift, setIncludeDrift] = useState(true);
  const [includeMARPOL, setIncludeMARPOL] = useState(true);
  const [includeBoarding, setIncludeBoarding] = useState(true);
  const [includeCrypto, setIncludeCrypto] = useState(true);

  const [customRemarks, setCustomRemarks] = useState(
    'Surveyor recommendations: Immediately dispatch boarding team upon berthing at JNPT BP-02. Secure custody of engine room Oil Record Book Part II and duplicate digital ODME telemetry flash logs.'
  );

  if (!isOpen) return null;

  const handleExportPDF = () => {
    // Create an incident copy with updated remarks if desired
    downloadOfficialReportPDF(incident, vessel, checklist);
  };

  const handleExportCSV = () => {
    downloadTelemetryCSV(incident, vessel, checklist);
  };

  const handleExportGeoJSON = () => {
    downloadGeoJSON(incident);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#fff8f5] dark:bg-[#1f1614] border border-[#dbc0c2] dark:border-[#554244] rounded-lg shadow-2xl flex flex-col overflow-hidden text-[#241910] dark:text-[#faede7]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#dbc0c2]/60 dark:border-[#554244]/60 bg-[#ffeada]/40 dark:bg-[#281d1a]/50 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#7c2538] dark:text-[#e6758a]" />
              <h3 className="font-serif-display text-2xl font-bold text-[#241910] dark:text-[#faede7]">
                Custom Report Generator & Regulatory Dossier Tool
              </h3>
            </div>
            <p className="font-sans text-xs text-[#554244] dark:text-[#d4bec0] mt-1">
              Select evidentiary sections, tailor surveyor observations, and compile certified dossiers for multi-tenant maritime authorities.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#ffeada] dark:hover:bg-[#322521] text-[#887274] hover:text-[#241910] dark:hover:text-[#faede7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 max-h-[60vh] text-xs">
          
          {/* Section Selection Checklist */}
          <div>
            <span className="block font-mono text-xs font-bold uppercase tracking-wider text-[#241910] dark:text-[#faede7] mb-2.5">
              Include Evidentiary Modules
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { label: 'SAR Satellite Backscatter Calibration', state: includeSAR, set: setIncludeSAR },
                { label: 'Kinematic AIS Closest Point of Approach (CPA)', state: includeAIS, set: setIncludeAIS },
                { label: 'Hydrodynamic Reverse-Drift Trajectory Model', state: includeDrift, set: setIncludeDrift },
                { label: 'MARPOL Annex I Statutory Checklist', state: includeMARPOL, set: setIncludeMARPOL },
                { label: 'Port State Boarding & Sampling Protocols', state: includeBoarding, set: setIncludeBoarding },
                { label: 'SHA-256 Tamper-Evident Cryptographic Seal', state: includeCrypto, set: setIncludeCrypto }
              ].map((sec, idx) => (
                <label 
                  key={idx}
                  onClick={() => sec.set(!sec.state)}
                  className={`p-3 rounded border flex items-center gap-2.5 cursor-pointer transition-colors ${
                    sec.state 
                      ? 'border-[#7c2538]/40 bg-[#ffd9dd]/30 dark:bg-[#7c2538]/20 text-[#241910] dark:text-[#faede7]' 
                      : 'border-[#dbc0c2]/50 bg-[#ffffff] dark:bg-[#251b18] text-[#887274]'
                  }`}
                >
                  <input type="checkbox" checked={sec.state} readOnly className="sr-only" />
                  {sec.state ? (
                    <CheckSquare className="w-4 h-4 text-[#7c2538] dark:text-[#e6758a] shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-[#887274] shrink-0" />
                  )}
                  <span className="font-medium text-xs">{sec.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Surveyor Remarks Input */}
          <div>
            <span className="block font-mono text-xs font-bold uppercase tracking-wider text-[#241910] dark:text-[#faede7] mb-1.5">
              Surveyor Remarks & Enforcement Directives
            </span>
            <textarea
              rows={4}
              value={customRemarks}
              onChange={(e) => setCustomRemarks(e.target.value)}
              className="w-full p-3 rounded border border-[#dbc0c2] dark:border-[#554244] bg-[#ffffff] dark:bg-[#16110f] text-[#241910] dark:text-[#faede7] text-xs font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#7c2538]"
              placeholder="Enter custom directives for Port State Control surveyors..."
            />
          </div>

          {/* Export Buttons Grid */}
          <div className="pt-2 border-t border-[#dbc0c2]/40 dark:border-[#554244]/40">
            <span className="block font-mono text-[11px] uppercase tracking-wider text-[#887274] dark:text-[#9c8486] mb-3">
              Generate Formats
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleExportPDF}
                className="py-2.5 px-3 rounded bg-[#7c2538] hover:bg-[#9a3c4e] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="py-2.5 px-3 rounded border border-[#887274]/40 bg-[#fff8f5] dark:bg-[#281d1a] hover:bg-[#ffeada] dark:hover:bg-[#322521] text-[#241910] dark:text-[#faede7] text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Table className="w-3.5 h-3.5 text-[#7c2538] dark:text-[#e6758a]" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleExportGeoJSON}
                className="py-2.5 px-3 rounded border border-[#887274]/40 bg-[#fff8f5] dark:bg-[#281d1a] hover:bg-[#ffeada] dark:hover:bg-[#322521] text-[#241910] dark:text-[#faede7] text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Layers className="w-3.5 h-3.5 text-[#7c2538] dark:text-[#e6758a]" />
                <span>Export GeoJSON</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#dbc0c2]/60 dark:border-[#554244]/60 bg-[#ffeada]/30 dark:bg-[#281d1a]/50 flex items-center justify-between text-xs font-mono text-[#887274]">
          <span>UNCLOS Compliant Evidentiary Dossier Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#554244] hover:bg-[#322521] text-white text-xs font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
