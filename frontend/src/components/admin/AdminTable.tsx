"use client";

import { Table } from "@/components/ui/table";
import type { ReactNode } from "react";

interface AdminTableProps {
  children: ReactNode;
}

export function AdminTable({ children }: AdminTableProps) {
  return <Table className="border-separate border-spacing-0">{children}</Table>;
}
