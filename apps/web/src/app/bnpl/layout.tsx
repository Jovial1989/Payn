import { ProductShell } from "@/components/product-shell";
export default function BnplLayout({ children }: { children: React.ReactNode }) {
  return <ProductShell>{children}</ProductShell>;
}
