"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HsAlertBanner } from "@/components/hipaa-shield/HsAlertBanner";
import { HsPrimaryButton } from "@/components/hipaa-shield/HsPrimaryButton";
import { HsReadOnlyBanner } from "@/components/hipaa-shield/HsReadOnlyBanner";
import { HsSecondaryButton } from "@/components/hipaa-shield/HsSecondaryButton";
import { useDashboardRbac } from "@/lib/rbac/context";
import { cn } from "@/lib/utils";
import { serviceNowIncidents, severityClass } from "../incident-data";

const assessmentFactors = [
  {
    title: "Nature and extent of PHI",
    status: "In review",
    detail: "Data classes include identifiers, billing details, appointment data, and limited encounter metadata.",
  },
  {
    title: "Unauthorized person who used or received PHI",
    status: "Evidence needed",
    detail: "ServiceNow tasks track recipient identity, access confirmation, and whether downstream disclosure occurred.",
  },
  {
    title: "Whether PHI was actually acquired or viewed",
    status: "Mixed",
    detail: "One case has confirmed email open; analytics export requires access reconstruction before final decision.",
  },
  {
    title: "Risk mitigation performed",
    status: "On track",
    detail: "Containment, revocation, recipient outreach, vendor restriction, and template lock actions are attached.",
  },
];

const noticePackets = [
  {
    name: "Patient notification letter",
    status: "Draft ready",
    owner: "Privacy Officer",
    contents: "What happened, PHI involved, actions taken, protective steps, contact instructions",
  },
  {
    name: "HHS OCR submission",
    status: "Pending counsel",
    owner: "Compliance Manager",
    contents: "Incident summary, affected count, discovery date, mitigation, organization contacts",
  },
  {
    name: "Media notice decision",
    status: "Not triggered",
    owner: "Legal",
    contents: "Required only when breach affects more than 500 residents of a state or jurisdiction",
  },
  {
    name: "Business associate notice",
    status: "In progress",
    owner: "Vendor Governance",
    contents: "Subcontractor evidence, parent vendor duties, remediation commitments",
  },
];

