import { redirect } from "next/navigation";

// Retired: Offer Health merged into Affiliate Engine (Catalog → Affiliate Engine).
// Reconciliation is now covered by the engine's Catalog Review; enrichment +
// maintenance live there too.
export default function AdminOfferHealthRedirect() {
  redirect("/admin/financeads");
}
