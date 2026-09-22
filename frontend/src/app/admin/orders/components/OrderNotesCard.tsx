"use client";

interface OrderNotesCardProps {
  notes?: string;
}

export function OrderNotesCard({ notes }: OrderNotesCardProps) {
  if (!notes) {
    return null;
  }

  return (
    <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
      <h4 className="mb-1 text-sm font-semibold text-yellow-800">
        Customer Notes
      </h4>
      <p className="text-sm text-yellow-700">{notes}</p>
    </div>
  );
}
