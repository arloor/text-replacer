import type { StockHqData, StockEntry, HistoryDataCache, RateCache } from "../../types/real-time";
import iconv from "iconv-lite";

// 股票历史数据缓存
const stockHistoryCache: Record<string, HistoryDataCache> = {};

// 汇率缓存数据
let hkdCnyRateCache: RateCache = {
  rate: 0.934, // 默认汇率值
  timestamp: 0, // 上次更新时间
};

export interface stockStats {
    totalProfit: string;
    totalPositionValue: string;
    totalProfitRate: string;
  };

// 计算总体统计数据
export function calculateTotalStats(stocksData: (StockHqData | null)[]): stockStats {
  const totalProfit = stocksData
    .reduce(
      (sum, stock) => sum + (stock?.profit ? parseFloat(stock.profit) : 0),
      0
    )
    .toFixed(1);

  const totalPositionValue = stocksData
    .reduce(
      (sum, stock) =>
        sum + (stock?.positionValue ? parseFloat(stock.positionValue) : 0),
      0
    )
    .toFixed(0);

  const totalProfitRate =
    totalPositionValue !== "0"
      ? (
          (parseFloat(totalProfit) /
            (parseFloat(totalPositionValue) - parseFloat(totalProfit))) *
          100
        ).toFixed(2)
      : "0.00";

  return {
    totalProfit,
    totalPositionValue,
    totalProfitRate,
  };
}

// 获取港币兑人民币汇率
export async function fetchHKDCNYRate(): Promise<number> {
  const now = Date.now();
  const cacheExpiryTime = 5 * 60 * 1000; // 5分钟过期

  // 检查缓存是否在有效期内
  if (now - hkdCnyRateCache.timestamp < cacheExpiryTime) {
    return hkdCnyRateCache.rate;
  }

  try {
    const response = await fetch(`http://hq.sinajs.cn/list=fx_shkdcny`, {
      headers: { Referer: "http://finance.sina.com.cn/" },
    });

    // 获取响应文本
    const text = await response.text();

    // 解析汇率数据
    const regex = /var hq_str_fx_shkdcny="[^,]*,([^,]*),/;
    const matches = text.match(regex);
    if (matches && matches[1]) {
      const rate = parseFloat(matches[1]);
      // 更新缓存
      hkdCnyRateCache = {
        rate: rate,
        timestamp: now,
      };
      console.log("更新汇率数据:", rate);
      return rate;
    } else {
      console.error("无法解析汇率数据:", text);
    }
  } catch (error) {
    console.error("获取汇率失败:", error);
  }

  // 如果获取失败，返回缓存的值（即使已过期）
  return hkdCnyRateCache.rate;
}

// 解析A股数据
export async function parseAStockHQData(
  stockCode: string,
  data: string,
  count?: number
): Promise<StockHqData> {
  const market = stockCode.substring(0, 2); // sz 或 sh
  const code = stockCode.substring(2); // 纯数字代码
  const values = data.split(",");
  const currentPrice = parseFloat(values[3]);
  const yesterdayClose = parseFloat(values[2]);
  const priceChange =
    code.startsWith("5") || code.startsWith("15") || code.startsWith("16") //指数ETF，保留3位
      ? (currentPrice - yesterdayClose).toFixed(3)
      : (currentPrice - yesterdayClose).toFixed(2);
  const changePercent = (
    ((currentPrice - yesterdayClose) / yesterdayClose) *
    100
  ).toFixed(2);

  // 获取历史数据，计算周同比和月同比
  const historyData = await fetchStockHistoryData(`${market}${code}`);
  let weeklyChange = undefined;
  let monthlyChange = undefined;

  if (historyData) {
    weeklyChange = (
      ((currentPrice - historyData.weekPrice) / historyData.weekPrice) *
      100
    ).toFixed(2);
    monthlyChange = (
      ((currentPrice - historyData.monthPrice) / historyData.monthPrice) *
      100
    ).toFixed(2);
  }

  return {
    name: values[0],
    price: currentPrice,
    priceFormatted:
      code.startsWith("5") || code.startsWith("15") || code.startsWith("16") //指数ETF，保留1位
        ? currentPrice.toFixed(3)
        : currentPrice.toFixed(2),
    market, // 市场类型
    code, // 股票代码
    high: values[4],
    low: values[5],
    volume: values[8],
    date: values[30],
    time: values[31],
    priceChange, // 涨跌额
    changePercent, // 涨跌幅
    count, // 持仓数量
    profit:
      count && currentPrice !== 0
        ? code.startsWith("5") || code.startsWith("15") || code.startsWith("16") //指数ETF，保留1位
          ? (parseFloat(priceChange) * count * 100).toFixed(1)
          : (parseFloat(priceChange) * count * 100).toFixed(0)
        : undefined, // 持仓盈亏
    positionValue:
      count && currentPrice
        ? (currentPrice * count * 100).toFixed(2)
        : undefined,
    wapHref: `https://wap.eastmoney.com/quote/stock/${market === "sz" ? "0" : "1"}.${code}.html`,
    url: `https://quote.eastmoney.com/${market}${code}.html`,
    weeklyChange, // 周同比
    monthlyChange, // 月同比
  };
}

