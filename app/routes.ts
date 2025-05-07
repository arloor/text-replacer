import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("text-replacer", "routes/text-replacer/index.tsx"),
  route("templates", "routes/templates/index.tsx"), // 添加模版管理页面的路由
] satisfies RouteConfig;