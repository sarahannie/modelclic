import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { GigForm } from "./GigForm";

export const metadata: Metadata = { title: "Post a shift" };

export default async function NewGigPage() {
  await requireProfile("host");
  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow">New shift</p>
      <h1 className="mt-2 mb-8 text-4xl font-medium">Post a shift</h1>
      <GigForm />
    </div>
  );
}
