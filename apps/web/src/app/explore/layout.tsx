import { ProductShell } from "@/components/product-shell";

// Wrap /explore and /explore/[bucket] in the same shell used by /discover and
// the 23 category routes, so navigating between Atlas buckets and categories
// keeps the sidebar in place instead of swapping to a full-width chrome.
export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <ProductShell>{children}</ProductShell>;
}
