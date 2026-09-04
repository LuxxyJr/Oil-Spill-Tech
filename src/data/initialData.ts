import { SlickIncident, VesselProfile, AuditChecklistItem, CustodyEvent, TenantProfile } from '../types';

export const INITIAL_INCIDENT: SlickIncident = {
  id: 'slick-2024-0091',
  referenceNumber: '#SLICK-2024-0091',
  locationName: '82 NM Off Mumbai High',
  coordinates: "18°54'N, 71°48'E",
  lat: 18.900,
  lng: 71.800,
  estimatedSpillMT: 28.4,
  plumeLengthKm: 14.8,
  targetVessel: 'MT Kaveri Voyager',
  trajectoryMatchPercent: 89.4,
  status: 'Investigation Active',
  portStateControlNotified: true,
  satellitePass: 'Sentinel-1B',
  satellitePassDate: 'Oct 24, 04:18 UTC',
  oilType: 'Heavy Bunker C fuel sludge emulsion',
  oilSignature: 'Strong capillary wave suppression on C-band VV radar backscatter',
  detectionSensor: 'Sentinel-1B C-SAR',
  currentSeaDrift: '1.2 knots @ 188° S',
  surfaceWind: 'NW 14.2 knots (Sea State 3)',
  closestPointOfApproach: '180 meters (04:06 UTC)',
  cpaMeters: 180,
  cpaTime: '04:06 UTC',
  docketNumber: 'CG-MARPOL-2024-0091',
  incidentClassification: 'Tier-2 Operational Bunker Discharge (28.4 MT estimated)',
  primaFacieAttribution: 'MT Kaveri Voyager',
  statutoryDepositINR: 'INR 4.5 Cr',
  statutoryDepositUSD: 'USD 540K',
  evidentiaryHash: '9f83a21d56e792e340cb23f9821a78dc3b91a0c451b6e5efb7624911c72b904e',
  isHashVerified: true
};

export const INITIAL_VESSEL: VesselProfile = {
  name: 'MT Kaveri Voyager',
  mmsi: '419001420',
  imo: '9382104',
  flag: 'IND',
  flagCode: 'IN',
  vesselType: 'Crude Tanker',
  grossTonnage: 42500,
  builtYear: 2018,
  navigationStatus: 'En route JNPT (ETA: 14:30 UTC)',
  destination: 'JNPT Port, Mumbai',
  eta: 'Oct 24, 14:30 UTC',
  currentSpeedKts: 13.8,
  headingDeg: 152,
  anomalies: [
    {
      title: 'Draft variance',
      description: '-0.8m unaccounted reduction between Sikka and Mumbai High.',
      severity: 'critical'
    },
    {
      title: 'AIS speed drop',
      description: 'Speed drop to 3.2 kts at 04:02 UTC off Mumbai High apex.',
      severity: 'warning'
    }
  ]
};

