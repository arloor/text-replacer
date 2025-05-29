import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

export function DistinctControl() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isDistinct, setIsDistinct] = useState(true); // 默认为 true

  // 检查URL参数中的distinctCode
  useEffect(() => {
    // 如果参数不存在或值为 true，则设置为 true（默认行为）
    const distinctCode = searchParams.get("distinctCode");
    if (
      distinctCode === undefined ||
      distinctCode === null ||
      distinctCode === "true"
    ) {
      setIsDistinct(true);
    } else {
      setIsDistinct(false);
    }
  }, [searchParams]);

  // 处理开关重复代码
  const toggleDistinct = () => {
    const newValue = !isDistinct;
    setIsDistinct(newValue);

    const newParams = new URLSearchParams(searchParams);
    newParams.set("distinctCode", newValue.toString());

    navigate(`/?${newParams.toString()}`);
  };

  return (
    <button
      onClick={toggleDistinct}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${
        isDistinct ? "bg-blue-100" : "bg-background"
      }`}
    >
      {isDistinct ? "关显示重复" : "去除重复"}
    </button>
  );
}
