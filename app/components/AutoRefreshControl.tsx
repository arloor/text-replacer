import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

export function AutoRefreshControl() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);

  // 检查URL参数中的autoRefresh
  useEffect(() => {
    const autoRefresh = searchParams.get("autoRefresh") === "true";
    setIsAutoRefresh(autoRefresh);
  }, [searchParams]);

  // 处理开关自动刷新
  const toggleAutoRefresh = () => {
    const newValue = !isAutoRefresh;
    setIsAutoRefresh(newValue);

    const newParams = new URLSearchParams(searchParams);
    if (newValue) {
      newParams.set("autoRefresh", "true");
    } else {
      newParams.delete("autoRefresh");
    }

    // 获取当前路径，确保在相同路径上添加参数
    const currentPath = window.location.pathname;
    navigate(`${currentPath}?${newParams.toString()}`);
  };

  // 自动刷新逻辑
  useEffect(() => {
    let intervalId: number | undefined;

    if (isAutoRefresh) {
      intervalId = window.setInterval(() => {
        window.location.reload();
      }, 30000); // 30秒刷新一次
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoRefresh]);

  return (
    <button
      onClick={toggleAutoRefresh}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${
        isAutoRefresh ? "bg-blue-100" : "bg-background"
      }`}
    >
      {isAutoRefresh ? "关闭自动刷新" : "自动刷新"}
    </button>
  );
}
