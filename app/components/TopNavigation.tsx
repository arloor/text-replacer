import * as React from "react";
import { Link } from "react-router-dom";

export function TopNavigation() {
  return (
    <nav className="flex space-x-4">
      <Link
        to="/"
        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        首页
      </Link>
      <Link
        to="/realtime"
        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        实时数据
      </Link>
    </nav>
  );
}
