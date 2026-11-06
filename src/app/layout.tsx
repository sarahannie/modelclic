import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://modelclic.com"),
  title: { default: "ModelClic — Verified event staff, paid on time", template: "%s · ModelClic" },
  description:
    "Hire verified ushers, hostesses, models and promoters for your event — or find paid shifts near you. NIN-checked members and escrow pay on every booking.",
  openGraph: {
    title: "ModelClic — Safe. Verified. Paid.",
    description: "Verified event staff and escrow pay. Live in Lagos, Abuja and Port Harcourt.",
    url: "https://modelclic.com",
    siteName: "ModelClic",
    locale: "en_NG",
    type: "website",
    images: [{ url: "/images/hero.webp", width: 900, height: 1350 }],
  },
};

export const viewport: Viewport = { themeColor: "#0e1a2b" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
