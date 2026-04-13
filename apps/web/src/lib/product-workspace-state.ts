function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getProductWorkspaceStorageKey(scope: string, userId?: string | null) {
  return `payn:workspace:${userId ?? "guest"}:${scope}`;
}

export function readPersistedProductWorkspaceState<T extends Record<string, unknown>>(
  scope: string,
  fallback: T,
  userId?: string | null,
) {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(getProductWorkspaceStorageKey(scope, userId));
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<T>;
    if (!parsed || typeof parsed !== "object") {
      return fallback;
    }

    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function writePersistedProductWorkspaceState<T extends Record<string, unknown>>(
  scope: string,
  state: T,
  userId?: string | null,
) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    getProductWorkspaceStorageKey(scope, userId),
    JSON.stringify(state),
  );
}
