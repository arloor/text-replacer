import {
  data,
  redirect,
  useLoaderData,
  useSearchParams,
} from "react-router-dom";
import type { MetaFunction } from "react-router";
import type { StockEntry, StockHqData } from "../types/real-time";
import { TopNavigation } from "~/components/TopNavigation";
import { StockTableView } from "~/components/realtime/StockTableView";
import { StatsDisplay } from "~/components/realtime/StatsDisplay";
import {
  calculateTotalStats,
  fetchAStocks,
  fetchHKStocks,
} from "~/components/realtime/stockUtils";
import type { Route } from "./+types";
import { getSession } from "~/sessions.server";
import { useEffect } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "实时数据 | 股票监控" },
    { name: "description", content: "实时监控股票数据，获取最新行情变化。" },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (!session.has("userId")) {
    return redirect("/login");
  }
  try {
    const response = await fetch(
      "http://tt.arloor.com:5000/user-stocks/" + session.get("userId"),
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("无法加载股票列表");
    }

    const stockCells: StockEntry[] = await response.json();
    // 区分A股和港股
    const aCodes = stockCells.filter((cell) => /^(bj|sh|sz)/.test(cell.code));
    const hkCodes = stockCells.filter((cell) => /^(hk)/.test(cell.code));

    // 并行获取A股和港股数据
    const [aStocksData, hkStocksData] = await Promise.all([
      fetchAStocks(aCodes),
      fetchHKStocks(hkCodes),
    ]);

    // 合并数据
    const allStocksData = [...aStocksData, ...hkStocksData];

    // 根据stockCells的顺序排序数据
    allStocksData.sort((a, b) => {
      if (!a || !b) {
        if (!a && !b) return 0;
        if (!a) return 1;
        return -1;
      }
      const aIndex = stockCells.findIndex(
        (c) => c.code === `${a.market}${a.code}`
      );
      const bIndex = stockCells.findIndex(
        (c) => c.code === `${b.market}${b.code}`
      );
      return aIndex - bIndex;
    });
    const statsData = calculateTotalStats(allStocksData);
    return data({
      error: session.get("error"),
      userId: session.get("userId"),
      stockCells,
      allStocksData,
      statsData,
    });
  } catch (err) {
    console.error("加载股票列表失败:", err);
    return data({
      error: err,
    });
  }
}

// 客户端渲染的主组件
export default function RealtimePage() {
  const isAutoRefresh = false; // 是否启用自动刷新
  // 自动刷新逻辑
  useEffect(() => {
    let intervalId: number | undefined;

    if (isAutoRefresh) {
      intervalId = window.setInterval(() => {
        window.location.reload();
      }, 3000); // 30秒刷新一次
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoRefresh]);
  const loaderData = useLoaderData();
  // console.log("Loader Data:", loaderData);
  const userId = loaderData.userId || "";
  console.log("User ID:", userId);
  const error = loaderData.error || "";
  loaderData.error && console.error("Error:", loaderData.error);
  const stockCells: StockEntry[] = loaderData.stockCells || [];
  const stocksData: StockHqData[] = loaderData.allStocksData || [];
  const stats = loaderData.statsData || {
    totalProfit: 0,
    totalPositionValue: 0,
    totalProfitRate: 0,
  };
  const [searchParams] = useSearchParams();
  const colored = searchParams.get("colored") !== "false"; // 默认为true

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-end items-center mt-4 mb-4 gap-4 sm:gap-2">
        <div className="flex flex-row jutify-start items-center gap-2">
          <TopNavigation />
        </div>
        <div className="flex flex-row justify-end items-center gap-2 sm:mr-auto">
          <StatsDisplay
            totalProfit={stats.totalProfit}
            totalPositionValue={stats.totalPositionValue}
            totalProfitRate={stats.totalProfitRate}
            colored={colored}
          />
        </div>
      </div>
      {error ? (
        <div className="rounded-lg border p-6 shadow-sm bg-red-50 text-red-600">
          <h2 className="mb-2 text-xl font-semibold">{error}</h2>
          <p>请检查网络连接或稍后再试。</p>
        </div>
      ) : stockCells.length === 0 ? (
        <div className="rounded-lg border p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">未找到股票数据</h2>
          <p className="text-gray-600">
            请点击下方的"设置股票"按钮进入股票管理页面添加您的股票。
          </p>
        </div>
      ) : (
        <>
          <StockTableView
            stocksData={stocksData}
            codes={stockCells}
            colored={colored}
          />
        </>
      )}
      <div className="flex justify-center sm:justify-start mt-4">
        <a
          href="/stock-manager"
          className="mb-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          设置股票
        </a>
      </div>
    </div>
  );
}