export const INITIAL_CHECKLIST: AuditChecklistItem[] = [
  {
    id: 'chk-1',
    code: 'a',
    title: 'a) Oil Record Book (Part II - Cargo/Ballast Ops)',
    requirement: 'Missing mandatory log entry between 03:30Z–04:30Z passage through Sector IV. Audit bilge water transfers and slop sounding records.',
    instructions: 'Examine physical logbook signatures against master electronic fuel management system (EFMS) sensor logs.',
    status: 'Flagged Discrepancy',
    notes: 'Electronic tank level dips show sudden 31 m3 drop in Slop Tank Port at 04:04Z.',
    auditor: 'Capt. R. Deshmukh (PSC Mumbai)',
    updatedAt: '2024-10-24T05:15:00Z'
  },
  {
    id: 'chk-2',
    code: 'b',
    title: 'b) Oily Water Separator (15 PPM Alarm & Auto-Stop)',
    requirement: 'Valve tamper seal inspection required on 3-way divert valve; verify alarm memory logs and actuator override history.',
    instructions: 'Check lead security seal on overboard bypass valve. Extract tamper-proof EEPROM memory chip logs.',
    status: 'Pending Inspection',
    notes: 'Boarding team kit #3 calibrated and assigned for JNPT anchorage rendezvous.',
    auditor: 'Eng. K. Nair',
    updatedAt: '2024-10-24T05:22:00Z'
  },
  {
    id: 'chk-3',
    code: 'c',
    title: 'c) ODME Interlock Telemetry',
    requirement: 'Interlock override suspected during SAR satellite pass. Inspect overboard discharge spool pieces against ECR GPS stamps.',
    instructions: 'Dismantle discharge spool piece to check for fresh heavy fuel oil hydrocarbon residues.',
    status: 'Flagged Discrepancy',
    notes: 'ECR terminal logs show bypass circuit breaker trip recorded at 03:58Z.',
    auditor: 'Capt. R. Deshmukh (PSC Mumbai)',
    updatedAt: '2024-10-24T05:28:00Z'
  },
  {
    id: 'chk-4',
    code: 'd',
    title: 'd) Physical Sludge / Bilge Sampling',
    requirement: 'GC-MS chemical fingerprinting kit prepared. Triplicate fuel oil sludge samples to be taken from heavy fuel service and slop tanks.',
    instructions: 'Collect three 500ml amber glass sample bottles, tamper-evident seals signed by Master and Lead Inspector.',
    status: 'Sampling Kit Assigned',
    notes: 'Chain-of-custody seals #IN-ICG-8821 through 8823 dispatched to patrol vessel ICGS Samrat.',
    auditor: 'Lt. Cdr. V. Sharma',
    updatedAt: '2024-10-24T05:32:00Z'
  }
];

export const INITIAL_CUSTODY_TIMELINE: CustodyEvent[] = [
  {
    time: '04:18Z',
    title: 'Satellite SAR Intercept',
    description: 'Sentinel-1B IW GRD relay detected 14.8 km dark radar slick polygon with strong capillary wave suppression.',
    agent: 'Copernicus SAR Downlink / SlickNet ML Engine',
    status: 'completed'
  },
  {
    time: '04:45Z',
    title: 'Telemetry Correlation',
    description: 'Kinematic trajectory match 89.4% calculated against MT Kaveri Voyager AIS telemetry log and reverse drift model.',
    agent: 'Hydro-Kinematic ML Core v3.4',
    status: 'completed'
  },
  {
    time: '05:30Z',
    title: 'DG Shipping Order Issued',
    description: 'Formal statutory notice of detention & security deposit bond dispatched to JNPT Port Authority.',
    agent: 'Directorate General of Shipping (Enforcement Div)',
    status: 'completed'
  },
  {
    time: '14:30Z (ETA)',
    title: 'Physical Boarding & Sampling',
    description: 'Boarding scheduled upon arrival at JNPT Outer Anchorage by PSC inspection unit & Indian Coast Guard.',
    agent: 'Port State Control Mumbai & ICG MRCC',
    status: 'pending'
  }
];

export const AVAILABLE_TENANTS: TenantProfile[] = [
  {
    id: 'icg-mrcc-mumbai',
    name: 'Indian Coast Guard MRCC Mumbai',
    jurisdiction: 'Indian EEZ & Western Seaboard (Sector IV)',
    badge: 'ICG MARPOL HQ',
    role: 'MRCC Duty Officer',
    userName: 'Cmdr. A. K. Verma',
    accessTier: 'MARPOL Statutory Authority',
    encryptionKeyFingerprint: 'ICG-RSA4096-7882F091'
  },
  {
    id: 'dg-shipping-in',
    name: 'Directorate General of Shipping',
    jurisdiction: 'Statutory Maritime Administration of India',
    badge: 'DG Shipping Official',
    role: 'Senior Marine Surveyor',
    userName: 'Capt. R. Deshmukh',
    accessTier: 'MARPOL Statutory Authority',
    encryptionKeyFingerprint: 'DGS-E2EE-3391A4B0'
  },
  {
    id: 'mpa-singapore',
    name: 'Maritime and Port Authority of Singapore (MPA)',
    jurisdiction: 'Malacca & Singapore Straits Traffic',
    badge: 'MPA Regional',
    role: 'Port State Inspector',
    userName: 'Officer L. Tan',
    accessTier: 'Operational Coastal Patrol',
    encryptionKeyFingerprint: 'MPA-E2EE-9912C78A'
  },
  {
    id: 'emsa-cleanseanet',
    name: 'EMSA CleanSeaNet Maritime Safety',
    jurisdiction: 'European Waters & International Surveillance',
    badge: 'EMSA SAR Unit',
    role: 'Remote Sensing Analyst',
    userName: 'Dr. H. Lindqvist',
    accessTier: 'Technical ML Operations',
    encryptionKeyFingerprint: 'EMSA-CSN-6184E119'
  }
];

