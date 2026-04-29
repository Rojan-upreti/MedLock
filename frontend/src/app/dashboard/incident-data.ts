export type IncidentSeverity = "Critical" | "High" | "Medium" | "Low";
export type IncidentStatus = "New" | "Triage" | "Investigating" | "Contained" | "Monitoring" | "Closed";
export type BreachDecision = "Not started" | "Assessment" | "Not reportable" | "Reportable" | "Notice drafted";

export type ServiceNowIncident = {
  id: string;
  snowNumber: string;
  title: string;
  source: string;
  category: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  priority: string;
  openedAt: string;
  updatedAt: string;
  dueAt: string;
  owner: string;
  assignmentGroup: string;
  affectedSystem: string;
  affectedRecords: number;
  phiSignal: string;
  breachDecision: BreachDecision;
  patientNoticeDue?: string;
  regulatorNoticeDue?: string;
  businessImpact: string;
  nextAction: string;
  evidence: string[];
  timeline: Array<{ time: string; event: string; actor: string }>;
};

export const serviceNowIncidents: ServiceNowIncident[] = [
  {
    id: "inc-001",
    snowNumber: "INC0012488",
    title: "Potential PHI export from analytics workspace",
    source: "ServiceNow Security Incident",
    category: "Unauthorized disclosure",
    severity: "Critical",
    status: "Investigating",
    priority: "P1",
    openedAt: "Apr 28, 08:12",
    updatedAt: "Apr 28, 19:44",
    dueAt: "Apr 29, 08:12",
    owner: "Security Officer",
    assignmentGroup: "Security Operations",
    affectedSystem: "Analytics Warehouse",
    affectedRecords: 1240,
    phiSignal: "Export contained patient identifiers and encounter metadata",
    breachDecision: "Assessment",
    patientNoticeDue: "Jun 27, 2026",
    regulatorNoticeDue: "Jun 27, 2026",
    businessImpact: "Possible reportable breach if disclosure cannot be ruled out",
    nextAction: "Complete access reconstruction and confirm external recipient scope",
    evidence: ["SIEM alert DD-4431", "Warehouse query log", "User session export", "DLP packet capture"],
    timeline: [
      { time: "08:12", event: "ServiceNow created incident from Datadog DLP signal", actor: "Automation" },
      { time: "09:05", event: "Security started containment and token review", actor: "Security Officer" },
      { time: "13:30", event: "Privacy opened four-factor breach assessment", actor: "Privacy Officer" },
      { time: "19:44", event: "Evidence package attached for counsel review", actor: "Compliance Manager" },
    ],
  },
  {
    id: "inc-002",
    snowNumber: "INC0012492",
    title: "Misdirected patient statement email",
    source: "ServiceNow Case Intake",
    category: "Patient communication",
    severity: "High",
    status: "Contained",
    priority: "P2",
    openedAt: "Apr 28, 10:21",
    updatedAt: "Apr 28, 17:10",
    dueAt: "Apr 30, 10:21",
    owner: "Privacy Officer",
    assignmentGroup: "Privacy Response",
    affectedSystem: "Resend transactional email",
    affectedRecords: 17,
    phiSignal: "Email body included appointment dates and billing summary",
    breachDecision: "Reportable",
    patientNoticeDue: "Jun 27, 2026",
    regulatorNoticeDue: "Jun 27, 2026",
    businessImpact: "Low-volume impermissible disclosure with confirmed recipient access",
    nextAction: "Finalize patient notification packet and OCR portal draft",
    evidence: ["Email event log", "Recipient confirmation", "Template version", "Containment memo"],
    timeline: [
      { time: "10:21", event: "Case opened from support escalation", actor: "Support Lead" },
      { time: "11:18", event: "Message rule disabled and template locked", actor: "Developer" },
      { time: "14:05", event: "Recipient confirmed message was opened", actor: "Privacy Officer" },
      { time: "17:10", event: "Breach marked reportable pending legal review", actor: "Privacy Officer" },
    ],
  },
  {
    id: "inc-003",
    snowNumber: "INC0012474",
    title: "Vendor subcontractor evidence missing during support access",
    source: "ServiceNow Vendor Risk",
    category: "Business associate",
    severity: "High",
    status: "Triage",
    priority: "P2",
    openedAt: "Apr 27, 16:48",
    updatedAt: "Apr 28, 15:12",
    dueAt: "Apr 29, 16:48",
    owner: "Compliance Manager",
    assignmentGroup: "Vendor Governance",
    affectedSystem: "Support Desk",
    affectedRecords: 390,
    phiSignal: "Support session may include names, MRNs, and ticket attachments",
    breachDecision: "Assessment",
    patientNoticeDue: "Jun 26, 2026",
    regulatorNoticeDue: "Jun 26, 2026",
    businessImpact: "Sub-BAA coverage gap must be closed or exception approved",
    nextAction: "Request executed sub-BAA and restrict support queue access until received",
    evidence: ["Vendor access list", "Subcontractor register gap", "Support ticket sample", "BAA tracker note"],
    timeline: [
      { time: "Apr 27 16:48", event: "Vendor risk job flagged missing sub-BAA evidence", actor: "Automation" },
      { time: "Apr 27 18:20", event: "Parent vendor contacted for documentation", actor: "Compliance Manager" },
      { time: "Apr 28 15:12", event: "Temporary access restriction requested", actor: "Security Officer" },
    ],
  },
  {
    id: "inc-004",
    snowNumber: "INC0012469",
    title: "Suspicious login to admin account blocked by MFA",
    source: "ServiceNow ITSM",
    category: "Access control",
    severity: "Medium",
    status: "Monitoring",
    priority: "P3",
    openedAt: "Apr 26, 21:16",
    updatedAt: "Apr 28, 11:40",
    dueAt: "Apr 30, 21:16",
    owner: "Security Officer",
    assignmentGroup: "Identity Operations",
    affectedSystem: "Okta / MedLock Admin",
    affectedRecords: 0,
    phiSignal: "No PHI accessed; MFA blocked login before session creation",
    breachDecision: "Not reportable",
    businessImpact: "Attempted compromise contained before unauthorized access",
    nextAction: "Continue login anomaly monitoring for 72 hours",
    evidence: ["Okta sign-in log", "Geo velocity alert", "MFA denial event", "Admin access review"],
    timeline: [
      { time: "Apr 26 21:16", event: "Okta sign-in anomaly opened ServiceNow incident", actor: "Automation" },
      { time: "Apr 27 08:15", event: "Admin password rotated and sessions revoked", actor: "Admin" },
      { time: "Apr 28 11:40", event: "No PHI access found in audit log review", actor: "Auditor" },
    ],
  },
  {
    id: "inc-005",
    snowNumber: "INC0012433",
    title: "Lost encrypted laptop reported by contractor",
    source: "ServiceNow HR Security",
    category: "Device loss",
    severity: "Medium",
    status: "Closed",
    priority: "P3",
    openedAt: "Apr 20, 09:30",
    updatedAt: "Apr 24, 16:45",
    dueAt: "Apr 25, 09:30",
    owner: "Security Officer",
    assignmentGroup: "Endpoint Security",
    affectedSystem: "Managed MacBook",
    affectedRecords: 0,
    phiSignal: "Full disk encryption verified; no local PHI cache detected",
    breachDecision: "Not reportable",
    businessImpact: "No reportable disclosure due to encryption safe harbor",
    nextAction: "Closed with asset replacement and contractor retraining",
    evidence: ["MDM encryption proof", "Remote lock command", "Asset inventory", "Training attestation"],
    timeline: [
      { time: "Apr 20 09:30", event: "Contractor reported device loss", actor: "HR Operations" },
      { time: "Apr 20 10:05", event: "Remote lock issued and token revoked", actor: "Endpoint Security" },
      { time: "Apr 24 16:45", event: "Privacy closed as not reportable", actor: "Privacy Officer" },
    ],
  },
  {
    id: "inc-006",
    snowNumber: "INC0012399",
    title: "Expired BAA discovered for image processing vendor",
    source: "ServiceNow Vendor Risk",
    category: "Business associate",
    severity: "Low",
    status: "Closed",
    priority: "P4",
    openedAt: "Apr 14, 12:08",
    updatedAt: "Apr 18, 14:25",
    dueAt: "Apr 21, 12:08",
    owner: "Compliance Manager",
    assignmentGroup: "Vendor Governance",
    affectedSystem: "Image processing workflow",
    affectedRecords: 83,
    phiSignal: "BAA lapsed for vendor supporting DICOM workflow",
    breachDecision: "Notice drafted",
    patientNoticeDue: "Jun 13, 2026",
    regulatorNoticeDue: "Jun 13, 2026",
    businessImpact: "Contract gap resolved; notice draft retained for counsel",
    nextAction: "Closed after retroactive BAA execution and legal memo",
    evidence: ["Executed BAA", "Vendor risk recalculation", "Counsel memo", "Access window report"],
    timeline: [
      { time: "Apr 14 12:08", event: "BAA tracker opened incident for expired vendor", actor: "Automation" },
      { time: "Apr 16 09:40", event: "Vendor signed updated BAA", actor: "Compliance Manager" },
      { time: "Apr 18 14:25", event: "Incident closed with retained notice draft", actor: "Privacy Officer" },
    ],
  },
];

export const activeServiceNowIncidents = serviceNowIncidents.filter((incident) => incident.status !== "Closed");

export function severityClass(severity: IncidentSeverity) {
  if (severity === "Critical") return "border-hs-danger-border bg-hs-danger-bg text-hs-danger";
  if (severity === "High") return "border-[#FDE68A] bg-hs-warning-bg text-hs-warning";
  if (severity === "Medium") return "border-hs-info-border bg-hs-info-bg text-hs-info";
  return "border-hs-border bg-hs-fill text-hs-muted";
}

export function statusClass(status: IncidentStatus) {
  if (status === "Closed") return "border-hs-success-border bg-hs-success-bg text-hs-success";
  if (status === "Contained" || status === "Monitoring") return "border-hs-info-border bg-hs-info-bg text-hs-info";
  if (status === "Investigating" || status === "Triage") return "border-[#FDE68A] bg-hs-warning-bg text-hs-warning";
  return "border-hs-danger-border bg-hs-danger-bg text-hs-danger";
}
