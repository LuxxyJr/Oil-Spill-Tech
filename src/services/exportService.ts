import { jsPDF } from 'jspdf';
import { SlickIncident, VesselProfile, AuditChecklistItem } from '../types';

export function downloadOfficialReportPDF(
  incident: SlickIncident,
  vessel: VesselProfile,
  checklist: AuditChecklistItem[]
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Background and borders
  doc.setFillColor(255, 248, 245); // Warm parchment #fff8f5
  doc.rect(0, 0, 210, 297, 'F');

  // Header band
  doc.setFillColor(124, 37, 56); // #7c2538 deep rose
  doc.rect(14, 14, 182, 16, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('SLICKTRACK MARITIME POLLUTION TELEMETRY DOSSIER', 18, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('STANDARD: IMO GISIS MARPOL I/II • UNCLOS ART. 220', 120, 24);

  // Subtitle
  doc.setTextColor(36, 25, 16);
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text('Official Incident Case Report & Statutory Evidentiary Docket', 14, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(85, 66, 68);
  doc.text(`Docket: ${incident.docketNumber}   |   Case Ref: ${incident.referenceNumber}   |   Generated: ${new Date().toISOString()}`, 14, 46);

  // Horizontal divider
  doc.setDrawColor(219, 192, 194);
  doc.setLineWidth(0.4);
  doc.line(14, 49, 196, 49);

  // Executive summary card
  doc.setFillColor(255, 234, 218); // #ffeada container
  doc.roundedRect(14, 53, 182, 42, 2, 2, 'F');
  doc.setDrawColor(136, 114, 116);
  doc.roundedRect(14, 53, 182, 42, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(124, 37, 56);
  doc.text('EXECUTIVE CASE SUMMARY & ATTRIBUTION', 18, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(36, 25, 16);
  doc.text(`• Incident Classification: ${incident.incidentClassification}`, 18, 67);
  doc.text(`• Target Vessel: ${vessel.name} (MMSI: ${vessel.mmsi} | IMO: ${vessel.imo} | Flag: ${vessel.flag})`, 18, 73);
  doc.text(`• Geographic Location: ${incident.locationName} (${incident.coordinates})`, 18, 79);
  doc.text(`• Estimated Discharge Mass: ${incident.estimatedSpillMT} Metric Tonnes  |  Plume Length: ${incident.plumeLengthKm} km`, 18, 85);
  doc.text(`• Kinematic Correlation: ${incident.trajectoryMatchPercent}%  |  Closest Point of Approach: ${incident.closestPointOfApproach}`, 18, 91);

  // Statutory Detention Box
  doc.setFillColor(255, 218, 214); // alert container
  doc.roundedRect(14, 100, 182, 22, 2, 2, 'F');
  doc.setDrawColor(186, 26, 26);
  doc.roundedRect(14, 100, 182, 22, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(186, 26, 26);
  doc.text('KEY STATUTORY ACTION: NOTICE OF DETENTION & SECURITY DEPOSIT ORDER', 18, 107);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(36, 25, 16);
  doc.text(
    `Formal statutory detention notice lodged under Merchant Shipping Act (Sec 356H) and MARPOL Annex I. Mandatory Security Deposit Bond set at ${incident.statutoryDepositINR} / ${incident.statutoryDepositUSD} prior to port clearance release from JNPT.`,
    18,
    113,
    { maxWidth: 174 }
  );

  // SAR Radar & Sensor Telemetry table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(124, 37, 56);
  doc.text('RADAR & SATELLITE TELEMETRY SPECIFICATIONS', 14, 130);

  const telemetryData = [
    ['Sensor Architecture', `${incident.detectionSensor} (Dual-Pol VV/VH)`],
    ['Satellite Pass Timestamp', `${incident.satellitePassDate} (${incident.satellitePass})`],
    ['Hydrocarbon Signature', incident.oilType],
    ['Morphology Details', incident.oilSignature],
    ['Ocean Surface Drift', incident.currentSeaDrift],
    ['Surface Wind Conditions', incident.surfaceWind],
    ['CPA Geometry', `${incident.cpaMeters}m separation at ${incident.cpaTime}`]
  ];

  let currentY = 136;
  doc.setFontSize(8);
  telemetryData.forEach(([label, value], i) => {
    doc.setFillColor(i % 2 === 0 ? 250 : 255, 240, 230);
    doc.rect(14, currentY - 4, 182, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(85, 66, 68);
    doc.text(label, 16, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(36, 25, 16);
    doc.text(value, 80, currentY);
    currentY += 6;
  });

  // MARPOL Inspection Audit status
  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(124, 37, 56);
  doc.text('MARPOL ANNEX I STATUTORY AUDIT FINDINGS', 14, currentY);
  currentY += 6;

  checklist.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(item.status === 'Flagged Discrepancy' ? 186 : 86, item.status === 'Flagged Discrepancy' ? 26 : 97, item.status === 'Flagged Discrepancy' ? 26 : 83);
    doc.text(`[${item.status.toUpperCase()}] ${item.title}`, 16, currentY);
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 50, 45);
    doc.text(item.requirement, 18, currentY, { maxWidth: 174 });
    currentY += 6;
  });

  // Evidentiary Cryptographic Seal
  currentY += 4;
  doc.setFillColor(244, 223, 206);
  doc.roundedRect(14, currentY, 182, 16, 1.5, 1.5, 'F');
  doc.setDrawColor(136, 114, 116);
  doc.roundedRect(14, currentY, 182, 16, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(124, 37, 56);
  doc.text('EVIDENTIARY CRYPTOGRAPHIC SEAL (SHA-256)', 18, currentY + 6);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(36, 25, 16);
  doc.text(incident.evidentiaryHash, 18, currentY + 11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(86, 97, 83);
  doc.text('TAMPER-EVIDENT VERIFIED [UNCLOS ART. 220 COMPLIANT]', 120, currentY + 6);

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(136, 114, 116);
  doc.text('CONFIDENTIAL STATUTORY DOSSIER — ISSUED FOR DIRECTOR GENERAL OF SHIPPING & INDIAN COAST GUARD MRCC', 14, 287);

  doc.save(`SlickTrack-CaseReport-${incident.referenceNumber.replace('#', '')}.pdf`);
}

export function downloadTelemetryCSV(
  incident: SlickIncident,
  vessel: VesselProfile,
  checklist: AuditChecklistItem[]
): void {
  const rows: (string | number)[][] = [
    ['SLICKTRACK MARITIME TELEMETRY EXPORT'],
    ['Generated At', new Date().toISOString()],
    ['Case Reference', incident.referenceNumber],
    ['Docket Number', incident.docketNumber],
    ['Status', incident.status],
    ['Location Name', incident.locationName],
    ['Latitude', incident.lat],
    ['Longitude', incident.lng],
    ['Estimated Spill Mass (MT)', incident.estimatedSpillMT],
    ['Plume Length (km)', incident.plumeLengthKm],
    ['Target Vessel Name', vessel.name],
    ['Target Vessel MMSI', vessel.mmsi],
    ['Target Vessel IMO', vessel.imo],
    ['Target Flag', vessel.flag],
    ['Vessel Speed (kts)', vessel.currentSpeedKts],
    ['Heading (deg)', vessel.headingDeg],
    ['Closest Point of Approach (m)', incident.cpaMeters],
    ['CPA Timestamp', incident.cpaTime],
    ['Trajectory Correlation (%)', incident.trajectoryMatchPercent],
    ['Satellite Sensor', incident.detectionSensor],
    ['Surface Wind', incident.surfaceWind],
    ['Current Sea Drift', incident.currentSeaDrift],
    ['Statutory Deposit INR', incident.statutoryDepositINR],
    ['Evidentiary SHA256 Hash', incident.evidentiaryHash],
    [],
    ['MARPOL CHECKLIST ITEM', 'STATUS', 'REQUIREMENT', 'LAST UPDATED'],
    ...checklist.map(c => [c.title, c.status, `"${c.requirement.replace(/"/g, '""')}"`, c.updatedAt]),
    [],
    ['AIS TRAJECTORY COORDINATE LOGS (REPLAY)'],
    ['Timestamp UTC', 'Latitude', 'Longitude', 'Speed Kts', 'Course Deg', 'Note'],
    ['2024-10-24T03:45:00Z', 18.962, 71.745, 14.2, 155, 'Normal transit'],
    ['2024-10-24T04:02:00Z', 18.921, 71.782, 3.2, 148, 'AIS speed drop to 3.2 kts'],
    ['2024-10-24T04:06:00Z', 18.905, 71.798, 3.4, 150, 'Apex Intersect (CPA 180m from plume head)'],
    ['2024-10-24T04:18:00Z', 18.882, 71.815, 13.8, 152, 'Satellite SAR Intercept - vessel accelerates'],
    ['2024-10-24T05:00:00Z', 18.810, 71.860, 14.0, 150, 'En route JNPT port limits']
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `SlickTrack-Telemetry-${incident.referenceNumber.replace('#', '')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadGeoJSON(incident: SlickIncident): void {
  const geojson = {
    type: 'FeatureCollection',
    metadata: {
      caseRef: incident.referenceNumber,
      docket: incident.docketNumber,
      satellitePass: incident.satellitePass,
      targetVessel: incident.targetVessel,
      evidentiaryHash: incident.evidentiaryHash
    },
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'SAR Slick Plume Footprint',
          lengthKm: incident.plumeLengthKm,
          estimatedMassMT: incident.estimatedSpillMT,
          sensor: incident.detectionSensor,
          fillColor: '#7c2538'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [71.780, 18.935],
            [71.802, 18.910],
            [71.815, 18.885],
            [71.820, 18.860],
            [71.810, 18.868],
            [71.795, 18.895],
            [71.775, 18.925],
            [71.780, 18.935]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: {
          name: 'Target Vessel Trajectory (MT Kaveri Voyager)',
          mmsi: '419001420',
          closestPointOfApproach: '180m at 04:06 UTC'
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [71.745, 18.962],
            [71.782, 18.921],
            [71.798, 18.905],
            [71.815, 18.882],
            [71.860, 18.810]
          ]
        }
      },
      {
        type: 'Feature',
        properties: {
          name: 'Apex Intersect (CPA 180m)',
          timestamp: '2024-10-24T04:06:00Z',
          separationMeters: 180
        },
        geometry: {
          type: 'Point',
          coordinates: [71.798, 18.905]
        }
      },
      {
        type: 'Feature',
        properties: {
          name: 'India 200 NM Exclusive Economic Zone (EEZ) Boundary'
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [71.60, 18.70],
            [71.75, 18.80],
            [71.90, 18.90],
            [72.05, 19.00]
          ]
        }
      }
    ]
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geojson, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `SlickTrack-RadarFootprint-${incident.referenceNumber.replace('#', '')}.geojson`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
}