// 获取股票历史数据
export async function fetchStockHistoryData(
  stockCode: string
): Promise<{ weekPrice: number; monthPrice: number } | null> {
  // 获取当前日期，格式化为YYYY-MM-DD
  const today = new Date();
  const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // 检查缓存是否为当天数据
  if (
    stockHistoryCache[stockCode] &&
    stockHistoryCache[stockCode].date === todayFormatted
  ) {
    return stockHistoryCache[stockCode].data;
  }

  try {
    // 计算一周前和一个月前的日期
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    // 股票市场和代码
    const market = stockCode.substring(0, 2); // 例如 'sh' 或 'sz'
    const code = stockCode.substring(2); // 数字代码

    // 构建URL - 使用新浪财经历史数据API
    const weekApiUrl = `https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_${market}${code}_7_1645056000000=/CN_MarketDataService.getKLineData?symbol=${market}${code}&scale=240&ma=no&datalen=5`;

    // 获取一周前数据
    const weekResponse = await fetch(weekApiUrl, {
      headers: { Referer: "https://finance.sina.com.cn" },
    });
    const weekData = await weekResponse.text();

    // 解析返回的JSONP数据
    const weekMatch = weekData.match(/\[(.+)\]/);
    let weekPrice = 0;

    if (weekMatch && weekMatch[0]) {
      try {
        const parsedData = JSON.parse(weekMatch[0]);
        if (parsedData.length > 0) {
          // 获取一周前的收盘价
          weekPrice = parseFloat(parsedData[0].close);
        }
      } catch (e) {
        console.error("解析周数据失败:", e);
        throw e;
      }
    }

    // 获取一个月前数据 - 使用相同的API但请求30天数据
    const monthApiUrl = `https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_${market}${code}_30_1645056000000=/CN_MarketDataService.getKLineData?symbol=${market}${code}&scale=240&ma=no&datalen=22`;

    const monthResponse = await fetch(monthApiUrl, {
      headers: { Referer: "https://finance.sina.com.cn" },
    });
    const monthData = await monthResponse.text();

    // 解析返回的JSONP数据
    const monthMatch = monthData.match(/\[(.+)\]/);
    let monthPrice = 0;

    if (monthMatch && monthMatch[0]) {
      try {
        const parsedData = JSON.parse(monthMatch[0]);
        if (parsedData.length > 0) {
          // 获取一个月前的收盘价
          monthPrice = parseFloat(parsedData[0].close);
        }
      } catch (e) {
        console.error("解析月数据失败:", e);
        throw e;
      }
    }

    // 更新缓存，使用日期而不是时间戳
    stockHistoryCache[stockCode] = {
      data: { weekPrice, monthPrice },
      date: todayFormatted,
    };

    return { weekPrice, monthPrice };
  } catch (error) {
    console.error(`获取${stockCode}历史数据失败:`, error);

    // 如果有缓存数据，即使不是当天的也尝试使用
    if (stockHistoryCache[stockCode]?.data) {
      console.warn(
        `使用缓存数据: ${stockCode}，缓存日期: ${stockHistoryCache[stockCode].date}`
      );
      return stockHistoryCache[stockCode].data;
    }

    // 如果没有缓存数据，设置为null并返回
    stockHistoryCache[stockCode] = {
      data: null,
      date: todayFormatted,
    };

    return null;
  }
}

