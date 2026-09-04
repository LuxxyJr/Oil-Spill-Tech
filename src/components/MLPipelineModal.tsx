import React, { useState, useEffect } from 'react';
import { SlickIncident, MLTelemetryPacket } from '../types';
import { 
  X, 
  Cpu, 
  Activity, 
  Radio, 
  RefreshCw, 
  Sliders, 
  ShieldCheck, 
  Play, 
  Pause, 
  Check 
} from 'lucide-react';

interface MLPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: SlickIncident;
  onUpdateIncidentML: (newConfidence: number, newMass: number) => void;
  latencyMs: number;
}

export const MLPipelineModal: React.FC<MLPipelineModalProps> = ({
  isOpen,
  onClose,
  incident,
  onUpdateIncidentML,
  latencyMs
}) => {
  const [polarization, setPolarization] = useState<'VV' | 'VH' | 'DUAL_VV_VH'>('DUAL_VV_VH');
  const [sensitivity, setSensitivity] = useState<number>(0.89);
  const [dampeningCoeff, setDampeningCoeff] = useState<number>(1.4);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [packets, setPackets] = useState<MLTelemetryPacket[]>([]);
  const [isInferring, setIsInferring] = useState<boolean>(false);

  // Generate simulated incoming real-time telemetry packets
  useEffect(() => {
    if (!isOpen || !isStreaming) return;

    const interval = setInterval(() => {
      const newPacket: MLTelemetryPacket = {
        timestamp: new Date().toISOString().substring(11, 23) + 'Z',
        sensorId: 'SENTINEL-1B-IW-GRD',
        confidenceScore: Math.round((sensitivity + (Math.random() * 0.04 - 0.02)) * 1000) / 10,
        capillaryWaveSuppression: Math.round((14.2 + (Math.random() * 0.6 - 0.3)) * 10) / 10,
        entropyIndex: Math.round((0.42 + Math.random() * 0.05) * 100) / 100,
        driftVectorSpeed: 1.2,
        driftVectorDirection: 188,
        sarBackscatterDb: Math.round((-22.4 + (Math.random() * 0.8 - 0.4)) * 10) / 10,
        processingLatencyMs: Math.round(latencyMs + (Math.random() * 4 - 2)),
        noiseFloorRatio: 1.8
      };

      setPackets(prev => [newPacket, ...prev.slice(0, 9)]);
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen, isStreaming, sensitivity, latencyMs]);

  if (!isOpen) return null;

  const handleTriggerInference = () => {
    setIsInferring(true);
    setTimeout(() => {
      setIsInferring(false);
      const updatedConfidence = Math.round(sensitivity * 1000) / 10;
      const updatedMass = Math.round((28.4 + (Math.random() * 1.2 - 0.6)) * 10) / 10;
      onUpdateIncidentML(updatedConfidence, updatedMass);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#fff8f5] dark:bg-[#1f1614] border border-[#dbc0c2] dark:border-[#554244] rounded-lg shadow-2xl flex flex-col overflow-hidden text-[#241910] dark:text-[#faede7]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#dbc0c2]/60 dark:border-[#554244]/60 bg-[#ffeada]/40 dark:bg-[#281d1a]/50 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#7c2538] dark:text-[#e6758a]" />
              <h3 className="font-serif-display text-2xl font-bold text-[#241910] dark:text-[#faede7]">
                SlickNet-SAR Machine Learning Telemetry Ingestion Hub
              </h3>
            </div>
            <p className="font-sans text-xs text-[#554244] dark:text-[#d4bec0] mt-1">
              Deep CNN / ResNet-50 Feature Pyramid Network for real-time Synthetic Aperture Radar slick segmentation and reverse-drift trajectory correlation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#ffeada] dark:hover:bg-[#322521] text-[#887274] hover:text-[#241910] dark:hover:text-[#faede7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Status & Diagnostics Grid */}
        <div className="p-6 border-b border-[#dbc0c2]/40 dark:border-[#554244]/40 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#ffffff] dark:bg-[#251b18]">
          
          <div className="p-3 rounded border border-[#dbc0c2]/50 dark:border-[#554244]/50 bg-[#fff8f5]/60 dark:bg-[#281d1a]/50">
            <span className="text-[10px] font-mono uppercase text-[#887274] dark:text-[#9c8486]">Pipeline Latency</span>
            <div className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {latencyMs} ms
            </div>
            <span className="text-[10px] text-[#554244] dark:text-[#d4bec0]">Target: &lt; 35ms</span>
          </div>

          <div className="p-3 rounded border border-[#dbc0c2]/50 dark:border-[#554244]/50 bg-[#fff8f5]/60 dark:bg-[#281d1a]/50">
            <span className="text-[10px] font-mono uppercase text-[#887274] dark:text-[#9c8486]">Inference Accuracy</span>
            <div className="font-mono text-xl font-bold text-[#7c2538] dark:text-[#e6758a] mt-0.5">
              {incident.trajectoryMatchPercent}% mAP
            </div>
            <span className="text-[10px] text-[#554244] dark:text-[#d4bec0]">Validated on Sentinel-1 IW</span>
          </div>

          <div className="p-3 rounded border border-[#dbc0c2]/50 dark:border-[#554244]/50 bg-[#fff8f5]/60 dark:bg-[#281d1a]/50">
            <span className="text-[10px] font-mono uppercase text-[#887274] dark:text-[#9c8486]">Streaming Gateway</span>
            <div className="flex items-center gap-1.5 mt-1 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>ACTIVE WSS</span>
            </div>
            <span className="text-[10px] text-[#554244] dark:text-[#d4bec0]">AES-GCM-256 E2EE</span>
          </div>

          <div className="p-3 rounded border border-[#dbc0c2]/50 dark:border-[#554244]/50 bg-[#fff8f5]/60 dark:bg-[#281d1a]/50">
            <span className="text-[10px] font-mono uppercase text-[#887274] dark:text-[#9c8486]">Sensor Geometry</span>
            <div className="font-mono text-sm font-bold text-[#241910] dark:text-[#faede7] mt-0.5">
              10m C-SAR GRD
            </div>
            <span className="text-[10px] text-[#554244] dark:text-[#d4bec0]">Pixel Footprint 250km</span>
          </div>

        </div>

        {/* Middle: Interactive Tuning Parameters & Live Stream */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[50vh]">
          
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#241910] dark:text-[#faede7] flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#7c2538] dark:text-[#e6758a]" />
              <span>Inference Hyperparameters</span>
            </h4>

            {/* Polarization Band selector */}
            <div className="flex flex-col gap-1.5 text-xs">
              <span className="text-[#554244] dark:text-[#d4bec0] font-medium">SAR Polarization Band:</span>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                {(['VV', 'VH', 'DUAL_VV_VH'] as const).map((pol) => (
                  <button
                    key={pol}
                    onClick={() => setPolarization(pol)}
                    className={`py-1.5 px-2 rounded border text-center transition-colors ${
                      polarization === pol
                        ? 'bg-[#7c2538] text-white border-[#7c2538]'
                        : 'bg-[#ffffff] dark:bg-[#281d1a] border-[#dbc0c2] hover:bg-[#ffeada]'
                    }`}
                  >
                    {pol === 'DUAL_VV_VH' ? 'Dual VV/VH' : pol}
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence Threshold Slider */}
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#554244] dark:text-[#d4bec0]">Confidence Threshold:</span>
                <span className="font-mono font-bold text-[#7c2538] dark:text-[#e6758a]">{(sensitivity * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="0.99"
                step="0.01"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                className="accent-[#7c2538] cursor-pointer"
              />
            </div>

            {/* Capillary Wave Dampening */}
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#554244] dark:text-[#d4bec0]">Capillary Suppression Coeff:</span>
                <span className="font-mono font-bold">{dampeningCoeff} σ₀ dB</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={dampeningCoeff}
                onChange={(e) => setDampeningCoeff(parseFloat(e.target.value))}
                className="accent-[#7c2538] cursor-pointer"
              />
            </div>

            {/* Trigger Re-Inference button */}
            <button
              onClick={handleTriggerInference}
              disabled={isInferring}
              className="mt-2 w-full py-2.5 px-3 rounded bg-[#7c2538] hover:bg-[#9a3c4e] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isInferring ? 'animate-spin' : ''}`} />
              <span>{isInferring ? 'Re-Running Neural Segmenter...' : 'Re-Run Segmenter on Sector IV'}</span>
            </button>
          </div>

          {/* Live Ingestion Stream Feed (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#241910] dark:text-[#faede7] flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Real-Time Telemetry Stream Ingest</span>
              </h4>
              <button
                onClick={() => setIsStreaming(!isStreaming)}
                className="text-[11px] font-mono text-[#554244] hover:text-[#241910] dark:text-[#d4bec0] flex items-center gap-1"
              >
                {isStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isStreaming ? 'Pause Stream' : 'Resume'}</span>
              </button>
            </div>

            <div className="rounded border border-[#dbc0c2]/60 dark:border-[#554244]/60 bg-[#16110f] p-3 text-emerald-400 font-mono text-[11px] h-52 overflow-y-auto space-y-1.5">
              {packets.map((pkt, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-emerald-950 pb-1 opacity-90 hover:opacity-100">
                  <span className="text-zinc-500">[{pkt.timestamp}]</span>
                  <span className="text-emerald-300">{pkt.sensorId}</span>
                  <span className="text-amber-300">Conf: {pkt.confidenceScore}%</span>
                  <span className="text-rose-400">Backscatter: {pkt.sarBackscatterDb}dB</span>
                  <span className="text-emerald-500">{pkt.processingLatencyMs}ms</span>
                </div>
              ))}
              {packets.length === 0 && (
                <div className="text-zinc-500 text-center py-8">Awaiting SAR raster frames from ESA downlink...</div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#dbc0c2]/60 dark:border-[#554244]/60 bg-[#ffeada]/30 dark:bg-[#281d1a]/50 flex items-center justify-between text-xs font-mono text-[#887274]">
          <span>E2EE WebSocket Transport Layer • Protocol v3.4</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#7c2538] hover:bg-[#9a3c4e] text-white text-xs font-medium"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
};
