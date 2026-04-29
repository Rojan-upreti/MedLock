"use client";

import { useMemo, useState } from "react";
import { HsAlertBanner } from "@/components/hipaa-shield/HsAlertBanner";
import { HsPrimaryButton } from "@/components/hipaa-shield/HsPrimaryButton";
import { HsReadOnlyBanner } from "@/components/hipaa-shield/HsReadOnlyBanner";
import { HsSecondaryButton } from "@/components/hipaa-shield/HsSecondaryButton";
import { useDashboardRbac } from "@/lib/rbac/context";
import { cn } from "@/lib/utils";

type Contact = {
  role: string;
  name: string;
  email: string;
  phone: string;
  coverage: string;
};

type Location = {
  name: string;
  type: string;
  address: string;
  safeguards: string;
  status: "Current" | "Review" | "Action needed";
};

type SystemProfile = {
  label: string;
  value: string;
  context: string;
};

const contacts: Contact[] = [
  {
    role: "Privacy Officer",
    name: "Maya Patel",
    email: "privacy@medlock.example",
    phone: "+1 (555) 010-1140",
    coverage: "Patient rights, PHI disclosures, breach notifications",
  },
  {
    role: "Security Officer",
    name: "Jordan Kim",
    email: "security@medlock.example",
    phone: "+1 (555) 010-2271",
    coverage: "Security Rule safeguards, incident triage, access controls",
  },
  {
    role: "Compliance Manager",
    name: "Avery Thompson",
    email: "compliance@medlock.example",
    phone: "+1 (555) 010-3382",
    coverage: "Risk register, training, BAAs, audit packages",
  },
  {
    role: "Billing / Legal",
    name: "Nina Rodriguez",
    email: "legal@medlock.example",
    phone: "+1 (555) 010-4493",
    coverage: "Contracts, subscriptions, procurement, policy approvals",
  },
];

const locations: Location[] = [
  {
    name: "MedLock HQ",
    type: "Administrative office",
    address: "1140 Health Park Ave, Suite 400, Boston, MA",
    safeguards: "Badge access, clean desk, locked network closets",
    status: "Current",
  },
  {
    name: "Remote workforce",
    type: "Distributed workforce",
    address: "US-based remote staff",
    safeguards: "MFA, device encryption, VPN, workstation lock policy",
    status: "Review",
  },
  {
    name: "Cloud production",
    type: "Cloud platform",
    address: "Supabase / Render / Cloudflare managed regions",
    safeguards: "TLS, RLS, storage policies, audit event streaming",
    status: "Current",
  },
];

const operatingProfile: SystemProfile[] = [
  { label: "Organization type", value: "Business Associate", context: "Supports HIPAA-covered customers" },
  { label: "HIPAA scope", value: "ePHI + operational PHI", context: "Application, audit, vendor, training workflows" },
  { label: "Workforce size", value: "74", context: "Active workforce and contractors" },
  { label: "Primary region", value: "United States", context: "US-hosted operations and support" },
  { label: "Risk owner", value: "Security Officer", context: "Quarterly risk and safeguard review" },
  { label: "Policy owner", value: "Privacy Officer", context: "Privacy, patient-rights, breach documents" },
];

const identifiers = [
  ["Legal name", "MedLock Health Compliance, Inc."],
  ["Doing business as", "MedLock"],
  ["Tax / vendor ID", "ML-HIPAA-2026"],
  ["Primary domain", "medlock.example"],
  ["Support domain", "support.medlock.example"],
  ["BAA classification", "Business Associate / Subprocessor"],
];

const evidenceChecklist = [
  { label: "Security contact assigned", complete: true },
  { label: "Privacy contact assigned", complete: true },
  { label: "Covered services documented", complete: true },
  { label: "Remote workforce safeguards reviewed", complete: false },
  { label: "Vendor profile reviewed this quarter", complete: true },
  { label: "Policy acknowledgements current", complete: false },
];

