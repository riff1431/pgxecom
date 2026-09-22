import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AnalyticsOverviewParams } from "@/types";

import { RANGE_OPTIONS } from "./analytics-config";

interface AnalyticsHeaderProps {
  range: Exclude<AnalyticsOverviewParams["range"], undefined>;
  from: string;
  to: string;
  onRangeChange: (
    value: Exclude<AnalyticsOverviewParams["range"], undefined>,
  ) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onRefresh: () => void;
  isRefetching: boolean;
}

export function AnalyticsHeader({
  range,
  from,
  to,
  onRangeChange,
  onFromChange,
  onToChange,
  onRefresh,
  isRefetching,
}: AnalyticsHeaderProps) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Revenue, conversion, fulfillment and customer growth intelligence.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Select
          value={range}
          onValueChange={(value) => onRangeChange(value as typeof range)}
        >
          <SelectTrigger className="min-w-44 rounded-xl">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={from}
          onChange={(event) => onFromChange(event.target.value)}
          className="rounded-xl"
        />
        <Input
          type="date"
          value={to}
          onChange={(event) => onToChange(event.target.value)}
          className="rounded-xl"
        />

        <Button
          variant="outline"
          className="rounded-xl"
          onClick={onRefresh}
          disabled={isRefetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
    </header>
  );
}
