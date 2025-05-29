import type { StockData } from "../types/stock";
import { Link } from "react-router-dom";
import { formatVolume } from "./utils";

interface TableViewProps {
  data: StockData[];
}

export function TableView({ data }: TableViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[200px] table-auto">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2">股票</th>
            <th className="px-4 py-2">板块</th>
            <th className="px-4 py-2 text-right">涨跌幅</th>
            <th className="px-4 py-2 text-right">换手率</th>
            <th className="px-4 py-2 text-right">流通市值</th>
            <th className="px-4 py-2 text-right">成交量</th>
            <th className="px-4 py-2 text-right">24小时变化</th>
            <th className="px-4 py-2">相关帖子</th>
            <th className="px-4 py-2">计算时间</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-2 font-bold">
                <a
                  className="hidden sm:block"
                  target="_blank"
                  href={`https://quote.eastmoney.com/concept/${item.market.toLowerCase()}${
                    item.code
                  }.html`}
                  rel="noreferrer"
                >
                  {item.code} {item.name}
                </a>
                <a
                  className="block sm:hidden"
                  href={`https://wap.eastmoney.com/quote/stock/${
                    item.market.toLowerCase() === "sz" ? "0" : "1"
                  }.${item.code}.html`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.code} {item.name}
                </a>
              </td>
              <td className="px-4 py-2 bg-gray-100">
                {item.realtime_data?.bankuai}
              </td>
              <td className="px-4 py-2 text-right">
                <span
                  style={{
                    color:
                      item.realtime_data?.price_change_rate > 0
                        ? "red"
                        : "green",
                  }}
                >
                  {item.realtime_data?.price_change_rate}%
                </span>
              </td>
              <td className="px-4 py-2 text-right">
                {item.realtime_data?.turnover_rate}%
              </td>
              <td className="px-4 py-2 text-right bg-gray-100">
                {(
                  item.realtime_data?.float_market_capitalization / 100000000
                ).toFixed(2)}
                亿
              </td>
              <td className="px-4 py-2 text-right">
                {formatVolume(item.realtime_data?.trading_volume)}
              </td>
              <td className="px-4 py-2 bg-gray-100 text-right">
                <span
                  style={{
                    color: Number(item.day_change) > 0 ? "red" : "green",
                  }}
                >
                  {item.day_change}
                </span>
              </td>
              <td className="px-4 py-2">
                <ol className="list-decimal [&_a]:text-link">
                  {item.today_posts.map((post) => (
                    <li
                      className="ml-3"
                      key={`${post.stockbar_code},${post.post_id}`}
                    >
                      <a
                        className="hidden sm:block"
                        target="_blank"
                        href={`https://guba.eastmoney.com/news,${post.stockbar_code},${post.post_id}.html`}
                        rel="noreferrer"
                      >
                        {post.post_title}
                      </a>
                      <a
                        className="block sm:hidden"
                        href={`https://mguba.eastmoney.com/mguba/article/0/${post.post_id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {post.post_title}
                      </a>
                    </li>
                  ))}
                </ol>
              </td>
              <td className="px-4 py-2">{item.calc_time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
