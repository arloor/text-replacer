import {
  data,
  redirect,
  useLoaderData,
  useSearchParams,
} from "react-router-dom";
import type { MetaFunction } from "react-router";
import { TopNavigation } from "~/components/TopNavigation";
import { StockTableView } from "~/components/realtime/StockTableView";
import { StatsDisplay } from "~/components/realtime/StatsDisplay";
import type { Route } from "./+types";
import { getSession } from "~/functions/sessions.server";
import { useCallback, useEffect, useState } from "react";
import { loadData, type UserStockData } from "~/functions/loader.server";

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
  const userId = session.get("userId");
  const userStockData = await loadData(userId);
  return data({ ...userStockData, userId: userId });
}

// 创建接收UserStockData参数的组件
export interface RealtimeProps {
  data: UserStockData;
  colored?: boolean;
  error?: string;
}

export function RealtimeComponent({
  data,
  colored = true,
  error = "",
}: RealtimeProps) {
  const { userId, stockCells, allStocksData, statsData } = data;
  console.log("User ID:", userId);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-end items-center mt-4 mb-4 gap-4 sm:gap-2">
        <div className="flex flex-row jutify-start items-center gap-2">
          <TopNavigation />
        </div>
        <div className="flex flex-row justify-end items-center gap-2 sm:mr-auto">
          <StatsDisplay stats={statsData} colored={colored} />
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
            stocksData={allStocksData}
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

// 客户端渲染的主组件
export default function RealtimePage() {
  const loadData: UserStockData = useLoaderData();
  console.log("Loader Data:", loadData);
  const [userStockData, setUserStockData] = useState(loadData); // 确保数据在组件中可用

  // 自动刷新逻辑
  useEffect(() => {
    let intervalId: number | undefined;

    intervalId = window.setInterval(() => {
      fetchData();
    }, 3000); // 30秒刷新一次

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // 获取数据的函数
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/data");
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const newData: UserStockData = await response.json();
      console.log("Fetched new data:", newData);

      // 更新状态
      setUserStockData(newData);
    } catch (err) {
      console.error("获取数据失败:", err);
    } finally {
    }
  }, []);

  const [searchParams] = useSearchParams();
  const colored = searchParams.get("colored") !== "false"; // 默认为true

  // 使用新的RealtimeComponent组件
  return <RealtimeComponent data={userStockData} colored={colored} />;
}
