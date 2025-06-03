import { data, redirect, useLoaderData, useLocation } from "react-router-dom";
import type { MetaFunction } from "react-router";
import { useState, useEffect } from "react";
import type { StockEntry, StockHqData } from "../types/real-time";
import { TopNavigation } from "~/components/TopNavigation";
import type { Route } from "./+types";
import { getSession } from "~/functions/sessions.server";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export const meta: MetaFunction = () => {
  return [
    { title: "股票列表管理 | 股票监控" },
    {
      name: "description",
      content: "管理您的股票列表，添加、编辑、删除和排序股票。",
    },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (!session.has("userId")) {
    return redirect("/login");
  }
  try {
    const response = await fetch(
      "https://tt.arloor.com:5000/user-stocks/" + session.get("userId"),
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("无法加载股票列表");
    }

    const stockCells: StockEntry[] = await response.json();

    return data({
      error: session.get("error"),
      userId: session.get("userId"),
      stockCells,
    });
  } catch (err) {
    console.error("加载股票列表失败:", err);
    return data({
      error: err,
    });
  }
}

// 客户端渲染的主组件
export default function StockManagerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loaderData = useLoaderData();
  const userId = loaderData.userId || "";
  const error = loaderData.error || "";
  loaderData.error && console.error("Error:", loaderData.error);
  const stockCells: StockEntry[] = loaderData.stockCells || [];

  const [entries, setEntries] = useState<StockEntry[]>(stockCells);
  const [newCode, setNewCode] = useState("");
  const [newCount, setNewCount] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editCount, setEditCount] = useState("");
  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // 存储从realtime页面传递过来的股票详细信息
  const [stockDetailsMap, setStockDetailsMap] = useState<
    Record<string, StockHqData>
  >({});

  useEffect(() => {
    // 从location.state中获取股票数据
    if (location.state && location.state.stockData) {
      const stockData = location.state.stockData as StockHqData[];
      // 将股票数据转换为以code为键的对象
      const stockMap: Record<string, StockHqData> = {};
      stockData.forEach((stock) => {
        if (stock && stock.code) {
          stockMap[`${stock.market}${stock.code}`.toLowerCase()] = stock;
        }
      });
      setStockDetailsMap(stockMap);
    }
  }, [location.state]);

  // 计算持仓金额的函数
  const calculatePositionValue = (code: string, count?: number): string => {
    if (!count) return "-";
    const stockDetails = stockDetailsMap[code.toLowerCase()];
    if (!stockDetails || stockDetails.price === 0) return "-";

    // 如果持仓数量没变且已有计算好的持仓金额，直接使用
    if (stockDetails.positionValue && count === stockDetails.count) {
      return stockDetails.positionValue;
    }

    // 获取每手股数，默认为100股/手
    const lotSize = stockDetails.lotSize || 100;

    // 计算持仓金额，港股需要乘以汇率
    const isHkStock = code.toLowerCase().startsWith("hk");
    const exchangeRate =
      isHkStock && stockDetails.hkdCnyRate
        ? parseFloat(stockDetails.hkdCnyRate)
        : isHkStock
        ? 0.934
        : 1; // 港股使用汇率，A股汇率为1

    return (stockDetails.price * count * lotSize * exchangeRate).toFixed(2);
  };

  // 显示临时提示的函数
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });

    // 2.5秒后自动清除提示
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // 保存更改
  const handleSave = async () => {
    try {
      // 发送数据到服务器
      const response = await fetch("https://tt.arloor.com:5000/save-stocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userId, stocks: entries }),
      });

      if (!response.ok) {
        let errorText = await response.text();
        throw new Error(`保存失败: ${errorText}`);
      }

      showToast("保存成功", "success");

      // 刷新页面来获取最新数据
      //   navigate(0);
    } catch (error) {
      console.error("Failed to save stock:", error);
      showToast(
        `保存失败: ${error instanceof Error ? error.message : String(error)}`,
        "error"
      );
    }
  };

  // 检查股票代码是否重复
  const isDuplicateCode = (code: string) => {
    return entries.some(
      (entry) => entry.code.toLowerCase() === code.toLowerCase()
    );
  };

  // 添加新股票
  const handleAdd = () => {
    if (!newCode) return;

    const normalizedCode = newCode.toLowerCase();
    if (isDuplicateCode(normalizedCode)) {
      showToast("该股票代码已存在！", "error");
      return;
    }

    // 添加新股票
    const newEntry = {
      code: normalizedCode,
      count: newCount ? parseInt(newCount) : undefined,
    };

    setEntries([...entries, newEntry]);

    // 如果这个股票代码在stockDetailsMap中不存在，可以尝试从API获取数据
    // 这里简化处理，实际项目中可能需要异步请求股票数据

    setNewCode("");
    setNewCount("");
  };

  // 删除股票
  const handleDelete = (index: number) => {
    if (window.confirm("确定要删除这个股票吗？")) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  // 开始编辑
  const handleStartEdit = (index: number, count?: number) => {
    setEditIndex(index);
    setEditCount(count?.toString() || "");
  };

  // 保存编辑
  const handleSaveEdit = (index: number) => {
    const newEntries = [...entries];
    const newCount = editCount ? parseInt(editCount) : undefined;

    newEntries[index] = {
      ...newEntries[index],
      count: newCount,
    };

    setEntries(newEntries);
    setEditIndex(null);

    // 当持仓数量变化时，持仓金额会通过calculatePositionValue自动更新
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditCount("");
  };

  // 上移股票
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newEntries = [...entries];
    [newEntries[index - 1], newEntries[index]] = [
      newEntries[index],
      newEntries[index - 1],
    ];
    setEntries(newEntries);
  };

  // 下移股票
  const handleMoveDown = (index: number) => {
    if (index === entries.length - 1) return;
    const newEntries = [...entries];
    [newEntries[index], newEntries[index + 1]] = [
      newEntries[index + 1],
      newEntries[index],
    ];
    setEntries(newEntries);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 mb-6 gap-4">
        <h1 className="text-2xl font-bold">股票列表管理</h1>
        <TopNavigation />
      </div>

      {/* 错误信息显示区域 */}
      {error && (
        <div className="rounded-lg border p-6 shadow-sm bg-red-50 text-red-600 mb-4">
          <h2 className="mb-2 text-xl font-semibold">{error}</h2>
          <p>请检查网络连接或稍后再试。</p>
        </div>
      )}

      {/* 股票管理区域 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">股票列表管理说明</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>您可以添加、删除、编辑和排序您的股票列表</li>
            <li>支持A股（sh/sz/bj）和港股（hk）股票代码</li>
            <li>可以设置持仓数量（单位：手）以计算收益</li>
            <li>股票会根据实际每手股数计算，默认为100股/手</li>
            <li>港股持仓金额会考虑人民币与港币汇率换算</li>
            <li>修改后请点击"保存更改"按钮使修改生效</li>
          </ul>
        </div>

        <div className="mb-4">
          <h3 className="font-bold mb-4 text-gray-900 text-lg">
            当前股票列表：
          </h3>
          <div className="overflow-x-auto max-w-full rounded-md border border-gray-200">
            {entries.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                暂无股票数据，请添加股票
              </p>
            )}
            {entries.length > 0 && (
              <table className="min-w-full border-collapse table-auto">
                <thead>
                  <tr className="text-left text-sm text-gray-500 bg-gray-50">
                    <th className="py-3 px-2 w-[60px] border-b"></th>
                    <th className="py-3 px-2 border-b">股票代码/名称</th>
                    <th className="py-3 px-2 whitespace-nowrap border-b">
                      持仓数量
                    </th>
                    <th className="py-3 px-2 whitespace-nowrap border-b">
                      持仓金额 (元)
                    </th>
                    <th className="py-3 px-2 whitespace-nowrap border-b">
                      每手股数
                    </th>
                    <th className="py-3 px-2 min-w-[140px] border-b">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      {/* 移动按钮列 */}
                      <td className="py-3 px-2">
                        <div className="flex gap-1">
                          {index > 0 && (
                            <button
                              onClick={() => handleMoveUp(index)}
                              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                              title="上移"
                            >
                              <ChevronUpIcon className="w-5 h-5" />
                            </button>
                          )}
                          {index < entries.length - 1 && (
                            <button
                              onClick={() => handleMoveDown(index)}
                              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                              title="下移"
                            >
                              <ChevronDownIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 股票代码与名称列 */}
                      <td className="py-3 px-2">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-gray-900 font-medium whitespace-nowrap">
                            {entry.code}
                          </span>
                          {stockDetailsMap[entry.code.toLowerCase()] && (
                            <span className="text-gray-500 break-all">
                              ({stockDetailsMap[entry.code.toLowerCase()].name})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 持仓数量列 */}
                      <td className="py-3 px-2 whitespace-nowrap">
                        {editIndex === index ? (
                          <input
                            type="number"
                            value={editCount}
                            onChange={(e) => setEditCount(e.target.value)}
                            className="w-24 px-2 py-1 border rounded text-gray-900"
                            min="0"
                            placeholder="持仓数量"
                          />
                        ) : (
                          <span className="text-gray-600">
                            ({entry.count || 0}手)
                          </span>
                        )}
                      </td>

                      {/* 持仓金额列 */}
                      <td className="py-3 px-2 whitespace-nowrap">
                        <span className="text-gray-600">
                          {editIndex === index
                            ? calculatePositionValue(
                                entry.code,
                                editCount ? parseInt(editCount) : undefined
                              )
                            : calculatePositionValue(entry.code, entry.count)}
                        </span>
                      </td>

                      {/* 每手股数列 */}
                      <td className="py-3 px-2 whitespace-nowrap">
                        <span className="text-gray-500">
                          {stockDetailsMap[entry.code.toLowerCase()]?.lotSize
                            ? `${
                                stockDetailsMap[entry.code.toLowerCase()]
                                  .lotSize
                              }股/手`
                            : "100股/手"}
                        </span>
                      </td>

                      {/* 操作按钮列 */}
                      <td className="py-3 px-2">
                        <div className="flex flex-wrap gap-2">
                          {editIndex === index ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(index)}
                                className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded"
                              >
                                保存
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded"
                              >
                                取消
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  handleStartEdit(index, entry.count)
                                }
                                className="px-3 py-1 text-sm border border-gray-300 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 hover:border-gray-400"
                              >
                                编辑
                              </button>
                              <button
                                onClick={() => handleDelete(index)}
                                className="px-3 py-1 text-sm border border-red-200 bg-red-50 text-red-500 rounded hover:bg-red-100 hover:border-red-300"
                              >
                                删除
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <h3 className="font-bold mb-3 text-gray-900">添加新股票：</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label
                htmlFor="stockCode"
                className="block text-sm text-gray-600 mb-1"
              >
                股票代码
              </label>
              <input
                id="stockCode"
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="代码(sz000001)"
                className="px-3 py-2 border rounded text-gray-900 w-full sm:w-48"
              />
            </div>
            <div>
              <label
                htmlFor="stockCount"
                className="block text-sm text-gray-600 mb-1"
              >
                持仓数量(手)
              </label>
              <input
                id="stockCount"
                type="number"
                value={newCount}
                onChange={(e) => setNewCount(e.target.value)}
                placeholder="持仓数量"
                className="px-3 py-2 border rounded w-full sm:w-40 text-gray-900"
                min="0"
              />
            </div>
            <div>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                添加股票
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-start gap-3 mt-8 pt-4 border-t">
          <a
            href="/realtime"
            className="px-5 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            返回实时数据
          </a>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            保存更改
          </button>
        </div>
      </div>

      {/* Toast提示消息 */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow text-white ${
            toast.type === "success" && "bg-green-500"
          } ${toast.type === "error" && "bg-red-500"}`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
