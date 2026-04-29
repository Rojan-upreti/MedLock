"use client";

import { useMemo, useState } from "react";
import { HsAlertBanner } from "@/components/hipaa-shield/HsAlertBanner";
import { HsModal } from "@/components/hipaa-shield/HsModal";
import { HsPrimaryButton } from "@/components/hipaa-shield/HsPrimaryButton";
import { HsReadOnlyBanner } from "@/components/hipaa-shield/HsReadOnlyBanner";
import { HsSecondaryButton } from "@/components/hipaa-shield/HsSecondaryButton";
import { HsTextInput } from "@/components/hipaa-shield/HsTextInput";
import { useDashboardRbac } from "@/lib/rbac/context";
import { cn } from "@/lib/utils";

type IntegrationCategory =
  | "Healthcare / EHR"
  | "ITSM"
  | "Identity"
  | "Messaging"
  | "Cloud / Platform"
  | "Monitoring / SIEM"
  | "AI / Automation";

type IntegrationStatus = "Connected" | "Available" | "Needs attention" | "Beta";

type IntegrationCatalogItem = {
  key: string;
  name: string;
  vendor: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  lastSyncLabel: string;
  authMethod: string;
  dataTypes: string[];
  supportedFlows: string[];
  complianceValue: string;
  phiRisk: string;
  setupSteps: string[];
};

const categories: Array<IntegrationCategory | "All"> = [
  "All",
  "Healthcare / EHR",
  "ITSM",
  "Identity",
  "Messaging",
  "Cloud / Platform",
  "Monitoring / SIEM",
  "AI / Automation",
];

const statuses: Array<IntegrationStatus | "All"> = [
  "All",
  "Connected",
  "Available",
  "Needs attention",
  "Beta",
];

