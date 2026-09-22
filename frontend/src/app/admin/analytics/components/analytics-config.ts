import { CURRENCY } from "@/lib/constants";
import type { AnalyticsOverviewParams } from "@/types";

export const RANGE_OPTIONS: Array<{
  label: string;
  value: Exclude<AnalyticsOverviewParams["range"], undefined>;
}> = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last 180 days", value: "180d" },
  { label: "Last 365 days", value: "365d" },
];

export const CHART_COLORS = [
  "#10b981",
  "#0ea5e9",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#6366f1",
];

export const formatCurrency = (value: number) =>
  `${CURRENCY}${Math.round(value).toLocaleString()}`;

export const formatPercent = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
