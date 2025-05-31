import { calculateTotalStats, fetchAStocks, fetchHKStocks, type stockStats } from "~/components/realtime/stockUtils";
import type { StockEntry, StockHqData } from "~/types/real-time";

export interface UserStockData {
  userId: string;
  stockCells: StockEntry[];
  allStocksData: (StockHqData | null)[];
  statsData: stockStats;
}

export async function loadData(userId: string | undefined): Promise<UserStockData> {
  console.log("Loader called with userId:", userId);
  if (!userId) {
    throw new Error("用户未登录或用户ID无效");
  }
  try {
    const response = await fetch(
      "https://tt.arloor.com:5000/user-stocks/" + userId,
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
    return {
        userId,
      stockCells,
      allStocksData,
      statsData,
    };
  } catch (err) {
    throw new Error(
      "数据加载失败: " + (err instanceof Error ? err.message : "未知错误")
    );
  }
}