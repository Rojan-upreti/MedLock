"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HsAlertBanner } from "@/components/hipaa-shield/HsAlertBanner";
import { HsPrimaryButton } from "@/components/hipaa-shield/HsPrimaryButton";
import { HsReadOnlyBanner } from "@/components/hipaa-shield/HsReadOnlyBanner";
import { HsSecondaryButton } from "@/components/hipaa-shield/HsSecondaryButton";
import { HsTextInput } from "@/components/hipaa-shield/HsTextInput";
import { useDashboardRbac } from "@/lib/rbac/context";
import { cn } from "@/lib/utils";
import { serviceNowIncidents, severityClass, statusClass } from "../incident-data";

const monthlyTrend = [
  { month: "Nov", incidents: 8, breaches: 1 },
  { month: "Dec", incidents: 6, breaches: 0 },
  { month: "Jan", incidents: 11, breaches: 2 },
  { month: "Feb", incidents: 7, breaches: 1 },
  { month: "Mar", incidents: 9, breaches: 1 },
  { month: "Apr", incidents: 14, breaches: 3 },
];

const lessons = [
  "Email template controls reduced repeat patient communication events after rule lockout.",
  "Vendor risk incidents now require sub-BA evidence before support queue access is restored.",
  "Identity incidents close faster when Okta MFA evidence and MedLock audit logs are bundled together.",
  "Breach cases need earlier legal review when affected count is uncertain but disclosure is confirmed.",
];

