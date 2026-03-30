"use client";

import { PAYN_OPEN_CHAT_EVENT } from "@/components/chat-widget";

export function ChatLaunchButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(PAYN_OPEN_CHAT_EVENT))}
      className={className}
    >
      {children}
    </button>
  );
}
