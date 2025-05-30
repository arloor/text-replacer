import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"), // 股票面板页面设为首页
  route("login","routes/login.tsx"),
  route("logout","routes/logout.tsx"),
  route("realtime", "routes/realtime.tsx"),
  route("stock-manager", "routes/stock-manager.tsx"), // 股票列表管理页面
  route("data", "routes/data.tsx"), // 数据加载页面
] satisfies RouteConfig;