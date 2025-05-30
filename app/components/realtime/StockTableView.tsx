import type { StockEntry, StockHqData } from "../../types/real-time";
import { Link } from "react-router-dom";

interface Props {
  stocksData: (StockHqData | null)[];
  codes: StockEntry[];
  colored: boolean;
}

export function StockTableView({ stocksData, codes, colored }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[200px] table-auto">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2 min-w-16">名称代码</th>
            <th className="px-4 py-2">当前价</th>
            <th className="px-4 py-2">涨跌幅</th>
            <th className="px-4 py-2">涨跌额</th>
            <th className="px-4 py-2">今日盈亏</th>
            <th className="px-4 py-2">最高</th>
            <th className="px-4 py-2">最低</th>
            <th className="px-4 py-2">持仓金额</th>
            <th className="px-4 py-2">持仓(手)</th>
            <th className="px-4 py-2">周同比</th>
            <th className="px-4 py-2">月同比</th>
            <th className="px-4 py-2">时间</th>
          </tr>
        </thead>
        <tbody>
          {stocksData.map((stock, index) =>
            stock ? (
              <tr
                key={codes[index].code}
                className={`border-b hover:bg-gray-200 transition-colors duration-100 ${
                  !colored && parseFloat(stock.changePercent) < 0
                    ? "bg-gray-100"
                    : ""
                }`}
              >
                <td className="px-4 py-2">
                  <a
                    className="hidden sm:block"
                    target="_blank"
                    href={stock.url}
                    rel="noreferrer"
                  >
                    <strong>
                      {stock.name} ({stock.market}
                      {stock.code})
                    </strong>
                  </a>
                  <a
                    className="block sm:hidden"
                    href={stock.wapHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <strong>{stock.name}</strong>
                  </a>
                </td>
                <td
                  className={`px-4 py-2 ${
                    colored
                      ? parseFloat(stock.changePercent) >= 0
                        ? "text-red-500"
                        : "text-green-500"
                      : ""
                  }`}
                >
                  <strong>
                    {stock.price === 0 ? "-" : stock.priceFormatted}
                  </strong>
                </td>
                <td
                  className={`px-4 py-2 ${
                    colored
                      ? parseFloat(stock.changePercent) >= 0
                        ? "text-red-500"
                        : "text-green-500"
                      : ""
                  }`}
                >
                  <strong>
                    {stock.price === 0 ? "-" : stock.changePercent}%
                  </strong>
                </td>
                <td
                  className={`px-4 py-2 ${
                    colored
                      ? parseFloat(stock.changePercent) >= 0
                        ? "text-red-500"
                        : "text-green-500"
                      : ""
                  }`}
                >
                  <strong>{stock.price === 0 ? "-" : stock.priceChange}</strong>
                </td>
                <td
                  className={`px-4 py-2 ${
                    colored
                      ? parseFloat(stock.changePercent) >= 0
                        ? "text-red-500"
                        : "text-green-500"
                      : ""
                  }`}
                >
                  <strong>{stock.profit || "-"}</strong>
                </td>
                <td className="px-4 py-2">{stock.high}</td>
                <td className="px-4 py-2">{stock.low}</td>
                <td className="px-4 py-2">{stock.positionValue || "-"}</td>
                <td className="px-4 py-2">{stock.count || "-"}</td>
                <td
                  className={`px-4 py-2 ${
                    colored
                      ? stock.weeklyChange &&
                        parseFloat(stock.weeklyChange) >= 0
                        ? "text-red-500"
                        : "text-green-500"
                      : ""
                  }`}
                >
                  <strong>
                    {stock.weeklyChange ? `${stock.weeklyChange}%` : "-"}
                  </strong>
                </td>
                <td
                  className={`px-4 py-2 ${
                    colored
                      ? stock.monthlyChange &&
                        parseFloat(stock.monthlyChange) >= 0
                        ? "text-red-500"
                        : "text-green-500"
                      : ""
                  }`}
                >
                  <strong>
                    {stock.monthlyChange ? `${stock.monthlyChange}%` : "-"}
                  </strong>
                </td>
                <td className="px-4 py-2">
                  {stock.date} {stock.time}
                </td>
              </tr>
            ) : (
              <tr key={codes[index].code}>
                <td colSpan={12} className="px-4 py-2 text-center">
                  无数据
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
