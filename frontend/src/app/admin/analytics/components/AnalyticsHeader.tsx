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
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-mono uppercase">
          Analytics
        </h1>
        <p className="text-muted-foreground font-medium text-xs mt-1">
          Revenue, conversion, fulfillment and customer growth intelligence.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Select
          value={range}
          onValueChange={(value) => onRangeChange(value as typeof range)}
        >
          <SelectTrigger className="min-w-44 rounded-lg border-border bg-background text-foreground">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground">
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
          className="rounded-lg border-border bg-background text-foreground"
        />
        <Input
          type="date"
          value={to}
          onChange={(event) => onToChange(event.target.value)}
          className="rounded-lg border-border bg-background text-foreground"
        />

        <Button
          variant="outline"
          className="rounded-lg border-border bg-background text-foreground hover:bg-muted font-mono text-xs"
          onClick={onRefresh}
          disabled={isRefetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin text-primary" : ""}`}
          />
          Refresh
        </Button>
      </div>
    </header>
  );
}
