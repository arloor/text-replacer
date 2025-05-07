import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/text-replacer/index.tsx"), // 将文本替换页面设为首页
  route("templates", "routes/templates/index.tsx"), // 模版管理页面的路由
] satisfies RouteConfig;