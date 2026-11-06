import type { Metadata } from "next";
import { requireUser, getPrivate } from "@/lib/session";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Toggle } from "@/components/ui/kit";
import { updateNotifyPrefs } from "@/app/actions/account";

export const metadata: Metadata = { title: "Notifications" };

const ROWS = [
  { key: "jobs", title: "New jobs that match me", sub: "Based on your skills, preferences and location" },
  { key: "bids", title: "Bids and offers", sub: "When a host views, offers or declines" },
  { key: "payments", title: "Payments", sub: "Escrow held, pay released, withdrawals" },
  { key: "messages", title: "Messages", sub: "New chat messages" },
];

export default async function NotifySettings() {
  const { profile } = await requireUser(["talent", "host"]);
  const priv = await getPrivate(profile.id);
  const prefs = priv?.notify_prefs ?? {};
  return (
    <>
      <h1 className="t-h1">Notifications</h1>
      <p className="t-sub mt-1">Choose how we reach you about bids, offers and pay.</p>
      <ActionForm action={updateNotifyPrefs} className="mt-6">
        <div className="card overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Notify me about</th><th className="text-center">Push</th><th className="text-center">Email</th><th className="text-center">SMS</th></tr></thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.key}>
                  <td><p className="font-bold">{r.title}</p><p className="text-xs text-ink-400">{r.sub}</p></td>
                  {(["push", "email", "sms"] as const).map((c) => (
                    <td key={c} className="text-center"><Toggle name={`${r.key}.${c}`} defaultChecked={prefs[r.key]?.[c] ?? c !== "sms"} label={`${r.title} by ${c}`} /></td>
                  ))}
                </tr>
              ))}
              <tr>
                <td><p className="font-bold">Safety alerts</p><p className="text-xs text-ink-400">SOS updates and venue changes</p></td>
                {["push", "email", "sms"].map((c) => <td key={c} className="text-center"><Toggle name={`safety.${c}`} defaultChecked disabled label={`Safety alerts by ${c}`} /></td>)}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-400">Safety alerts are always on.</p>
        <div className="mt-4 flex justify-end"><SubmitButton className="btn btn-ink" pendingLabel="Saving…">Save</SubmitButton></div>
      </ActionForm>
    </>
  );
}
