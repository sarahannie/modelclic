import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>We collect only what we need to verify members, run bookings and keep people safe.</p>
      <h2>What we collect</h2>
      <p>Name, email, phone, city, identity-check results and booking history.</p>
      <h2>Who sees it</h2>
      <p>
        Hosts see a talent&rsquo;s name, city and verification status. Phone numbers, ID numbers and bank details are
        never shown to other members.
      </p>
      <h2>Your rights</h2>
      <p>
        Under the Nigeria Data Protection Act you can ask to see, correct or delete your data at any time:
        privacy@modelclic.com.
      </p>
    </LegalPage>
  );
}
