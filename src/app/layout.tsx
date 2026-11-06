import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://modelclic.com"),
  title: {
    default: "ModelClic — Verified event staff, paid on time",
    template: "%s · ModelClic",
  },
  description:
    "Hire verified ushers, hostesses, models and promoters for your event — or find paid shifts near you. Escrow pay on every booking.",
  openGraph: {
    title: "ModelClic",
    description: "Verified event staff. Escrow pay. Live in Lagos, Abuja and Port Harcourt.",
    url: "https://modelclic.com",
    siteName: "ModelClic",
    locale: "en_NG",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e1a2b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG">
      <body>{children}</body>
    </html>
  );
}