const integrations: IntegrationCatalogItem[] = [
  {
    key: "servicenow",
    name: "ServiceNow",
    vendor: "ServiceNow",
    category: "ITSM",
    status: "Available",
    lastSyncLabel: "Not connected",
    authMethod: "OAuth 2.0 + scoped app",
    dataTypes: ["Incidents", "Change requests", "Security tasks", "Evidence tickets"],
    supportedFlows: ["Create remediation tickets", "Sync incident status", "Attach audit evidence"],
    complianceValue:
      "Turns HIPAA findings, overdue training, vendor issues, and breach tasks into governed ITSM work items.",
    phiRisk:
      "Do not send PHI in ticket titles. Use references, severity, owner, and evidence links with role-based access.",
    setupSteps: [
      "Install or approve the MedLock scoped app in ServiceNow.",
      "Create OAuth credentials with incident and task permissions.",
      "Map MedLock severity to ServiceNow priority and assignment groups.",
      "Run a test ticket and validate closure sync.",
    ],
  },
  {
    key: "epic",
    name: "Epic",
    vendor: "Epic Systems",
    category: "Healthcare / EHR",
    status: "Beta",
    lastSyncLabel: "FHIR sandbox ready",
    authMethod: "SMART on FHIR / OAuth 2.0",
    dataTypes: ["Patient metadata", "Encounter references", "Audit context", "Care team references"],
    supportedFlows: ["Context-aware PHI review", "Patient-rights workflow support", "Audit correlation"],
    complianceValue:
      "Connects clinical context to privacy operations without forcing staff to manually copy EHR details.",
    phiRisk:
      "EHR connections are high sensitivity. Use minimum necessary scopes, short-lived tokens, and audit every pull.",
    setupSteps: [
      "Register the MedLock app in the Epic app configuration workflow.",
      "Approve minimum necessary FHIR scopes.",
      "Configure callback URLs and token rotation.",
      "Validate audit events before production enablement.",
    ],
  },
  {
    key: "athenahealth",
    name: "athenahealth",
    vendor: "athenahealth",
    category: "Healthcare / EHR",
    status: "Available",
    lastSyncLabel: "Not connected",
    authMethod: "OAuth 2.0 / API key",
    dataTypes: ["Patient admin data", "Appointments", "Provider directory", "Document references"],
    supportedFlows: ["Access request routing", "Appointment reminder governance", "PHI disclosure review"],
    complianceValue:
      "Helps privacy teams validate patient-administration workflows and connected PHI exchange points.",
    phiRisk:
      "Limit API scopes to workflow metadata unless PHI content access is explicitly approved and logged.",
    setupSteps: [
      "Create athenahealth API credentials.",
      "Select practice and department mappings.",
      "Choose PHI-safe metadata-only mode or approved PHI mode.",
      "Run sample sync and review logs.",
    ],
  },
  {
    key: "cerner",
    name: "Oracle Health / Cerner",
    vendor: "Oracle Health",
    category: "Healthcare / EHR",
    status: "Available",
    lastSyncLabel: "Not connected",
    authMethod: "SMART on FHIR / OAuth 2.0",
    dataTypes: ["FHIR resources", "Audit context", "Patient access workflows"],
    supportedFlows: ["EHR audit enrichment", "Privacy case routing", "Minimum necessary review"],
    complianceValue:
      "Provides clinical system context for privacy and security investigations while preserving least-privilege access.",
    phiRisk:
      "FHIR scopes must be tightly reviewed and monitored. Treat all synced resources as ePHI.",
    setupSteps: [
      "Register MedLock in Oracle Health developer configuration.",
      "Approve FHIR scopes and launch context.",
      "Map organization and facility identifiers.",
      "Test with non-production patient records.",
    ],
  },
  {
    key: "meditech",
    name: "MEDITECH",
    vendor: "MEDITECH",
    category: "Healthcare / EHR",
    status: "Available",
    lastSyncLabel: "Not connected",
    authMethod: "FHIR / interface engine",
    dataTypes: ["Clinical references", "Facility data", "Audit context"],
    supportedFlows: ["Audit package enrichment", "Patient-rights workflow support", "Incident investigation context"],
    complianceValue:
      "Supports facilities that use MEDITECH by linking EHR signals to privacy and compliance workflows.",
    phiRisk:
      "Interface data can contain sensitive clinical context. Route through approved interface-engine controls.",
    setupSteps: [
      "Confirm available FHIR or interface-engine path.",
      "Map facility identifiers and environments.",
      "Choose read scopes and sync cadence.",
      "Validate sample audit traceability.",
    ],
  },
  {
    key: "jira-service-management",
    name: "Jira Service Management",
    vendor: "Atlassian",
    category: "ITSM",
    status: "Available",
    lastSyncLabel: "Not connected",
    authMethod: "OAuth 2.0 / API token",
    dataTypes: ["Service requests", "Incident tickets", "Remediation tasks"],
    supportedFlows: ["Create remediation work", "Sync task state", "Link evidence to controls"],
    complianceValue:
      "Turns compliance and security findings into trackable engineering or operations work.",
    phiRisk:
      "Tickets should use references and evidence links instead of raw PHI.",
    setupSteps: [
      "Create an Atlassian API token or OAuth app.",
      "Choose projects and issue types.",
      "Map severity to priority.",
      "Create a test finding ticket.",
    ],
  },
  {
    key: "okta",
    name: "Okta",
    vendor: "Okta",
    category: "Identity",
    status: "Available",
    lastSyncLabel: "Not connected",
    authMethod: "OAuth 2.0 / SCIM",
    dataTypes: ["Users", "Groups", "MFA posture", "Lifecycle events"],
    supportedFlows: ["Access review enrichment", "Role change validation", "MFA exception review"],
    complianceValue:
      "Connects identity evidence to access reviews, user management, and privileged-access governance.",
    phiRisk:
      "Identity data is sensitive but usually not PHI. Restrict admin scopes and protect lifecycle events.",
    setupSteps: [
      "Create an Okta OAuth integration.",
      "Select read scopes for users, groups, and MFA state.",
      "Map Okta groups to MedLock roles.",
      "Run a lifecycle-event sync test.",
    ],
  },
  {
    key: "entra",
    name: "Microsoft Entra ID",
    vendor: "Microsoft",
    category: "Identity",
    status: "Available",
    lastSyncLabel: "Not connected",
    authMethod: "OAuth 2.0 / Microsoft Graph",
    dataTypes: ["Users", "Groups", "Conditional access", "Sign-in events"],
    supportedFlows: ["Access reviews", "Suspicious sign-in review", "Conditional-access evidence"],
    complianceValue:
      "Brings identity and sign-in posture into HIPAA access-control and audit evidence workflows.",
    phiRisk:
      "Use least-privilege Graph scopes and avoid syncing message or file content unless explicitly approved.",
    setupSteps: [
      "Register an app in Microsoft Entra.",
      "Approve read-only Graph permissions.",
      "Map Entra groups to MedLock roles.",
      "Validate sign-in event ingestion.",
    ],
  },
  {
    key: "slack",
    name: "Slack",
    vendor: "Slack",
    category: "Messaging",
    status: "Connected",
    lastSyncLabel: "20m ago",
    authMethod: "OAuth 2.0 bot token",
    dataTypes: ["Alerts", "Workflow messages", "Escalation channels"],
    supportedFlows: ["Critical alert routing", "BAA expiry reminders", "Incident command channels"],
    complianceValue:
      "Routes compliance and security alerts to the right teams without exposing raw PHI in messages.",
    phiRisk:
      "Slack alerts must remain PHI-free. Use links to authenticated MedLock records instead of patient details.",
    setupSteps: [
      "Install the MedLock Slack app.",
      "Choose alert channels and escalation routes.",
      "Confirm PHI-safe message templates.",
      "Send a test alert.",
    ],
  },
  {
    key: "teams",
    name: "Microsoft Teams",
    vendor: "Microsoft",
    category: "Messaging",
    status: "Available",
    lastSyncLabel: "Not connected",
    authMethod: "Microsoft Graph webhooks",
    dataTypes: ["Alerts", "Channels", "Incident coordination"],
    supportedFlows: ["Compliance reminders", "Incident escalation", "Access-review nudges"],
    complianceValue:
      "Delivers HIPAA workflow reminders into Teams channels while keeping sensitive records inside MedLock.",
    phiRisk:
      "Keep PHI out of channel posts and use protected deep links for detail views.",
    setupSteps: [
      "Register Graph app permissions.",
      "Select teams and channels.",
      "Approve message templates.",
      "Send a test routing notification.",
    ],
  },
  {
    key: "resend",
    name: "Resend",
    vendor: "Resend",
    category: "Messaging",
    status: "Needs attention",
    lastSyncLabel: "Token missing",
    authMethod: "API key",
    dataTypes: ["Transactional email", "Breach notifications", "Training reminders"],
    supportedFlows: ["Email reminders", "Policy acknowledgements", "Breach notification drafts"],
    complianceValue:
      "Supports controlled transactional email for compliance workflows and reminder campaigns.",
    phiRisk:
      "Email can leak PHI. Templates should avoid PHI unless an approved secure-email workflow is enabled.",
    setupSteps: [
      "Add Resend API key to backend environment.",
      "Verify sender domain and DNS records.",
      "Approve PHI-safe templates.",
      "Send a test notification.",
    ],
  },
  {
    key: "supabase",
    name: "Supabase",
    vendor: "Supabase",
    category: "Cloud / Platform",
    status: "Connected",
    lastSyncLabel: "8m ago",
    authMethod: "Service role + management API",
    dataTypes: ["Auth", "Database", "Storage", "Platform logs"],
    supportedFlows: ["Audit log ingestion", "RLS evidence", "Storage document workflows"],
    complianceValue:
      "Powers application data, audit events, storage evidence, and platform telemetry in one connected backend.",
    phiRisk:
      "Service-role credentials are high risk. Store server-side only and audit all privileged use.",
    setupSteps: [
      "Configure Supabase URL and keys server-side.",
      "Add project ref and access token for platform logs.",
      "Create required storage buckets and policies.",
      "Validate audit event ingestion.",
    ],
  },
  {
    key: "render",
    name: "Render",
    vendor: "Render",
    category: "Cloud / Platform",
    status: "Available",
    lastSyncLabel: "Not connected",
    authMethod: "API key",
    dataTypes: ["Deployments", "Services", "Runtime health", "Build events"],
    supportedFlows: ["Deployment evidence", "Incident investigation", "Change tracking"],
    complianceValue:
      "Links application deployment history and service posture to incident response and audit packages.",
    phiRisk:
      "Do not expose logs containing PHI. Use log redaction and limited service metadata scopes.",
    setupSteps: [
      "Create a Render API key.",
      "Select services and environments.",
      "Map deployments to MedLock change records.",
      "Validate service health sync.",
    ],
  },
  {
    key: "cloudflare",
    name: "Cloudflare",
    vendor: "Cloudflare",
    category: "Cloud / Platform",
    status: "Available",
    lastSyncLabel: "Not connected",
    authMethod: "API token",
    dataTypes: ["WAF events", "DNS", "TLS", "Access logs"],
    supportedFlows: ["WAF evidence", "TLS monitoring", "Threat alert enrichment"],
    complianceValue:
      "Provides network and edge security evidence for transmission security and incident investigations.",
    phiRisk:
      "Edge logs can include URLs and identifiers. Scope tokens and sanitize log ingestion.",
    setupSteps: [
      "Create scoped API token.",
      "Select zones and products.",
      "Enable WAF and TLS evidence sync.",
      "Validate event sampling and retention.",
    ],
  },
  {
    key: "aws",
    name: "AWS S3 / CloudTrail",
    vendor: "Amazon Web Services",
    category: "Cloud / Platform",
    status: "Available",
    lastSyncLabel: "Not connected",
    authMethod: "IAM role / external ID",
    dataTypes: ["S3 buckets", "CloudTrail", "IAM events", "Object metadata"],
    supportedFlows: ["Storage evidence", "Access anomaly review", "Backup control monitoring"],
    complianceValue:
      "Connects cloud storage and access evidence to HIPAA safeguards, audit packages, and anomaly alerts.",
    phiRisk:
      "Use metadata-first ingestion. Avoid object content access unless explicitly required and approved.",
    setupSteps: [
      "Create cross-account IAM role with external ID.",
      "Enable CloudTrail and bucket inventory access.",
      "Map buckets to PHI inventory assets.",
      "Run least-privilege validation.",
    ],
  },
  {
    key: "datadog",
    name: "Datadog",
    vendor: "Datadog",
    category: "Monitoring / SIEM",
    status: "Available",
    lastSyncLabel: "Not connected",
    authMethod: "API key + app key",
    dataTypes: ["APM", "Logs", "Metrics", "Security signals"],
    supportedFlows: ["Anomaly alert enrichment", "Incident timelines", "Control evidence"],
    complianceValue:
      "Adds operational monitoring and security signals to incident response and audit packages.",
    phiRisk:
      "Scrub logs before ingestion. Avoid PHI in traces, tags, and error payloads.",
    setupSteps: [
      "Create restricted API and app keys.",
      "Choose log indexes and services.",
      "Map monitors to MedLock severity.",
      "Test alert event ingestion.",
    ],
  },
  {
    key: "splunk",
    name: "Splunk / SIEM",
    vendor: "Splunk",
    category: "Monitoring / SIEM",
    status: "Needs attention",
    lastSyncLabel: "2h ago - token expired",
    authMethod: "HEC token / API token",
    dataTypes: ["Security logs", "Audit logs", "Alerts", "Threat detections"],
    supportedFlows: ["Security event ingestion", "Audit correlation", "Incident escalation"],
    complianceValue:
      "Centralizes security events so MedLock can correlate application activity with SIEM detections.",
    phiRisk:
      "Token scopes and log schemas must prevent sensitive payload exposure.",
    setupSteps: [
      "Create or rotate HEC token.",
      "Map source types to MedLock event categories.",
      "Configure severity mapping.",
      "Validate sample alert ingestion.",
    ],
  },
  {
    key: "sentry",
    name: "Sentry",
    vendor: "Sentry",
    category: "Monitoring / SIEM",
    status: "Available",
    lastSyncLabel: "Not connected",
    authMethod: "Auth token / webhook",
    dataTypes: ["Errors", "Releases", "Performance traces", "Issue events"],
    supportedFlows: ["PHI leak detection in errors", "Release evidence", "Incident triage"],
    complianceValue:
      "Links application errors and releases to remediation workflows and PHI leakage checks.",
    phiRisk:
      "Error payloads may contain PHI. Enable scrubbing before connecting production projects.",
    setupSteps: [
      "Create Sentry auth token and webhook.",
      "Select projects and environments.",
      "Review data scrubbing rules.",
      "Send a test issue event.",
    ],
  },
  {
    key: "anthropic",
    name: "Anthropic",
    vendor: "Anthropic",
    category: "AI / Automation",
    status: "Beta",
    lastSyncLabel: "Policy review required",
    authMethod: "API key",
    dataTypes: ["Compliance drafts", "PHI scan summaries", "Policy assistance"],
    supportedFlows: ["Policy drafting", "Breach notification drafts", "PHI scanner explanations"],
    complianceValue:
      "Assists privacy and security teams with drafting, summarization, and compliance workflow acceleration.",
    phiRisk:
      "AI usage must follow approved PHI policy. Prefer de-identified prompts and strict audit logging.",
    setupSteps: [
      "Add API key server-side only.",
      "Choose allowed workflows and PHI handling mode.",
      "Enable prompt audit logging.",
      "Run policy-approved test prompts.",
    ],
  },
];

