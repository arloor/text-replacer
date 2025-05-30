import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router-dom";
import {
  calculateTotalStats,
  fetchAStocks,
  fetchHKStocks,
} from "~/components/realtime/stockUtils";
import { getSession } from "~/sessions.server";
import type { StockEntry } from "~/types/real-time";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("userId")) {
    return redirect("/login");
  }
  const userId = session.get("userId");
  return loadData(userId);
};

async function loadData(userId: string | undefined) {
  console.log("Loader called with userId:", userId);
  if (!userId) {
    return Response.json({
      msg: "用户未登录",
      code: 401,
    });
  }
  try {
    const response = await fetch(
      "http://tt.arloor.com:5000/user-stocks/" + userId,
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
    return Response.json({
      code: 200,
      data: {
        userId: userId,
        stockCells,
        allStocksData,
        statsData,
      },
      msg: "",
    });
  } catch (err) {
    console.error("加载股票列表失败:", err);
    return Response.json({
      msg: err,
      code: 500,
    });
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("userId")) {
    return redirect("/login");
  }
  const userId = session.get("userId");
  return loadData(userId);
};
