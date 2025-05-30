import { Form, Link, redirect } from "react-router-dom";
import { getSession, destroySession } from "../functions/sessions.server";
import type { Route } from "./+types/logout";

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export function LogoutLink() {
  return (
    <Link
      to="/logout"
      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors duration-200 flex items-center shadow-sm border border-gray-200 dark:border-gray-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 mr-0 md:mr-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      <span className="hidden sm:hidden md:inline">退出</span>
    </Link>
  );
}

export function LogoutButton() {
  return (
    <Form method="post" action="/logout">
      <button
        type="submit"
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors duration-200 flex items-center shadow-sm border border-gray-200 dark:border-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-0 md:mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span className="hidden sm:hidden md:inline">退出</span>
      </button>
    </Form>
  );
}

export default function LogoutRoute() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          确认退出
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          您确定要退出登录吗？
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Form method="post">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              确认退出
            </button>
          </Form>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            取消
          </Link>
        </div>
      </div>
    </div>
  );
}