const categoryStyles: Record<IntegrationCategory, string> = {
  "Healthcare / EHR": "border-teal-200 bg-teal-50 text-teal-700",
  ITSM: "border-blue-200 bg-blue-50 text-blue-700",
  Identity: "border-purple-200 bg-purple-50 text-purple-700",
  Messaging: "border-amber-200 bg-amber-50 text-amber-700",
  "Cloud / Platform": "border-indigo-200 bg-indigo-50 text-indigo-700",
  "Monitoring / SIEM": "border-red-200 bg-red-50 text-red-700",
  "AI / Automation": "border-gray-200 bg-gray-50 text-gray-700",
};

const statusStyles: Record<IntegrationStatus, string> = {
  Connected: "border-hs-success-border bg-hs-success-bg text-hs-success",
  Available: "border-hs-border bg-hs-fill text-hs-muted",
  "Needs attention": "border-hs-danger-border bg-hs-danger-bg text-hs-danger",
  Beta: "border-[#FDE68A] bg-hs-warning-bg text-hs-warning",
};

function actionFor(status: IntegrationStatus) {
  if (status === "Connected") return "Configure";
  if (status === "Needs attention") return "Repair";
  if (status === "Beta") return "Request access";
  return "Connect";
}

export default function IntegrationsPage() {
  const rbac = useDashboardRbac();
  const canWrite = rbac.canWritePage("integrations");
  const readOnly = rbac.permissionFor("integrations") === "read_only";
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory | "All">("All");
  const [activeStatus, setActiveStatus] = useState<IntegrationStatus | "All">("All");
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationCatalogItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return integrations.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesStatus = activeStatus === "All" || item.status === activeStatus;
      const haystack = [
        item.name,
        item.vendor,
        item.category,
        item.status,
        item.authMethod,
        item.complianceValue,
        item.phiRisk,
        item.dataTypes.join(" "),
        item.supportedFlows.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return matchesCategory && matchesStatus && (!q || haystack.includes(q));
    });
  }, [activeCategory, activeStatus, search]);

  const stats = useMemo(() => {
    const connected = integrations.filter((item) => item.status === "Connected").length;
    const attention = integrations.filter((item) => item.status === "Needs attention").length;
    const beta = integrations.filter((item) => item.status === "Beta").length;
    return {
      connected,
      attention,
      available: integrations.length,
      beta,
    };
  }, []);

  function showPlaceholder(action: string, name?: string) {
    setNotice(
      `${action}${name ? ` for ${name}` : ""} is ready as a UI action. Real credential exchange can be wired to integration_connections next.`,
    );
  }

  return (
    <div className="min-h-full bg-hs-page px-4 py-8 md:px-8">
      <div className="mx-auto max-w-[1280px] space-y-6">
        {readOnly ? <HsReadOnlyBanner /> : null}
        {notice ? (
          <HsAlertBanner variant="INFO" onDismiss={() => setNotice(null)}>
            {notice}
          </HsAlertBanner>
        ) : null}

        <section className="rounded-hs-card border border-hs-border bg-hs-card p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-hs-caption font-semibold uppercase tracking-[0.1em] text-hs-primary">
                Settings
              </p>
              <h1 className="mt-2 text-hs-title font-semibold text-hs-text">Integrations</h1>
              <p className="mt-2 text-hs-body text-hs-muted">
                Connect clinical systems, ITSM queues, identity providers, cloud infrastructure, messaging channels,
                SIEM tools, and AI workflows into one HIPAA-ready control center.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-hs-pill border border-hs-border bg-hs-fill px-3 py-1 text-hs-caption font-medium text-hs-muted">
                  Clinical + EHR
                </span>
                <span className="rounded-hs-pill border border-hs-border bg-hs-fill px-3 py-1 text-hs-caption font-medium text-hs-muted">
                  Identity + access
                </span>
                <span className="rounded-hs-pill border border-hs-border bg-hs-fill px-3 py-1 text-hs-caption font-medium text-hs-muted">
                  Audit + incident workflows
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {canWrite ? (
                <>
                  <HsSecondaryButton type="button" onClick={() => showPlaceholder("View API keys")}>
                    View API keys
                  </HsSecondaryButton>
                  <HsPrimaryButton type="button" onClick={() => showPlaceholder("Connect integration")}>
                    Connect integration
                  </HsPrimaryButton>
                </>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-hs-card border border-hs-border bg-hs-card p-5 shadow-sm">
            <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">Connected</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-hs-success">{stats.connected}</p>
            <p className="mt-1 text-sm text-hs-muted">Active integrations</p>
          </article>
          <article className="rounded-hs-card border border-hs-border bg-hs-card p-5 shadow-sm">
            <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">Needs attention</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-hs-danger">{stats.attention}</p>
            <p className="mt-1 text-sm text-hs-muted">Repair credentials or sync</p>
          </article>
          <article className="rounded-hs-card border border-hs-border bg-hs-card p-5 shadow-sm">
            <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">Available</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-hs-text">{stats.available}</p>
            <p className="mt-1 text-sm text-hs-muted">Marketplace connectors</p>
          </article>
          <article className="rounded-hs-card border border-hs-border bg-hs-card p-5 shadow-sm">
            <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">Beta</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-hs-warning">{stats.beta}</p>
            <p className="mt-1 text-sm text-hs-muted">Requires policy review</p>
          </article>
        </section>

        <section className="rounded-hs-card border border-hs-border bg-hs-card p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
            <HsTextInput
              label="Search integrations"
              placeholder="Search ServiceNow, Epic, SIEM, MFA, alerts…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-hs-secondary font-medium text-hs-text">Category</span>
              <select
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value as IntegrationCategory | "All")}
                className="h-10 rounded-hs border border-hs-border bg-hs-card px-3 text-hs-body text-hs-text focus:outline-none focus:shadow-hs-focus"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-hs-secondary font-medium text-hs-text">Status</span>
              <select
                value={activeStatus}
                onChange={(event) => setActiveStatus(event.target.value as IntegrationStatus | "All")}
                className="h-10 rounded-hs border border-hs-border bg-hs-card px-3 text-hs-body text-hs-text focus:outline-none focus:shadow-hs-focus"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "All" ? "All statuses" : status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {filtered.map((item) => (
            <article
              key={item.key}
              className="flex min-h-[380px] flex-col rounded-hs-card border border-hs-border bg-hs-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "rounded-hs-pill border px-2.5 py-1 text-hs-caption font-medium",
                    categoryStyles[item.category],
                  )}
                >
                  {item.category}
                </span>
                <span
                  className={cn(
                    "rounded-hs-pill border px-2.5 py-1 text-hs-caption font-medium",
                    statusStyles[item.status],
                  )}
                >
                  {item.status}
                </span>
              </div>

              <div className="mt-4">
                <h2 className="text-lg font-semibold leading-snug text-hs-text">{item.name}</h2>
                <p className="text-sm text-hs-muted">{item.vendor}</p>
              </div>

              <p className="mt-3 line-clamp-4 text-sm leading-6 text-hs-muted">{item.complianceValue}</p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-hs bg-hs-page px-3 py-2">
                  <p className="text-hs-caption text-hs-muted">Auth</p>
                  <p className="truncate text-sm font-semibold text-hs-text" title={item.authMethod}>
                    {item.authMethod}
                  </p>
                </div>
                <div className="rounded-hs bg-hs-page px-3 py-2">
                  <p className="text-hs-caption text-hs-muted">Last sync</p>
                  <p className="truncate text-sm font-semibold text-hs-text">{item.lastSyncLabel}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">Data types</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.dataTypes.slice(0, 3).map((dataType) => (
                    <span key={dataType} className="rounded-hs-pill bg-hs-fill px-2.5 py-1 text-hs-caption font-medium text-hs-muted">
                      {dataType}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-auto flex gap-3 pt-5">
                <HsSecondaryButton type="button" className="flex-1" onClick={() => setSelectedIntegration(item)}>
                  Details
                </HsSecondaryButton>
                {canWrite ? (
                  <HsPrimaryButton
                    type="button"
                    className="flex-1"
                    onClick={() => showPlaceholder(actionFor(item.status), item.name)}
                  >
                    {actionFor(item.status)}
                  </HsPrimaryButton>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        {filtered.length === 0 ? (
          <section className="rounded-hs-card border border-hs-border bg-hs-card p-8 text-center">
            <h2 className="text-hs-section font-semibold text-hs-text">No integrations found</h2>
            <p className="mt-2 text-hs-body text-hs-muted">Try a broader search or reset filters to all categories.</p>
          </section>
        ) : null}
      </div>

      <HsModal
        open={Boolean(selectedIntegration)}
        onClose={() => setSelectedIntegration(null)}
        title={selectedIntegration?.name ?? "Integration"}
        className="max-w-[760px]"
        footer={
          <>
            <HsSecondaryButton type="button" onClick={() => setSelectedIntegration(null)}>
              Close
            </HsSecondaryButton>
            {canWrite && selectedIntegration ? (
              <HsPrimaryButton
                type="button"
                onClick={() => showPlaceholder(actionFor(selectedIntegration.status), selectedIntegration.name)}
              >
                {actionFor(selectedIntegration.status)}
              </HsPrimaryButton>
            ) : null}
          </>
        }
      >
        {selectedIntegration ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <span
                className={cn(
                  "rounded-hs-pill border px-2.5 py-1 text-hs-caption font-medium",
                  categoryStyles[selectedIntegration.category],
                )}
              >
                {selectedIntegration.category}
              </span>
              <span
                className={cn(
                  "rounded-hs-pill border px-2.5 py-1 text-hs-caption font-medium",
                  statusStyles[selectedIntegration.status],
                )}
              >
                {selectedIntegration.status}
              </span>
              <span className="rounded-hs-pill bg-hs-fill px-2.5 py-1 text-hs-caption font-medium text-hs-muted">
                {selectedIntegration.authMethod}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-hs border border-hs-border bg-hs-page p-4">
                <h3 className="text-sm font-semibold text-hs-text">Compliance value</h3>
                <p className="mt-2 text-sm leading-6 text-hs-muted">{selectedIntegration.complianceValue}</p>
              </div>
              <div className="rounded-hs border border-hs-warning/40 bg-hs-warning-bg/50 p-4">
                <h3 className="text-sm font-semibold text-hs-text">PHI risk note</h3>
                <p className="mt-2 text-sm leading-6 text-hs-muted">{selectedIntegration.phiRisk}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-hs border border-hs-border bg-hs-card p-4">
                <h3 className="text-sm font-semibold text-hs-text">Supported flows</h3>
                <ul className="mt-2 space-y-2 text-sm text-hs-muted">
                  {selectedIntegration.supportedFlows.map((flow) => (
                    <li key={flow} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-hs-primary" aria-hidden />
                      <span>{flow}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-hs border border-hs-border bg-hs-card p-4">
                <h3 className="text-sm font-semibold text-hs-text">Data types</h3>
                <ul className="mt-2 space-y-2 text-sm text-hs-muted">
                  {selectedIntegration.dataTypes.map((dataType) => (
                    <li key={dataType} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-hs-primary" aria-hidden />
                      <span>{dataType}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-hs-text">Setup checklist</h3>
              <ol className="mt-3 space-y-3">
                {selectedIntegration.setupSteps.map((step, index) => (
                  <li key={step} className="rounded-hs border border-hs-border bg-hs-page p-3">
                    <div className="flex items-start gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-hs-primary/10 text-hs-caption font-semibold text-hs-primary">
                        {index + 1}
                      </span>
                      <p className="pt-1 text-sm leading-6 text-hs-muted">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-hs border border-hs-border bg-hs-fill p-4">
              <h3 className="text-sm font-semibold text-hs-text">Connection health</h3>
              <p className="mt-2 text-sm leading-6 text-hs-muted">
                Last sync: <span className="font-medium text-hs-text">{selectedIntegration.lastSyncLabel}</span>. Future
                persistence can map this card to the existing{" "}
                <code className="rounded bg-hs-card px-1 py-0.5">integration_connections</code> table.
              </p>
            </div>
          </div>
        ) : null}
      </HsModal>
    </div>
  );
}
