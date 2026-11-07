"use client";

import { useState } from "react";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ConsentBlock, CONSENT_VERSION } from "../register/forms";
import { declineConsent, recordConsent } from "../actions";

export function ConsentForm({ next }: { next: string }) {
  const [agreed, setAgreed] = useState(false);
  return (
    <>
      <ActionForm action={recordConsent} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="consent_version" value={CONSENT_VERSION} />
        <ConsentBlock agreed={agreed} onChange={setAgreed} />
        <SubmitButton className="btn btn-ink btn-lg w-full" pendingLabel="Saving…" disabled={!agreed}>Agree &amp; continue</SubmitButton>
      </ActionForm>
      <form action={declineConsent} className="mt-3">
        <button className="btn btn-ghost w-full text-ink-500">I don&rsquo;t agree — sign me out</button>
      </form>
    </>
  );
}
