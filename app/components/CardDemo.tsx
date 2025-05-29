import * as React from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import type { StockData } from "../types/stock";
import { Link } from "react-router-dom";
import { formatVolume } from "./utils";

export function CardWithForm({ ...props }: StockData) {
  return (
    <Card className="w-full [&_a]:text-blue-500">
      <CardHeader>
        <CardTitle>
          <a
            className="hidden sm:block"
            target="_blank"
            href={`https://quote.eastmoney.com/concept/${props.market.toLowerCase()}${
              props.code
            }.html`}
            rel="noreferrer"
          >
            {props.code} {props.name}
          </a>
          <a
            className="block sm:hidden"
            href={`https://wap.eastmoney.com/quote/stock/${
              props.market.toLowerCase() === "sz" ? "0" : "1"
            }.${props.code}.html`}
            target="_blank"
            rel="noreferrer"
          >
            {props.code} {props.name}
          </a>
        </CardTitle>
        <CardDescription>
          <strong>{props.realtime_data?.bankuai}</strong>
        </CardDescription>
        {props.realtime_data?.price_change_rate !== undefined &&
          props.realtime_data.price_change_rate !== null && (
            <CardDescription>
              <strong
                style={{
                  color:
                    props.realtime_data.price_change_rate > 0 ? "red" : "green",
                }}
              >
                涨跌幅 {props.realtime_data.price_change_rate}%
              </strong>
            </CardDescription>
          )}
        <CardDescription>
          换手率 {props.realtime_data?.turnover_rate}%
        </CardDescription>
        <CardDescription>
          流通市值{" "}
          {(
            props.realtime_data?.float_market_capitalization / 100000000
          ).toFixed(2)}
          亿
        </CardDescription>
        <CardDescription>
          成交量 {formatVolume(props.realtime_data?.trading_volume)}
        </CardDescription>
        <CardDescription>
          <span
            style={{
              color: Number(props.day_change) > 0 ? "red" : "green",
            }}
          >
            24小时上升 {props.day_change}
          </span>
        </CardDescription>
        <CardDescription>计算时间 {props.calc_time}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <ol className="list-decimal">
          {props.today_posts.map((post) => {
            return (
              <li
                key={`${post.stockbar_code},${post.post_id}`}
                className="mt-2"
              >
                <a
                  className="flex hidden sm:block"
                  target="_blank"
                  href={`https://guba.eastmoney.com/news,${post.stockbar_code},${post.post_id}.html`}
                  rel="noreferrer"
                >
                  {post.post_title}
                </a>{" "}
                <a
                  className="block sm:hidden"
                  href={`https://mguba.eastmoney.com/mguba/article/0/${post.post_id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {post.post_title}{" "}
                </a>{" "}
              </li>
            );
          })}
        </ol>
      </CardFooter>
    </Card>
  );
}