// 获取A股数据
export async function fetchAStocks(
  aCodes: StockEntry[]
): Promise<(StockHqData | null)[]> {
  if (aCodes.length === 0) {
    return [];
  }
  
  const codesStr = aCodes.map((c) => c.code).join(",");
  
  try {
    const response = await fetch(`https://hq.sinajs.cn/list=${codesStr}`, {
      headers: { Referer: "http://finance.sina.com.cn/" },
    });

    // 获取响应的 ArrayBuffer
  const buffer = await response.arrayBuffer();
  // 将 GBK 编码的 buffer 转换为 UTF-8 字符串
  const text = iconv.decode(Buffer.from(buffer), "gbk");

    // 为每个股票代码解析数据
    const stocks: (StockHqData | null)[] = [];

    for (const codeObj of aCodes) {
      const regex = new RegExp(`var hq_str_${codeObj.code}="([^"]+)"`);
      const matches = text.match(regex);

      if (matches) {
        const stockData = await parseAStockHQData(
          codeObj.code,
          matches[1],
          codeObj.count
        );
        stocks.push(stockData);
      } else {
        stocks.push(null);
      }
    }

    return stocks;
  } catch (error) {
    console.error("获取股票数据失败:", error);
    return aCodes.map(_ => null);
  }
}

// 获取港股数据
export async function fetchHKStocks(
  hkCodes: StockEntry[]
): Promise<(StockHqData | null)[]> {
  if (hkCodes.length === 0) {
    return [];
  }
  
  try {
    // 请求https://qt.gtimg.cn/q=?q=r_hk01952&fmt=json，并解析响应
    const codesStr = hkCodes.map((c) => "r_" + c.code).join(",");
    const response = await fetch(`https://qt.gtimg.cn/q=${codesStr}&fmt=json`, {
      headers: { Referer: "http://stockhtm.finance.qq.com" },
    });
    
     // 获取响应的 ArrayBuffer
  const buffer = await response.arrayBuffer();
  // 将 GBK 编码的 buffer 转换为 UTF-8 字符串
  const text = iconv.decode(Buffer.from(buffer), "gbk");
    
    const data = JSON.parse(text);
    
    // 获取港币兑人民币汇率
    const hkdCnyRate = await fetchHKDCNYRate();
    
    // 为每个股票代码解析数据
    return hkCodes.map((codeObj) => {
      const key = `r_${codeObj.code}`;
      const rt = data[key];
      const market = codeObj.code.substring(0, 2); //
      const code = codeObj.code.substring(2); // 纯数字代码
      
      if (rt) {
        const numMeiShou = parseFloat(rt[60]);
        const currentPrice = parseFloat(rt[3]);
        const yesterdayClose = parseFloat(rt[4]);
        const priceChange = (currentPrice - yesterdayClose).toFixed(2);
        const changePercent = (
          ((currentPrice - yesterdayClose) / yesterdayClose) *
          100
        ).toFixed(2);

        // 应用汇率进行计算
        const profitWithRate =
          codeObj.count && currentPrice !== 0
            ? (
                parseFloat(priceChange) *
                codeObj.count *
                numMeiShou *
                hkdCnyRate
              ).toFixed(0)
            : undefined;

        const positionValueWithRate =
          codeObj.count && currentPrice
            ? (currentPrice * codeObj.count * numMeiShou * hkdCnyRate).toFixed(2)
            : undefined;

        return {
          name: rt[1],
          price: currentPrice,
          priceFormatted: currentPrice.toFixed(2),
          market: "hk",
          code,
          high: rt[33],
          low: rt[34],
          volume: rt[36],
          date: rt[30].split(" ")[0],
          time: rt[30].split(" ")[1],
          priceChange,
          changePercent,
          count: codeObj.count,
          profit: profitWithRate,
          positionValue: positionValueWithRate,
          hkdCnyRate: hkdCnyRate.toFixed(4), // 存储当前使用的汇率
          wapHref: `https://wap.eastmoney.com/quote/stock/116.${code}.html`,
          url: `https://quote.eastmoney.com/hk/${code}.html`,
        };
      }
      return null;
    });
  } catch (error) {
    console.error("获取港股数据失败:", error);
    return hkCodes.map(_ => null);
  }
}
