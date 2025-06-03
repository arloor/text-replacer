import { data, redirect, useLoaderData } from "react-router-dom";
import type { MetaFunction } from "react-router";
import { useState } from "react";
import type { StockEntry } from "../types/real-time";
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

    setEntries([
      ...entries,
      {
        code: normalizedCode,
        count: newCount ? parseInt(newCount) : undefined,
      },
    ]);
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
    newEntries[index] = {
      ...newEntries[index],
      count: editCount ? parseInt(editCount) : undefined,
    };
    setEntries(newEntries);
    setEditIndex(null);
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
            <li>修改后请点击"保存更改"按钮使修改生效</li>
          </ul>
        </div>

        <div className="mb-4">
          <h3 className="font-bold mb-4 text-gray-900 text-lg">
            当前股票列表：
          </h3>
          {entries.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              暂无股票数据，请添加股票
            </p>
          )}
          {entries.length > 0 &&
            entries.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 mb-3 py-2">
                {/* 移动按钮列 */}
                <div className="flex gap-1 w-16">
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

                {/* 股票代码列 */}
                <div className="w-28">
                  <span className="text-gray-900">{entry.code}</span>
                </div>

                {/* 持仓数量列 */}
                <div className="w-24">
                  {editIndex === index ? (
                    <input
                      type="number"
                      value={editCount}
                      onChange={(e) => setEditCount(e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900"
                      min="0"
                      placeholder="持仓数量"
                    />
                  ) : (
                    <span className="text-gray-600">
                      ({entry.count || 0}手)
                    </span>
                  )}
                </div>

                {/* 操作按钮列 */}
                <div className="flex gap-2">
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
                        onClick={() => handleStartEdit(index, entry.count)}
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
              </div>
            ))}
        </div>

        <div className="flex gap-2 mb-6 border-t pt-4">
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="代码(sz000001)"
            className="px-2 py-1 border rounded text-gray-900 w-36"
          />
          <input
            type="number"
            value={newCount}
            onChange={(e) => setNewCount(e.target.value)}
            placeholder="持仓数量(手)"
            className="px-2 py-1 border rounded w-32 text-gray-900"
            min="0"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-1 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            添加
          </button>
        </div>

        <div className="flex justify-start gap-2 mt-8">
          <a
            href="/realtime"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            返回实时数据
          </a>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
