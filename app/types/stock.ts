export interface RealtimeData {
  price: number;
  highest: number;
  lowest: number;
  opening: number;
  trading_volume: number;
  yesterday_close: number;
  unix_timestamp_sec: number;
  data_time: string;
  total_market_capitalization: number;
  float_market_capitalization: number;
  bankuai: string;
  region: string;
  pe_ratio: number;
  pb_ratio: number;
  turnover_rate: number;
  price_change: number;
  price_change_rate: number;
}

export interface Post {
  post_id: number;
  post_title: string;
  stockbar_code: string;
  user_nickname: string;
  post_click_count: number;
  post_forward_count: number;
  post_comment_count: number;
  post_publish_time: string;
  post_last_time: string;
  post_type: number;
  notice_type: null | string;
  post_display_time: string;
}

export interface StockData {
  market: string;
  code: string;
  name: string;
  calc_time: string;
  current_rank: number;
  ten_minute_change: number;
  thirty_minute_change: number;
  hour_change: number;
  day_change: number;
  realtime_data: RealtimeData;
  today_posts: Post[];
  today_posts_fetch_err: null | string;
}

export interface ApiResponse {
  code: number;
  message: string;
  data: StockData[];
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
}
