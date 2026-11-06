"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type Toast = { id: number; text: string; tone: "ok" | "error" };
const Ctx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, text, tone }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 4200);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 md:bottom-6" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex max-w-md items-start gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold shadow-(--shadow-lift) [animation:toast-in_.25s_ease-out] ${
              t.tone === "error" ? "bg-vermilion-600 text-white" : "bg-ink text-white"
            }`}
          >
            {t.tone === "error" ? <AlertCircle className="mt-px size-4 shrink-0" aria-hidden /> : <CheckCircle2 className="mt-px size-4 shrink-0 text-ice-300" aria-hidden />}
            <span className="flex-1">{t.text}</span>
            <button onClick={() => setItems((s) => s.filter((x) => x.id !== t.id))} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
