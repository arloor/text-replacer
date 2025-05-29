import { useState, useEffect } from "react";
import { data, redirect } from "react-router";
import type { MetaFunction } from "react-router";
import { getSession } from "~/sessions.server";
import type { Route } from "./+types";
import { TopNavigation } from "~/components/TopNavigation";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (!session.has("userId")) {
    return redirect("/login");
  }

  return data({});
}

export const meta: MetaFunction = () => {
  return [
    { title: "实时数据 | 股票监控" },
    { name: "description", content: "实时监控股票数据，获取最新行情变化。" },
  ];
};

export default function RealtimePage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">实时市场数据</h1>
        <TopNavigation />
      </div>

      <div className="rounded-lg border p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">实时数据功能正在开发中</h2>
        <p className="text-gray-600">此功能将在后续版本中推出，敬请期待。</p>
      </div>
    </div>
  );
}
