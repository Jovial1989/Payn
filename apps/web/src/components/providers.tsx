"use client";

import { AuthProvider } from "@/hooks/use-auth";
import { ChatWidget } from "@/components/chat-widget";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <ChatWidget />
    </AuthProvider>
  );
}
