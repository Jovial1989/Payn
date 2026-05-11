import { AdminOfferFullForm } from "@/components/admin-offer-full-form";

export default function AdminNewOfferPage() {
  return (
    <div className="grid gap-6">
      <div>
        <a href="/admin/offers" className="text-sm text-accent-emerald hover:text-accent-emerald-strong">
          ← All offers
        </a>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-ink">New offer</h1>
        <p className="mt-1 text-sm text-ink-secondary">Create a new offer in the DB catalog.</p>
      </div>
      <AdminOfferFullForm mode="create" />
    </div>
  );
}
