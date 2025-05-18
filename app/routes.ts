import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"), // 将文本替换页面设为首页
  route("login","routes/login.tsx"),
  route("logout","routes/logout.tsx"),
] satisfies RouteConfig;