const statusStyles: Record<Location["status"], string> = {
  Current: "border-hs-success-border bg-hs-success-bg text-hs-success",
  Review: "border-[#FDE68A] bg-hs-warning-bg text-hs-warning",
  "Action needed": "border-hs-danger-border bg-hs-danger-bg text-hs-danger",
};

export default function OrganizationProfilePage() {
  const rbac = useDashboardRbac();
  const canWrite = rbac.canWritePage("organization_profile");
  const readOnly = rbac.permissionFor("organization_profile") === "read_only";
  const [notice, setNotice] = useState<string | null>(null);

  const completion = useMemo(() => {
    const done = evidenceChecklist.filter((item) => item.complete).length;
    return Math.round((done / evidenceChecklist.length) * 100);
  }, []);

  function showPlaceholder(action: string) {
    setNotice(`${action} is ready as a UI action. Real persistence can be wired to the organizations table next.`);
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

        <section className="overflow-hidden rounded-hs-card border border-hs-border bg-hs-card">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 md:p-8">
              <p className="text-hs-caption font-semibold uppercase tracking-[0.1em] text-hs-primary">Settings</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="grid size-14 place-items-center rounded-hs-card bg-hs-primary text-xl font-semibold text-white">
                  ML
                </div>
                <div>
                  <h1 className="text-hs-title font-semibold text-hs-text">Organization Profile</h1>
                  <p className="text-hs-body text-hs-muted">MedLock Health Compliance, Inc.</p>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-hs-body leading-7 text-hs-muted">
                Central profile for HIPAA classification, responsible contacts, operating footprint, safeguards, and
                audit-ready organization metadata used across policies, vendors, reports, and access reviews.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-hs-pill border border-hs-border bg-hs-fill px-3 py-1 text-hs-caption font-medium text-hs-muted">
                  Business Associate
                </span>
                <span className="rounded-hs-pill border border-hs-border bg-hs-fill px-3 py-1 text-hs-caption font-medium text-hs-muted">
                  ePHI processing
                </span>
                <span className="rounded-hs-pill border border-hs-border bg-hs-fill px-3 py-1 text-hs-caption font-medium text-hs-muted">
                  Quarterly review cadence
                </span>
              </div>
            </div>
            <div className="border-t border-hs-border bg-hs-page p-6 md:p-8 lg:border-l lg:border-t-0">
              <div className="rounded-hs-card border border-hs-border bg-hs-card p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">Profile completion</p>
                    <p className="mt-2 text-4xl font-semibold tabular-nums text-hs-text">{completion}%</p>
                  </div>
                  <div
                    className="grid size-24 place-items-center rounded-full border border-hs-border"
                    style={{ background: `conic-gradient(rgb(37 99 235) ${completion}%, transparent 0)` }}
                  >
                    <div className="grid size-20 place-items-center rounded-full bg-hs-card text-sm font-medium text-hs-muted">
                      Review
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {canWrite ? (
                    <>
                      <HsPrimaryButton type="button" onClick={() => showPlaceholder("Edit profile")}>
                        Edit profile
                      </HsPrimaryButton>
                      <HsSecondaryButton type="button" onClick={() => showPlaceholder("Upload logo")}>
                        Upload logo
                      </HsSecondaryButton>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-hs-card border border-hs-border bg-hs-card p-5 shadow-sm">
            <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">Contacts</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-hs-text">{contacts.length}</p>
            <p className="mt-1 text-sm text-hs-muted">Named responsible owners</p>
          </article>
          <article className="rounded-hs-card border border-hs-border bg-hs-card p-5 shadow-sm">
            <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">Locations</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-hs-text">{locations.length}</p>
            <p className="mt-1 text-sm text-hs-muted">Facilities and cloud footprint</p>
          </article>
          <article className="rounded-hs-card border border-hs-border bg-hs-card p-5 shadow-sm">
            <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">Safeguards</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-hs-text">12</p>
            <p className="mt-1 text-sm text-hs-muted">Administrative, technical, physical</p>
          </article>
          <article className="rounded-hs-card border border-hs-border bg-hs-card p-5 shadow-sm">
            <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">Last reviewed</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-hs-text">12d</p>
            <p className="mt-1 text-sm text-hs-muted">Next review in 78 days</p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <section className="rounded-hs-card border border-hs-border bg-hs-card p-6">
              <h2 className="text-hs-section font-semibold text-hs-text">Organization identity</h2>
              <div className="mt-5 grid gap-3">
                {identifiers.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 rounded-hs border border-hs-border bg-hs-page px-4 py-3">
                    <p className="text-sm text-hs-muted">{label}</p>
                    <p className="text-right text-sm font-medium text-hs-text">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-hs-card border border-hs-border bg-hs-card p-6">
              <h2 className="text-hs-section font-semibold text-hs-text">Operating profile</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {operatingProfile.map((item) => (
                  <article key={item.label} className="rounded-hs border border-hs-border bg-hs-page p-4">
                    <p className="text-hs-caption font-medium uppercase tracking-wide text-hs-muted">{item.label}</p>
                    <p className="mt-2 text-base font-semibold text-hs-text">{item.value}</p>
                    <p className="mt-1 text-sm leading-6 text-hs-muted">{item.context}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-hs-card border border-hs-border bg-hs-card p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-hs-section font-semibold text-hs-text">Responsible contacts</h2>
                  <p className="mt-1 text-sm text-hs-muted">Primary contacts for HIPAA governance and operations.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4">
                {contacts.map((contact) => (
                  <article key={contact.role} className="rounded-hs border border-hs-border bg-hs-page p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-hs-text">{contact.role}</p>
                        <p className="mt-1 text-sm text-hs-muted">{contact.name}</p>
                        <p className="mt-2 text-sm leading-6 text-hs-muted">{contact.coverage}</p>
                      </div>
                      <div className="text-sm sm:text-right">
                        <p className="font-medium text-hs-primary">{contact.email}</p>
                        <p className="mt-1 text-hs-muted">{contact.phone}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-hs-card border border-hs-border bg-hs-card p-6">
            <h2 className="text-hs-section font-semibold text-hs-text">Facilities and footprint</h2>
            <div className="mt-5 overflow-x-auto rounded-hs border border-hs-border">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="h-11 bg-hs-page text-hs-caption font-medium uppercase tracking-wide text-hs-muted">
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Address / scope</th>
                    <th className="px-4 py-3">Safeguards</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((location) => (
                    <tr key={location.name} className="border-t border-hs-fill">
                      <td className="px-4 py-3 text-sm font-medium text-hs-text">{location.name}</td>
                      <td className="px-4 py-3 text-sm text-hs-muted">{location.type}</td>
                      <td className="px-4 py-3 text-sm text-hs-muted">{location.address}</td>
                      <td className="px-4 py-3 text-sm text-hs-muted">{location.safeguards}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-hs-pill border px-2.5 py-1 text-hs-caption font-medium",
                            statusStyles[location.status],
                          )}
                        >
                          {location.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="rounded-hs-card border border-hs-border bg-hs-card p-6">
            <h2 className="text-hs-section font-semibold text-hs-text">Audit readiness</h2>
            <p className="mt-1 text-sm text-hs-muted">Profile fields used in reports, BAAs, policies, and audit packages.</p>
            <div className="mt-5 space-y-3">
              {evidenceChecklist.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-hs border border-hs-border bg-hs-page px-3 py-2">
                  <span
                    className={cn(
                      "size-2.5 rounded-full",
                      item.complete ? "bg-hs-success" : "bg-hs-warning",
                    )}
                    aria-hidden
                  />
                  <span className="text-sm text-hs-text">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-hs border border-hs-warning/40 bg-hs-warning-bg/50 p-4">
              <p className="text-sm font-medium text-hs-text">Next recommended action</p>
              <p className="mt-1 text-sm leading-6 text-hs-muted">
                Review remote workforce safeguards and policy acknowledgements before the next quarterly audit package.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
