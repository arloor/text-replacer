import { Link, useSearchParams } from "react-router-dom";
import type { MetaFunction } from "react-router";
import type { DateRange } from "react-day-picker";
import { Label } from "../components/ui/label";
import { DatePickerDemo } from "../components/DatePicker";
import { Panel } from "../components/Panel";
import { TopNavigation } from "../components/TopNavigation";
import { TableViewControl } from "../components/TableViewControl";
import { AutoRefreshControl } from "../components/AutoRefreshControl";
import { DistinctControl } from "../components/DistinctControl";

export const meta: MetaFunction = () => {
  return [
    { title: "文本替换工具 | 在线文本处理" },
    {
      name: "description",
      content:
        "在线文本替换工具，快速查找和替换文本内容，支持保存常用替换模版。",
    },
    {
      name: "keywords",
      content: "文本替换,查找替换,文本处理,在线工具,替换模版",
    },
    { name: "author", content: "文本替换工具" },
    { property: "og:title", content: "文本替换工具 | 在线文本处理" },
    {
      property: "og:description",
      content:
        "在线文本替换工具，快速查找和替换文本内容，支持保存常用替换模版。",
    },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "文本替换工具 | 在线文本处理" },
    {
      name: "twitter:description",
      content:
        "在线文本替换工具，快速查找和替换文本内容，支持保存常用替换模版。",
    },
  ];
};

// 股票面板页面
export default function StockPanel() {
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const view = searchParams.get("view") || "table"; // 默认使用表格视图

  // 获取今天的开始时间
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 显式转换为bool类型
  let distinctCode = true;
  if (searchParams.get("distinctCode") === "false") {
    distinctCode = false;
  }

  const dateRange: DateRange = {
    from: from ? new Date(from) : todayStart,
    to: to ? new Date(to) : from ? new Date(from) : todayStart,
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 mt-4 flex flex-col items-center justify-end gap-4 sm:flex-row sm:gap-2">
        <div className="jutify-start flex flex-row items-center gap-2 sm:mr-auto">
          <TopNavigation />
        </div>
        <div className="flex flex-row items-center justify-end gap-2">
          <Label className="ml-2">选择日期：</Label>
          <DatePickerDemo className="w-auto" />
        </div>
        <div className="flex flex-row items-center justify-end gap-2">
          <DistinctControl />
        </div>
      </div>
      {dateRange?.from ? (
        <div>
          <Panel dateRange={dateRange} distinctCode={distinctCode} />
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">请选择日期</p>
      )}
    </div>
  );
}
