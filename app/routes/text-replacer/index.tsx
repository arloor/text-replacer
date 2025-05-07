import { useState, useCallback, useEffect } from "react"; // Added useEffect
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { MetaFunction } from "react-router";

interface Template {
  id: string;
  name: string;
  searchText: string;
  replaceText: string;
}

export const meta: MetaFunction = () => {
  return [
    { title: "文本替换工具 | 在线文本处理" },
    {
      name: "description",
      content:
        "在线文本替换工具，快速查找和替换文本内容，支持保存常用替换模版。",
    },
    {
      name: "keywords",
      content: "文本替换,查找替换,文本处理,在线工具,替换模版",
    },
    { name: "author", content: "文本替换工具" },
    { property: "og:title", content: "文本替换工具 | 在线文本处理" },
    {
      property: "og:description",
      content:
        "在线文本替换工具，快速查找和替换文本内容，支持保存常用替换模版。",
    },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "文本替换工具 | 在线文本处理" },
    {
      name: "twitter:description",
      content:
        "在线文本替换工具，快速查找和替换文本内容，支持保存常用替换模版。",
    },
  ];
};

export default function TextReplacer() {
  const location = useLocation();
  const navigate = useNavigate();

  const [originalText, setOriginalText] = useState("");
  const [searchText, setSearchText] = useState(
    location.state?.searchText || ""
  );
  const [replaceText, setReplaceText] = useState(
    location.state?.replaceText || ""
  );

  // Effect to clear location state after loading it
  useEffect(() => {
    // Changed useState to useEffect
    if (location.state?.searchText || location.state?.replaceText) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]); // Added dependencies

  const handleReplace = useCallback(() => {
    if (!originalText || !searchText) return;

    const replaced = originalText.split(searchText).join(replaceText);
    setOriginalText(replaced);
  }, [originalText, searchText, replaceText]);

  const handleCopy = useCallback(() => {
    if (!originalText) return;

    navigator.clipboard
      .writeText(originalText)
      .then(() => {
        alert("已复制到剪贴板！");
      })
      .catch((err) => {
        console.error("复制失败: ", err);
      });
  }, [originalText]);

  const handleSaveTemplate = useCallback(() => {
    if (!searchText.trim() && !replaceText.trim()) {
      alert("查找文本和替换文本不能为空！");
      return;
    }
    const templateName = prompt(
      "请输入模板名称：",
      `模版 ${new Date().toLocaleString()}`
    );
    if (!templateName) {
      return;
    }

    const newTemplate: Template = {
      id: Date.now().toString(),
      name: templateName,
      searchText,
      replaceText,
    };

    try {
      const existingTemplatesRaw = localStorage.getItem(
        "textReplacerTemplates"
      );
      const existingTemplates: Template[] = existingTemplatesRaw
        ? JSON.parse(existingTemplatesRaw)
        : [];
      existingTemplates.push(newTemplate);
      localStorage.setItem(
        "textReplacerTemplates",
        JSON.stringify(existingTemplates)
      );
      alert("模板已保存！");
    } catch (error) {
      console.error("保存模板失败：", error);
      alert("保存模板失败，请检查浏览器控制台。");
    }
  }, [searchText, replaceText]);

  const handleLoadTemplate = useCallback(
    (template: Template) => {
      // Navigate to the text replacer page and pass template data via location state
      navigate("/", {
        state: {
          searchText: template.searchText,
          replaceText: template.replaceText,
        },
      });
    },
    [navigate]
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">
        文本替换工具
      </h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">文本内容</label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded min-h-[200px] md:min-h-[250px]"
          value={originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          placeholder="请输入需要处理的文本..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">查找文本</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="要查找的文本"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">替换为</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="替换成的文本"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:space-y-2 md:space-y-0 sm:space-x-0 md:space-x-4 mb-4 items-center">
        <button
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2 sm:mb-0 md:mb-0"
          onClick={handleReplace}
        >
          替换内容
        </button>
        <button
          className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-2 sm:mb-0 md:mb-0"
          onClick={handleCopy}
          disabled={!originalText}
        >
          复制结果
        </button>
        <button
          className="w-full sm:w-auto px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mb-2 sm:mb-0 md:mb-0"
          onClick={handleSaveTemplate}
        >
          保存为模版
        </button>
        <Link
          to="/templates"
          className="w-full sm:w-auto text-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          管理模版
        </Link>
      </div>
    </div>
  );
}