export default function IncidentHistoryPage() {
  const rbac = useDashboardRbac();
  const canWrite = rbac.canWritePage("incident_history");
  const readOnly = rbac.permissionFor("incident_history") === "read_only";
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [notice, setNotice] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return serviceNowIncidents.filter((incident) => {
      const matchesStatus = status === "All" || incident.status === status;
      const matchesQuery =
        !needle ||
        [incident.title, incident.snowNumber, incident.category, incident.owner, incident.affectedSystem, incident.breachDecision]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  const closedCount = serviceNowIncidents.filter((incident) => incident.status === "Closed").length;
  const reportableCount = serviceNowIncidents.filter((incident) => incident.breachDecision === "Reportable").length;
  const avgRecords = Math.round(serviceNowIncidents.reduce((sum, incident) => sum + incident.affectedRecords, 0) / serviceNowIncidents.length);
  const maxTrend = Math.max(...monthlyTrend.map((month) => month.incidents));

  function action(label: string) {
    setNotice(`${label} is staged. A real ServiceNow integration would export the archive, evidence, and post-incident review artifacts.`);
  }

  return (
    <div className="min-h-full bg-hs-page px-4 py-8 md:px-8">
      <div className="mx-auto max-w-[1320px] space-y-6">
        {readOnly ? <HsReadOnlyBanner /> : null}
        {notice ? (
          <HsAlertBanner variant="INFO" onDismiss={() => setNotice(null)}>
            {notice}
          </HsAlertBanner>
        ) : null}

        <section className="rounded-hs-card border border-hs-border bg-hs-card p-6 md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-hs-caption font-semibold uppercase tracking-[0.1em] text-hs-primary">ServiceNow archive</p>
              <h1 className="mt-3 text-hs-title font-semibold text-hs-text">Incident History</h1>
              <p className="mt-3 max-w-3xl text-hs-body leading-7 text-hs-muted">
                Search historical incidents, breach decisions, evidence packages, lessons learned, and closure outcomes.
                This archive supports audits, risk trend reviews, and recurring HIPAA remediation planning.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="inline-flex h-10 items-center rounded-hs border border-hs-border px-4 text-sm font-medium text-hs-text hover:border-hs-primary" href="/dashboard/active-incidents">
                Active incidents
              </Link>
              {canWrite ? (
                <>
                  <HsPrimaryButton type="button" onClick={() => action("Export incident archive")}>
                    Export archive
                  </HsPrimaryButton>
                  <HsSecondaryButton type="button" onClick={() => action("Create postmortem")}>
                    Create postmortem
                  </HsSecondaryButton>
                </>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["Total incidents", serviceNowIncidents.length, "Current dataset from ServiceNow"],
            ["Closed", closedCount, "Evidence package complete"],
            ["Reportable breaches", reportableCount, "Patient/OCR notification required"],
            ["Avg affected", avgRecords.toLocaleString(), "Potential people per incident"],
          ].map(([label, value, context]) => (
            <article key={label} className="rounded-hs-card border border-hs-border bg-hs-card p-5 shadow-sm">
              <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">{label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-hs-text">{value}</p>
              <p className="mt-1 text-sm text-hs-muted">{context}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <section className="rounded-hs-card border border-hs-border bg-hs-card p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-hs-section font-semibold text-hs-text">Incident archive</h2>
                <p className="mt-1 text-sm text-hs-muted">Search by ServiceNow number, owner, breach decision, or system.</p>
              </div>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 rounded-hs border border-hs-border bg-hs-card px-3 text-sm text-hs-text"
              >
                {["All", "New", "Triage", "Investigating", "Contained", "Monitoring", "Closed"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <HsTextInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search incidents, evidence, owners, systems..." />
            </div>
            <div className="mt-5 overflow-x-auto rounded-hs border border-hs-border">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead>
                  <tr className="h-11 bg-hs-page text-hs-caption font-medium uppercase tracking-wide text-hs-muted">
                    <th className="px-4 py-3">Incident</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Breach decision</th>
                    <th className="px-4 py-3">Affected</th>
                    <th className="px-4 py-3">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((incident) => (
                    <tr key={incident.id} className="border-t border-hs-fill align-top">
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-hs-text">{incident.snowNumber}</p>
                        <p className="mt-1 max-w-[280px] text-sm leading-6 text-hs-muted">{incident.title}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-hs-muted">{incident.category}</td>
                      <td className="px-4 py-4">
                        <span className={cn("rounded-hs-pill border px-2.5 py-1 text-hs-caption font-medium", severityClass(incident.severity))}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn("rounded-hs-pill border px-2.5 py-1 text-hs-caption font-medium", statusClass(incident.status))}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-hs-text">{incident.breachDecision}</td>
                      <td className="px-4 py-4 text-sm tabular-nums text-hs-muted">{incident.affectedRecords.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-hs-muted">{incident.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-hs-card border border-hs-border bg-hs-card p-6">
              <h2 className="text-hs-section font-semibold text-hs-text">Six-month trend</h2>
              <div className="mt-5 space-y-4">
                {monthlyTrend.map((month) => (
                  <div key={month.month}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-hs-text">{month.month}</span>
                      <span className="text-hs-muted">{month.incidents} incidents • {month.breaches} breaches</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-hs-fill">
                      <div className="h-full rounded-full bg-hs-primary" style={{ width: `${(month.incidents / maxTrend) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-hs-card border border-hs-border bg-hs-card p-6">
              <h2 className="text-hs-section font-semibold text-hs-text">Lessons learned</h2>
              <div className="mt-5 space-y-3">
                {lessons.map((lesson, index) => (
                  <div key={lesson} className="rounded-hs border border-hs-border bg-hs-page p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-hs-primary">Lesson {index + 1}</p>
                    <p className="mt-2 text-sm leading-6 text-hs-muted">{lesson}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-hs-card border border-hs-border bg-hs-card p-6">
              <h2 className="text-hs-section font-semibold text-hs-text">Archive controls</h2>
              <p className="mt-2 text-sm leading-6 text-hs-muted">
                Preserve ServiceNow closure notes, evidence hashes, breach decisions, and notification artifacts for audit review.
              </p>
              <div className="mt-4 grid gap-2 text-sm">
                <div className="rounded-hs border border-hs-border bg-hs-page px-3 py-2 text-hs-muted">Retention: 6 years</div>
                <div className="rounded-hs border border-hs-border bg-hs-page px-3 py-2 text-hs-muted">Evidence: immutable package after closure</div>
                <div className="rounded-hs border border-hs-border bg-hs-page px-3 py-2 text-hs-muted">Review cadence: monthly risk committee</div>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </div>
  );
}
