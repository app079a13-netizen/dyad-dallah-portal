import { useCallback } from "react";
import { trpc } from "./trpc";

const STORAGE_KEY = "hireinsaudi_session_id";

function ensureSessionId(): string {
  let sid = localStorage.getItem(STORAGE_KEY);
  if (!sid) {
    sid = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(STORAGE_KEY, sid);
  }
  return sid;
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  return ensureSessionId();
}

export function useStepSession() {
  const submit = trpc.steps.submit.useMutation();

  const recordStep = useCallback(
    async (stepKey: string, data: Record<string, unknown>) => {
      try {
        await submit.mutateAsync({
          sessionId: getSessionId(),
          stepKey,
          data: data as Record<string, any>,
        });
      } catch (e) {
        console.warn("Step record failed:", e);
      }
    },
    [submit]
  );

  return { recordStep, isSubmitting: submit.isPending };
}
