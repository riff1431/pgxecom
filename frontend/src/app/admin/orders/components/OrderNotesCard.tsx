"use client";

interface OrderNotesCardProps {
  notes?: string;
}

export function OrderNotesCard({ notes }: OrderNotesCardProps) {
  if (!notes) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
      <h4 className="mb-1 text-xs font-mono uppercase tracking-wider font-semibold text-amber-400">
        Customer Notes
      </h4>
      <p className="text-sm text-amber-200">{notes}</p>
    </div>
  );
}
