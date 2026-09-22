"use client";

import { useMemo, useState } from "react";

import { useGetAdminAnalyticsOverview } from "@/lib/api/analytics";
import type { AnalyticsOverviewParams } from "@/types";

import { AnalyticsChartsSections } from "./components/AnalyticsChartsSections";
import { AnalyticsHeader } from "./components/AnalyticsHeader";
import { AnalyticsKpiGrid } from "./components/AnalyticsKpiGrid";
import { AnalyticsLoading } from "./components/AnalyticsLoading";

export default function AdminAnalyticsPage() {
  const [range, setRange] =
    useState<Exclude<AnalyticsOverviewParams["range"], undefined>>("30d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const queryParams = useMemo<AnalyticsOverviewParams>(() => {
    return {
      range,
      from: from || undefined,
      to: to || undefined,
    };
  }, [range, from, to]);

  const {
    data: overview,
    isLoading,
    refetch,
    isRefetching,
  } = useGetAdminAnalyticsOverview(queryParams);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AnalyticsHeader
        range={range}
        from={from}
        to={to}
        onRangeChange={setRange}
        onFromChange={setFrom}
        onToChange={setTo}
        onRefresh={() => refetch()}
        isRefetching={isRefetching}
      />

      {isLoading ? (
        <AnalyticsLoading />
      ) : (
        <>
          <AnalyticsKpiGrid overview={overview} />
          <AnalyticsChartsSections overview={overview} />
        </>
      )}
    </div>
  );
}
