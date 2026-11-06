const STYLES: Record<string, string> = {
  pending: "bg-warn-50 text-warn",
  open: "bg-success-50 text-success",
  applied: "bg-ice-100 text-ink-700",
  accepted: "bg-success-50 text-success",
  declined: "bg-vermilion-50 text-vermilion-700",
  rejected: "bg-vermilion-50 text-vermilion-700",
  withdrawn: "bg-ink/5 text-ink-500",
  closed: "bg-ink/5 text-ink-500",
};

const LABELS: Record<string, string> = {
  pending: "Awaiting review",
  open: "Live",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${STYLES[status] ?? "bg-ink/5 text-ink-500"}`}>
      {LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
