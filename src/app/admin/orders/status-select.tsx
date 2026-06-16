"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/features/admin/actions/orders";

const STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export function StatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, newStatus);
      } catch (error) {
        console.error(error);
        alert("Failed to update status. Are you an admin?");
      }
    });
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className={`text-xs font-medium rounded-full px-3 py-1 border outline-none appearance-none cursor-pointer
        ${currentStatus === "completed" || currentStatus === "delivered" ? "bg-green-50 text-green-700 border-green-200" : ""}
        ${currentStatus === "pending" || currentStatus === "processing" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : ""}
        ${currentStatus === "shipped" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
        ${currentStatus === "cancelled" || currentStatus === "refunded" ? "bg-red-50 text-red-700 border-red-200" : ""}
        disabled:opacity-50
      `}
    >
      {STATUSES.map((status) => (
        <option key={status} value={status} className="bg-background text-foreground">
          {status.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
