import type { stockStats } from "./stockUtils";

interface StatsDisplayProps {
  stats: stockStats;
  colored: boolean;
}

export function StatsDisplay({ stats, colored }: StatsDisplayProps) {
  const { totalProfit, totalPositionValue, totalProfitRate } = stats;
  return (
    <div className="font-bold">
      <span>今日盈亏：</span>
      <span
        className={
          colored
            ? parseFloat(totalProfit) >= 0
              ? "text-red-500"
              : "text-green-500"
            : ""
        }
      >
        {totalProfit}
      </span>
      <span> 今日收益率：</span>
      <span
        className={
          colored
            ? parseFloat(totalProfit) >= 0
              ? "text-red-500"
              : "text-green-500"
            : ""
        }
      >
        {totalProfitRate}%
      </span>
      <span className="hidden sm:inline"> 总持仓：</span>
      <span
        className={`hidden sm:inline text-center ${
          colored
            ? parseFloat(totalProfit) >= 0
              ? "text-red-500"
              : "text-green-500"
            : ""
        }`}
      >
        {totalPositionValue}
      </span>
      <p className="text-center">
        <span className="inline sm:hidden"> 总持仓：</span>
        <span
          className={`inline sm:hidden ${
            colored
              ? parseFloat(totalProfit) >= 0
                ? "text-red-500"
                : "text-green-500"
              : ""
          }`}
        >
          {totalPositionValue}
        </span>
      </p>
    </div>
  );
}
