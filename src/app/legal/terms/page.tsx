import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms" };

export default function Terms() {
  return (
    <LegalPage title="Terms of Use">
      <p>
        ModelClic connects event hosts with independent talent for part-time event work in Nigeria. By creating an
        account you agree to these terms.
      </p>
      <h2>Accounts</h2>
      <p>You must give accurate details and complete identity checks before taking or offering shifts.</p>
      <h2>Bookings and pay</h2>
      <p>
        Hosts fund staff pay when a booking is confirmed. Pay is released after both sides confirm the job, or
        automatically 12 hours after the event if the host does not respond.
      </p>
      <h2>Conduct</h2>
      <p>Harassment, unsafe requests or off-platform payment arrangements lead to removal.</p>
      <h2>Contact</h2>
      <p>support@modelclic.com</p>
    </LegalPage>
  );
}
