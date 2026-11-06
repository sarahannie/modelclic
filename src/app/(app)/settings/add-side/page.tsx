import type { Metadata } from "next";
import { Repeat } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { addSide } from "@/app/actions/account";

export const metadata: Metadata = { title: "Add a side" };

export default async function AddSide() {
  const { profile } = await requireUser(["talent", "host"]);
  const target = profile.role === "host" ? "talent" : "host";
  const already = profile.sides.includes(target);
  return (
    <>
      <h1 className="t-h1">{target === "host" ? "Also hire on ModelClic" : "Also work on ModelClic"}</h1>
      <p className="t-sub mt-1">One account, two sides. Your identity check carries over — switch any time from the account menu.</p>
      <div className="card card-pad mt-6">
        {already ? (
          <p className="flex items-center gap-2 font-semibold"><Repeat className="size-4" /> You already have both sides. Use “Switch to {target === "host" ? "hiring" : "working"}” in the account menu.</p>
        ) : (
          <ActionForm action={addSide} className="space-y-4" redirectTo={target === "host" ? "/host" : "/talent/profile"}>
            {target === "host" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label" htmlFor="company">Business name <span className="font-normal text-ink-400">(optional)</span></label><input id="company" name="company" className="field" /></div>
                <div><label className="label" htmlFor="cac">CAC number <span className="font-normal text-ink-400">(if registered)</span></label><input id="cac" name="cac" className="field" /></div>
              </div>
            )}
            <SubmitButton className="btn btn-primary" pendingLabel="Adding…">{target === "host" ? "Add hiring profile" : "Add talent profile"}</SubmitButton>
          </ActionForm>
        )}
      </div>
    </>
  );
}