export default function BreachNotificationCenterPage() {
  const rbac = useDashboardRbac();
  const canWrite = rbac.canWritePage("breach_notification_center");
  const readOnly = rbac.permissionFor("breach_notification_center") === "read_only";
  const [selectedId, setSelectedId] = useState("inc-002");
  const [notice, setNotice] = useState<string | null>(null);

  const breachCases = useMemo(
    () => serviceNowIncidents.filter((incident) => incident.breachDecision !== "Not reportable"),
    [],
  );
  const selected = breachCases.find((incident) => incident.id === selectedId) ?? breachCases[0];
  const reportable = breachCases.filter((incident) => incident.breachDecision === "Reportable").length;
  const noticeDrafts = breachCases.filter((incident) => incident.breachDecision === "Notice drafted").length;
  const affectedPeople = breachCases.reduce((sum, incident) => sum + incident.affectedRecords, 0);

  function action(label: string) {
    setNotice(`${label} is staged. A ServiceNow integration would update the breach task, work notes, and notification artifacts.`);
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
              <p className="text-hs-caption font-semibold uppercase tracking-[0.1em] text-hs-primary">HIPAA breach workflow</p>
              <h1 className="mt-3 text-hs-title font-semibold text-hs-text">Breach Notification Center</h1>
              <p className="mt-3 max-w-3xl text-hs-body leading-7 text-hs-muted">
                Convert ServiceNow incidents into defensible HIPAA breach decisions. Track four-factor assessments,
                reportability, patient notice packets, OCR readiness, legal review, and 60-day notification clocks.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="inline-flex h-10 items-center rounded-hs border border-hs-border px-4 text-sm font-medium text-hs-text hover:border-hs-primary" href="/dashboard/active-incidents">
                Active incidents
              </Link>
              {canWrite ? (
                <>
                  <HsPrimaryButton type="button" onClick={() => action("Generate notice packet")}>
                    Generate notice packet
                  </HsPrimaryButton>
                  <HsSecondaryButton type="button" onClick={() => action("Request legal review")}>
                    Request legal review
                  </HsSecondaryButton>
                </>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["Open breach cases", breachCases.length, "Assessment or notice workflow"],
            ["Reportable", reportable, "Needs patient/OCR notification"],
            ["Notice drafts", noticeDrafts, "Ready for counsel review"],
            ["Potential people", affectedPeople.toLocaleString(), "Across implicated cases"],
          ].map(([label, value, context]) => (
            <article key={label} className="rounded-hs-card border border-hs-border bg-hs-card p-5 shadow-sm">
              <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">{label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-hs-text">{value}</p>
              <p className="mt-1 text-sm text-hs-muted">{context}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <aside className="rounded-hs-card border border-hs-border bg-hs-card p-6">
            <h2 className="text-hs-section font-semibold text-hs-text">Breach case queue</h2>
            <p className="mt-1 text-sm text-hs-muted">ServiceNow incidents that require privacy decisioning.</p>
            <div className="mt-5 space-y-3">
              {breachCases.map((incident) => (
                <button
                  key={incident.id}
                  type="button"
                  onClick={() => setSelectedId(incident.id)}
                  className={cn(
                    "w-full rounded-hs border p-4 text-left transition hover:border-hs-primary",
                    selected?.id === incident.id ? "border-hs-primary bg-hs-primary/5" : "border-hs-border bg-hs-page",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-hs-text">{incident.snowNumber}</p>
                      <p className="mt-1 text-sm leading-6 text-hs-muted">{incident.title}</p>
                    </div>
                    <span className={cn("rounded-hs-pill border px-2.5 py-1 text-hs-caption font-medium", severityClass(incident.severity))}>
                      {incident.severity}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-hs-pill border border-hs-border bg-hs-fill px-2.5 py-1 text-hs-caption text-hs-muted">
                      {incident.breachDecision}
                    </span>
                    <span className="rounded-hs-pill border border-hs-border bg-hs-fill px-2.5 py-1 text-hs-caption text-hs-muted">
                      {incident.affectedRecords.toLocaleString()} people
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {selected ? (
            <section className="space-y-6">
              <div className="rounded-hs-card border border-hs-border bg-hs-card p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-medium text-hs-primary">{selected.snowNumber}</p>
                    <h2 className="mt-1 text-hs-section font-semibold text-hs-text">{selected.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-hs-muted">{selected.phiSignal}</p>
                  </div>
                  <span className="rounded-hs-pill border border-hs-danger-border bg-hs-danger-bg px-3 py-1 text-hs-caption font-semibold text-hs-danger">
                    {selected.breachDecision}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Discovery date", selected.openedAt],
                    ["Patient notice due", selected.patientNoticeDue ?? "Not required"],
                    ["Regulator notice due", selected.regulatorNoticeDue ?? "Not required"],
                    ["Owner", selected.owner],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-hs border border-hs-border bg-hs-page p-3">
                      <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-hs-text">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                <section className="rounded-hs-card border border-hs-border bg-hs-card p-6">
                  <h2 className="text-hs-section font-semibold text-hs-text">Four-factor assessment</h2>
                  <div className="mt-5 grid gap-4">
                    {assessmentFactors.map((factor, index) => (
                      <article key={factor.title} className="rounded-hs border border-hs-border bg-hs-page p-4">
                        <div className="flex items-start gap-4">
                          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-hs-primary text-sm font-semibold text-white">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-semibold text-hs-text">{factor.title}</p>
                              <span className="rounded-hs-pill border border-hs-border bg-hs-card px-2.5 py-1 text-hs-caption font-medium text-hs-muted">
                                {factor.status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-hs-muted">{factor.detail}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <aside className="rounded-hs-card border border-hs-border bg-hs-card p-6">
                  <h2 className="text-hs-section font-semibold text-hs-text">Notice packet</h2>
                  <div className="mt-5 space-y-3">
                    {noticePackets.map((packet) => (
                      <article key={packet.name} className="rounded-hs border border-hs-border bg-hs-page p-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-hs-text">{packet.name}</p>
                          <span className="rounded-hs-pill border border-hs-border bg-hs-card px-2 py-1 text-[11px] font-medium text-hs-muted">
                            {packet.status}
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-medium text-hs-primary">{packet.owner}</p>
                        <p className="mt-2 text-sm leading-6 text-hs-muted">{packet.contents}</p>
                      </article>
                    ))}
                  </div>
                </aside>
              </div>

              <section className="rounded-hs-card border border-hs-border bg-hs-card p-6">
                <h2 className="text-hs-section font-semibold text-hs-text">ServiceNow evidence trail</h2>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {selected.timeline.map((event) => (
                    <div key={`${event.time}-${event.event}`} className="rounded-hs border border-hs-border bg-hs-page p-4">
                      <p className="text-xs font-medium text-hs-primary">{event.time} • {event.actor}</p>
                      <p className="mt-2 text-sm text-hs-muted">{event.event}</p>
                    </div>
                  ))}
                </div>
              </section>
            </section>
          ) : null}
        </section>
      </div>
    </div>
  );
}
