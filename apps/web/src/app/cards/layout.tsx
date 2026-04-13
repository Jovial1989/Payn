import { ProductShell } from "@/components/product-shell";

export default function CardsLayout({ children }: { children: React.ReactNode }) {
  return <ProductShell>{children}</ProductShell>;
}
