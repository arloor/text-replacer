import type { StockHqData } from "../../types/real-time";
import { Link } from "react-router-dom";

export function StockCardView({
  stocksData,
  colored,
}: {
  stocksData: (StockHqData | null)[];
  colored: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 width-full">
      {stocksData.map((stock, index) => (
        <div key={index} className="p-4 border rounded-lg">
          {stock ? (
            <>
              <div className="font-bold [&_a]:text-link">
                <a
                  className="hidden sm:block"
                  target="_blank"
                  href={stock.url}
                  rel="noreferrer"
                >
                  {stock.name} ({stock.market}
                  {stock.code})
                </a>
                <a
                  className="block sm:hidden"
                  href={stock.wapHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  {stock.name} ({stock.market}
                  {stock.code})
                </a>
              </div>
              <div
                className={
                  !colored && parseFloat(stock.changePercent) < 0
                    ? "text-gray-500"
                    : colored
                    ? parseFloat(stock.changePercent) >= 0
                      ? "text-red-500"
                      : "text-green-500"
                    : ""
                }
              >
                <strong>
                  当前价: {stock.price === 0 ? "-" : stock.priceFormatted}
                </strong>
              </div>
              <div
                className={
                  !colored && parseFloat(stock.changePercent) < 0
                    ? "text-gray-500"
                    : colored
                    ? parseFloat(stock.changePercent) >= 0
                      ? "text-red-500"
                      : "text-green-500"
                    : ""
                }
              >
                <strong>
                  涨跌幅: {stock.price === 0 ? "-" : stock.changePercent}%
                </strong>
              </div>
              <div
                className={
                  !colored && parseFloat(stock.changePercent) < 0
                    ? "text-gray-500"
                    : colored
                    ? parseFloat(stock.changePercent) >= 0
                      ? "text-red-500"
                      : "text-green-500"
                    : ""
                }
              >
                <strong>
                  涨跌额度: {stock.price === 0 ? "-" : stock.priceChange}
                </strong>
              </div>

              <div
                className={
                  !colored && parseFloat(stock.weeklyChange || "0") < 0
                    ? "text-gray-500"
                    : colored
                    ? stock.weeklyChange && parseFloat(stock.weeklyChange) >= 0
                      ? "text-red-500"
                      : "text-green-500"
                    : ""
                }
              >
                <strong>
                  周同比: {stock.weeklyChange ? `${stock.weeklyChange}%` : "-"}
                </strong>
              </div>

              <div
                className={
                  !colored && parseFloat(stock.monthlyChange || "0") < 0
                    ? "text-gray-500"
                    : colored
                    ? stock.monthlyChange &&
                      parseFloat(stock.monthlyChange) >= 0
                      ? "text-red-500"
                      : "text-green-500"
                    : ""
                }
              >
                <strong>
                  月同比:{" "}
                  {stock.monthlyChange ? `${stock.monthlyChange}%` : "-"}
                </strong>
              </div>

              {stock.count && (
                <>
                  <div>
                    <strong>持仓金额: {stock.positionValue || "-"}</strong>
                  </div>
                  <div>
                    <strong>持仓: {stock.count}手</strong>
                  </div>
                  <div
                    className={
                      !colored && parseFloat(stock.changePercent) < 0
                        ? "text-gray-500"
                        : colored
                        ? parseFloat(stock.changePercent) >= 0
                          ? "text-red-500"
                          : "text-green-500"
                        : ""
                    }
                  >
                    <strong>持仓盈亏: {stock.profit}</strong>
                  </div>
                  <div>最高: {stock.high}</div>
                  <div>最低: {stock.low}</div>
                </>
              )}
              <div>
                {stock.date} {stock.time}
              </div>
            </>
          ) : (
            <div>无数据</div>
          )}
        </div>
      ))}
    </div>
  );
}
