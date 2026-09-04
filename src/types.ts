export type TabType = 'overview' | 'vessel' | 'report';

export interface Coordinates {
  lat: number;
  lng: number;
  label?: string;
  timestamp?: string;
}

export interface SlickIncident {
  id: string;
  referenceNumber: string;
  locationName: string;
  coordinates: string;
  lat: number;
  lng: number;
  estimatedSpillMT: number;
  plumeLengthKm: number;
  targetVessel: string;
  trajectoryMatchPercent: number;
  status: 'Investigation Active' | 'Detention Ordered' | 'Under Review' | 'Resolved';
  portStateControlNotified: boolean;
  satellitePass: string;
  satellitePassDate: string;
  oilType: string;
  oilSignature: string;
  detectionSensor: string;
  currentSeaDrift: string;
  surfaceWind: string;
  closestPointOfApproach: string;
  cpaMeters: number;
  cpaTime: string;
  docketNumber: string;
  incidentClassification: string;
  primaFacieAttribution: string;
  statutoryDepositINR: string;
  statutoryDepositUSD: string;
  evidentiaryHash: string;
  isHashVerified: boolean;
}

export interface VesselProfile {
  name: string;
  mmsi: string;
  imo: string;
  flag: string;
  flagCode: string;
  vesselType: string;
  grossTonnage: number;
  builtYear: number;
  navigationStatus: string;
  destination: string;
  eta: string;
  currentSpeedKts: number;
  headingDeg: number;
  anomalies: {
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
  }[];
}

export interface AuditChecklistItem {
  id: string;
  code: string;
  title: string;
  requirement: string;
  instructions: string;
  status: 'Flagged Discrepancy' | 'Pending Inspection' | 'Sampling Kit Assigned' | 'Verified Compliant';
  notes?: string;
  auditor?: string;
  updatedAt: string;
}

export interface CustodyEvent {
  time: string;
  title: string;
  description: string;
  agent: string;
  status: 'completed' | 'pending' | 'in_progress';
}

export interface MLTelemetryPacket {
  timestamp: string;
  sensorId: string;
  confidenceScore: number;
  capillaryWaveSuppression: number;
  entropyIndex: number;
  driftVectorSpeed: number;
  driftVectorDirection: number;
  sarBackscatterDb: number;
  processingLatencyMs: number;
  noiseFloorRatio: number;
}

export interface TenantProfile {
  id: string;
  name: string;
  jurisdiction: string;
  badge: string;
  role: 'Senior Marine Surveyor' | 'MRCC Duty Officer' | 'Port State Inspector' | 'Remote Sensing Analyst' | 'Director General Admin';
  userName: string;
  accessTier: 'MARPOL Statutory Authority' | 'Operational Coastal Patrol' | 'Technical ML Operations';
  encryptionKeyFingerprint: string;
}

export interface LiveMarineConditions {
  source: 'Open-Meteo Marine API' | 'ECMWF ERA5 Marine' | 'Offline Cached Telemetry';
  windSpeedKts: number;
  windDirectionDeg: number;
  windDirectionCardinal: string;
  waveHeightMeters: number;
  wavePeriodSeconds: number;
  seaWaterTemperatureC: number;
  seaState: string;
  lastUpdated: string;
  isRealtime: boolean;
}

export type ThemeId = 'herbarium' | 'oceanic' | 'tactical' | 'slate' | 'radar_dark';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  subtitle: string;
  category: 'Light' | 'Dark';
  description: string;
  previewColors: {
    surface: string;
    container: string;
    primary: string;
    secondary: string;
    border: string;
  };
}
