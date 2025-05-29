import type { ApiResponse, StockData } from "../types/stock";
import { CardWithForm } from "./CardDemo";
import type { DateRange } from "react-day-picker";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { TableView } from "./TableView";
import { useState, useEffect } from "react";

interface PanelProps {
  dateRange: DateRange;
  distinctCode: boolean;
  view?: string;
}

export function Panel({ dateRange, distinctCode, view = "card" }: PanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StockData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (dateRange.from && dateRange.to) {
        try {
          setLoading(true);
          setError(null);

          const end = new Date(dateRange.to);
          end.setHours(23, 59, 59);

          const req_start = formatDateTime(dateRange.from);
          const req_end = formatDateTime(end);
          const req_body = {
            startTime: req_start,
            endTime: req_end,
            distinctCode,
          };
          const body = JSON.stringify(req_body);
          console.log(
            `curl http://tt.arloor.com:5000/data -H "content-type: application/json" -d '${body}'`
          );

          const response = await fetch("http://tt.arloor.com:5000/data", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: body,
          });

          const res: ApiResponse = await response.json();

          if (res.code !== 200) {
            setError(res.message || "获取数据失败");
          } else {
            console.log("posts size:", res.data.length);
            setData(res.data);
          }
        } catch (err) {
          setError("获取数据失败，请稍后再试");
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [dateRange, distinctCode]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "calc(10px + 1vmin)",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          zIndex: 1000,
        }}
      >
        <h1 className="in">数据加载中...请稍等</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "calc(10px + 1vmin)",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          zIndex: 1000,
        }}
      >
        <h1 className="in">{error}</h1>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "calc(10px + 1vmin)",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          zIndex: -1000,
        }}
      >
        <h1 className="in">没有数据</h1>
      </div>
    );
  }

  return (
    <>
      {view === "table" ? (
        <TableView data={data} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 width-full">
          {data.map((stockData) => {
            return (
              <CardWithForm
                key={`${stockData.code}_${stockData.calc_time}`}
                {...stockData}
              />
            );
          })}
        </div>
      )}
      <ScrollToTopButton />
    </>
  );
}

function formatDateTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
