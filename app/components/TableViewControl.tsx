import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

type ViewType = "table" | "card";

export function TableViewControl() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<ViewType>("table"); // 默认为表格视图

  // 检查URL参数中的view
  useEffect(() => {
    const view = searchParams.get("view") as ViewType;
    if (view === "card" || view === "table") {
      setViewType(view);
    } else {
      setViewType("table"); // 默认视图
    }
  }, [searchParams]);

  // 切换视图类型
  const toggleViewType = () => {
    const newViewType = viewType === "table" ? "card" : "table";
    setViewType(newViewType);

    const newParams = new URLSearchParams(searchParams);
    newParams.set("view", newViewType);

    // 获取当前路径，确保在相同路径上添加参数
    const currentPath = window.location.pathname;
    navigate(`${currentPath}?${newParams.toString()}`);
  };

  return (
    <button
      onClick={toggleViewType}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${
        viewType === "table" ? "bg-blue-100" : "bg-background"
      }`}
    >
      {viewType === "table" ? "卡片视图" : "表格视图"}
    </button>
  );
}