export const ALTERNATE_INCIDENTS: SlickIncident[] = [
  INITIAL_INCIDENT,
  {
    id: 'slick-2024-0104',
    referenceNumber: '#SLICK-2024-0104',
    locationName: 'Strait of Malacca Sector 2',
    coordinates: "02°18'N, 102°08'E",
    lat: 2.300,
    lng: 102.133,
    estimatedSpillMT: 41.2,
    plumeLengthKm: 19.4,
    targetVessel: 'VLCC Titan Star',
    trajectoryMatchPercent: 93.1,
    status: 'Detention Ordered',
    portStateControlNotified: true,
    satellitePass: 'Sentinel-1C',
    satellitePassDate: 'Oct 23, 22:40 UTC',
    oilType: 'Crude residue / slop tank washings',
    oilSignature: 'Broad band high-contrast capillary attenuation',
    detectionSensor: 'Sentinel-1C C-SAR',
    currentSeaDrift: '0.8 knots @ 290° NW',
    surfaceWind: 'WNW 11.5 knots (Sea State 2)',
    closestPointOfApproach: '120 meters (22:15 UTC)',
    cpaMeters: 120,
    cpaTime: '22:15 UTC',
    docketNumber: 'MPA-MARPOL-2024-0104',
    incidentClassification: 'Tier-2 High Seas Bilge Discharge (41.2 MT estimated)',
    primaFacieAttribution: 'VLCC Titan Star',
    statutoryDepositINR: 'SGD 1.2M',
    statutoryDepositUSD: 'USD 890K',
    evidentiaryHash: '4a19b28f09c8e11a37c4d51b72e903f8a6192c7102e3b4a5d891e4a2c1f9b3e7',
    isHashVerified: true
  },
  {
    id: 'slick-2024-0112',
    referenceNumber: '#SLICK-2024-0112',
    locationName: 'Bay of Bengal off Paradip',
    coordinates: "20°08'N, 86°45'E",
    lat: 20.133,
    lng: 86.750,
    estimatedSpillMT: 12.6,
    plumeLengthKm: 8.2,
    targetVessel: 'MV Bengal Pioneer',
    trajectoryMatchPercent: 86.7,
    status: 'Investigation Active',
    portStateControlNotified: true,
    satellitePass: 'Sentinel-1A',
    satellitePassDate: 'Oct 24, 01:10 UTC',
    oilType: 'Heavy Fuel Oil 380 CST',
    oilSignature: 'Narrow continuous discharge ribbon',
    detectionSensor: 'Sentinel-1A C-SAR',
    currentSeaDrift: '1.4 knots @ 045° NE',
    surfaceWind: 'SW 16.0 knots (Sea State 4)',
    closestPointOfApproach: '240 meters (00:52 UTC)',
    cpaMeters: 240,
    cpaTime: '00:52 UTC',
    docketNumber: 'CG-PARADIP-2024-0112',
    incidentClassification: 'Tier-1 Oily Bilge Water Discharge (12.6 MT estimated)',
    primaFacieAttribution: 'MV Bengal Pioneer',
    statutoryDepositINR: 'INR 1.8 Cr',
    statutoryDepositUSD: 'USD 215K',
    evidentiaryHash: '8b72e19d45a03c2e1f98d7b6a54c3e2b1098f7e6d5c4b3a210987654321fedcb',
    isHashVerified: true
  }
];
