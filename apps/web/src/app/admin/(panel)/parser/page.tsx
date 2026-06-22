import { redirect } from "next/navigation";

// Retired: manual import moved onto the Offers page (Catalog → Offers).
export default function AdminParserRedirect() {
  redirect("/admin/offers");
}
