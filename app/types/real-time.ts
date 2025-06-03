export interface StockEntry {
  code: string;
  count?: number;
}

export interface StockHqData {
  name: string;
  price: number;
  priceFormatted: string;
  market: string;
  code: string;
  priceChange: string;
  changePercent: string;
  volume: string;
  high: string;
  low: string;
  date: string;
  time: string;
  count?: number;
  profit?: string;
  positionValue?: string;
  wapHref: string;
  url: string;
  weeklyChange?: string; // 周同比涨幅
  monthlyChange?: string; // 月同比涨幅
  hkdCnyRate?: string; // 港币兑人民币汇率
  lotSize?: number; // 每手股数
}

// 股票历史数据缓存
export interface HistoryDataCache {
  data: {
    weekPrice: number; // 一周前价格
    monthPrice: number; // 一个月前价格
  } | null;
  date: string; // 缓存日期，格式为YYYY-MM-DD
}

// 汇率缓存数据
export interface RateCache {
  rate: number;
  timestamp: number;
}
