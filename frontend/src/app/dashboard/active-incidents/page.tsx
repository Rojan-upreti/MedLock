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
import { activeServiceNowIncidents, severityClass, statusClass } from "../incident-data";

export default function ActiveIncidentsPage() {
  const rbac = useDashboardRbac();
  const canWrite = rbac.canWritePage("active_incidents");
  const readOnly = rbac.permissionFor("active_incidents") === "read_only";
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("All");
  const [selectedId, setSelectedId] = useState(activeServiceNowIncidents[0]?.id ?? "");
  const [notice, setNotice] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return activeServiceNowIncidents.filter((incident) => {
      const matchesSeverity = severity === "All" || incident.severity === severity;
      const matchesQuery =
        !needle ||
        [incident.title, incident.snowNumber, incident.category, incident.affectedSystem, incident.owner]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesSeverity && matchesQuery;
    });
  }, [query, severity]);

  const selected = activeServiceNowIncidents.find((incident) => incident.id === selectedId) ?? filtered[0];
  const phiRecords = activeServiceNowIncidents.reduce((sum, incident) => sum + incident.affectedRecords, 0);
  const breachAssessments = activeServiceNowIncidents.filter((incident) => incident.breachDecision === "Assessment").length;

  function action(label: string) {
    setNotice(`${label} is staged for ServiceNow sync. When connected, this would update the incident work notes and audit trail.`);
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

        <section className="overflow-hidden rounded-hs-card border border-hs-border bg-hs-card">
          <div className="grid gap-0 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="p-6 md:p-8">
              <p className="text-hs-caption font-semibold uppercase tracking-[0.1em] text-hs-primary">ServiceNow incident command</p>
              <h1 className="mt-3 text-hs-title font-semibold text-hs-text">Active Incidents</h1>
              <p className="mt-3 max-w-3xl text-hs-body leading-7 text-hs-muted">
                Monitor open ServiceNow security, privacy, vendor, and ITSM incidents that may affect PHI. This view
                focuses responders on containment, breach assessment, ownership, and next actions.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["ServiceNow ITSM", "Privacy workflow", "Security operations", "HIPAA breach clock"].map((label) => (
                  <span key={label} className="rounded-hs-pill border border-hs-border bg-hs-fill px-3 py-1 text-hs-caption font-medium text-hs-muted">
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t border-hs-border bg-hs-page p-6 md:p-8 xl:border-l xl:border-t-0">
              <div className="rounded-hs-card border border-hs-border bg-hs-card p-5">
                <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">Open response posture</p>
                <p className="mt-3 text-4xl font-semibold text-hs-text">{activeServiceNowIncidents.length}</p>
                <p className="mt-1 text-sm text-hs-muted">Active tickets synced from ServiceNow queues</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-hs border border-hs-border bg-hs-page p-3">
                    <p className="text-2xl font-semibold text-hs-danger">{breachAssessments}</p>
                    <p className="text-xs text-hs-muted">Breach assessments</p>
                  </div>
                  <div className="rounded-hs border border-hs-border bg-hs-page p-3">
                    <p className="text-2xl font-semibold text-hs-text">{phiRecords.toLocaleString()}</p>
                    <p className="text-xs text-hs-muted">Potential records</p>
                  </div>
                </div>
                {canWrite ? (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <HsPrimaryButton type="button" onClick={() => action("Open war room")}>
                      Open war room
                    </HsPrimaryButton>
                    <HsSecondaryButton type="button" onClick={() => action("Sync ServiceNow")}>
                      Sync ServiceNow
                    </HsSecondaryButton>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["Critical / High", activeServiceNowIncidents.filter((i) => i.severity === "Critical" || i.severity === "High").length, "Needs executive attention"],
            ["Contained", activeServiceNowIncidents.filter((i) => i.status === "Contained").length, "Immediate spread stopped"],
            ["PHI implicated", activeServiceNowIncidents.filter((i) => i.affectedRecords > 0).length, "Requires privacy review"],
            ["Avg update age", "2h", "ServiceNow work notes freshness"],
          ].map(([label, value, context]) => (
            <article key={label} className="rounded-hs-card border border-hs-border bg-hs-card p-5 shadow-sm">
              <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">{label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-hs-text">{value}</p>
              <p className="mt-1 text-sm text-hs-muted">{context}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-hs-card border border-hs-border bg-hs-card p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-hs-section font-semibold text-hs-text">Triage queue</h2>
                <p className="mt-1 text-sm text-hs-muted">Open ServiceNow incidents sorted by severity and breach risk.</p>
              </div>
              <select
                value={severity}
                onChange={(event) => setSeverity(event.target.value)}
                className="h-10 rounded-hs border border-hs-border bg-hs-card px-3 text-sm text-hs-text"
              >
                {["All", "Critical", "High", "Medium", "Low"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <HsTextInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ServiceNow number, owner, system, category..." />
            </div>
            <div className="mt-5 space-y-3">
              {filtered.map((incident) => (
                <button
                  key={incident.id}
                  type="button"
                  onClick={() => setSelectedId(incident.id)}
                  className={cn(
                    "w-full rounded-hs border p-4 text-left transition hover:border-hs-primary",
                    selected?.id === incident.id ? "border-hs-primary bg-hs-primary/5" : "border-hs-border bg-hs-page",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-hs-text">{incident.title}</p>
                      <p className="mt-1 text-xs text-hs-muted">{incident.snowNumber} • {incident.assignmentGroup}</p>
                    </div>
                    <span className={cn("rounded-hs-pill border px-2.5 py-1 text-hs-caption font-medium", severityClass(incident.severity))}>
                      {incident.severity}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-hs-muted">{incident.nextAction}</p>
                </button>
              ))}
            </div>
          </section>

          {selected ? (
            <section className="rounded-hs-card border border-hs-border bg-hs-card p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-hs-primary">{selected.snowNumber}</p>
                  <h2 className="mt-1 text-hs-section font-semibold text-hs-text">{selected.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-hs-muted">{selected.businessImpact}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={cn("rounded-hs-pill border px-2.5 py-1 text-hs-caption font-medium", severityClass(selected.severity))}>
                    {selected.severity}
                  </span>
                  <span className={cn("rounded-hs-pill border px-2.5 py-1 text-hs-caption font-medium", statusClass(selected.status))}>
                    {selected.status}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["Owner", selected.owner],
                  ["Affected system", selected.affectedSystem],
                  ["Potential records", selected.affectedRecords.toLocaleString()],
                  ["Breach decision", selected.breachDecision],
                  ["Opened", selected.openedAt],
                  ["Response due", selected.dueAt],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-hs border border-hs-border bg-hs-page p-3">
                    <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-hs-text">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-hs border border-hs-warning/40 bg-hs-warning-bg/50 p-4">
                <p className="text-sm font-semibold text-hs-text">PHI signal</p>
                <p className="mt-1 text-sm leading-6 text-hs-muted">{selected.phiSignal}</p>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-hs-text">Evidence attached</h3>
                  <div className="mt-3 space-y-2">
                    {selected.evidence.map((item) => (
                      <div key={item} className="rounded-hs border border-hs-border bg-hs-page px-3 py-2 text-sm text-hs-muted">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-hs-text">Response timeline</h3>
                  <div className="mt-3 space-y-3">
                    {selected.timeline.map((event) => (
                      <div key={`${event.time}-${event.event}`} className="border-l-2 border-hs-primary/30 pl-3">
                        <p className="text-xs font-medium text-hs-primary">{event.time} • {event.actor}</p>
                        <p className="mt-1 text-sm text-hs-muted">{event.event}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link className="inline-flex h-10 items-center rounded-hs border border-hs-border px-4 text-sm font-medium text-hs-text hover:border-hs-primary" href="/dashboard/breach-notification-center">
                  Open breach workflow
                </Link>
                {canWrite ? (
                  <>
                    <HsPrimaryButton type="button" onClick={() => action("Update status")}>
                      Update status
                    </HsPrimaryButton>
                    <HsSecondaryButton type="button" onClick={() => action("Add work note")}>
                      Add work note
                    </HsSecondaryButton>
                  </>
                ) : null}
              </div>
            </section>
          ) : null}
        </section>
      </div>
    </div>
  );
}
