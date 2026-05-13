import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { AdminPushCampaignActions } from "@/components/admin-push-campaign-actions";

type Campaign = {
  id: string;
  title: string;
  body: string;
  audience_countries: string[];
  audience_languages: string[];
  audience_last_active_days: number | null;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  audience_size: number | null;
  delivered_count: number;
  failed_count: number;
  invalid_tokens_marked: number;
  created_at: string;
  updated_at: string;
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-line">
      <span className="text-sm text-ink-tertiary">{label}</span>
      <span className="text-right text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

export default async function PushCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();
  if (!admin) return <p className="p-8 text-sm text-ink-secondary">Admin client not configured.</p>;

  const { data: campaign } = await admin
    .from("push_campaigns")
    .select("*")
    .eq("id", id)
    .single<Campaign>();

  if (!campaign) return notFound();

  const isMutable = campaign.status === "draft" || campaign.status === "scheduled";
  const isSent = campaign.status === "sent";

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/push" className="text-xs font-medium text-ink-tertiary hover:text-ink">
            ← Push Campaigns
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-ink">{campaign.title}</h1>
          <p className="mt-1 text-sm text-ink-secondary">{campaign.body}</p>
        </div>
        <AdminPushCampaignActions campaign={campaign} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Stats */}
        <div className="rounded-[20px] border border-line bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Stats</p>
          <div className="mt-3">
            <Row label="Status" value={<span className="capitalize">{campaign.status}</span>} />
            <Row label="Audience size" value={campaign.audience_size?.toLocaleString() ?? "—"} />
            <Row label="Delivered" value={campaign.delivered_count.toLocaleString()} />
            <Row label="Failed" value={campaign.failed_count.toLocaleString()} />
            <Row label="Invalid tokens marked" value={campaign.invalid_tokens_marked.toLocaleString()} />
            <Row label="CTR" value="—" />
          </div>
        </div>

        {/* Metadata */}
        <div className="rounded-[20px] border border-line bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Details</p>
          <div className="mt-3">
            <Row label="Countries" value={campaign.audience_countries.join(", ") || "All"} />
            <Row label="Languages" value={campaign.audience_languages.join(", ") || "All"} />
            <Row
              label="Last active"
              value={campaign.audience_last_active_days ? `${campaign.audience_last_active_days}d` : "Anyone"}
            />
            <Row label="Scheduled" value={fmt(campaign.scheduled_at)} />
            <Row label="Sent at" value={fmt(campaign.sent_at)} />
            <Row label="Created" value={fmt(campaign.created_at)} />
          </div>
        </div>
      </div>

      {!isSent && !isMutable && null}
    </div>
  );
}
