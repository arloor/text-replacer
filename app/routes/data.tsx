import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router-dom";
import { type stockStats } from "~/components/realtime/stockUtils";
import { loadData } from "~/functions/loader.server";
import { getSession } from "~/functions/sessions.server";
import type { StockEntry, StockHqData } from "~/types/real-time";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("userId")) {
    return redirect("/login");
  }
  const userId = session.get("userId");
  return loadData(userId);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("userId")) {
    return redirect("/login");
  }
  const userId = session.get("userId");
  return loadData(userId);
};
