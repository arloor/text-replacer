import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const [originalText, setOriginalText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);

  // 加载保存的状态和模板
  useEffect(() => {
    // 尝试加载模板列表
    try {
      const storedTemplates = localStorage.getItem("textReplacerTemplates");
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }
    } catch (error) {
      console.error("加载模板失败：", error);
    }

    // 如果有通过导航传递的搜索和替换文本，则设置它们
    const searchParams = new URLSearchParams(window.location.search);
    const searchTextParam = searchParams.get("searchText");
    const replaceTextParam = searchParams.get("replaceText");

    if (searchTextParam) setSearchText(searchTextParam);
    if (replaceTextParam) setReplaceText(replaceTextParam);

    // 清除URL参数
    if (searchTextParam || replaceTextParam) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleReplace = useCallback(() => {
    if (!originalText || !searchText) return;

    const replaced = originalText.split(searchText).join(replaceText);
    setOriginalText(replaced);
  }, [originalText, searchText, replaceText]);

  const handleCopy = useCallback(() => {
    if (!originalText) return;

    // 尝试使用现代API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(originalText)
        .then(() => {
          alert("已复制到剪贴板！");
        })
        .catch((err) => {
          console.error("现代API复制失败: ", err);
          // 当现代API失败时，尝试使用fallback方法
          fallbackCopyToClipboard(originalText);
        });
    } else {
      // 在不支持navigator.clipboard的环境中使用后备方法
      fallbackCopyToClipboard(originalText);
    }
  }, [originalText]);

  // 后备复制方法
  const fallbackCopyToClipboard = (text: string) => {
    try {
      // 创建一个临时文本区域
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // 避免滚动到底部
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      // 执行复制命令
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        alert("已复制到剪贴板！");
      } else {
        console.error("fallback复制方法失败");
        alert("复制失败，请手动复制文本。");
      }
    } catch (err) {
      console.error("fallback复制失败: ", err);
      alert("复制失败，请手动复制文本。");
    }
  };

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
      const updatedTemplates = [...templates, newTemplate];
      setTemplates(updatedTemplates);
      localStorage.setItem(
        "textReplacerTemplates",
        JSON.stringify(updatedTemplates)
      );
      alert("模板已保存！");
    } catch (error) {
      console.error("保存模板失败：", error);
      alert("保存模板失败，请检查浏览器控制台。");
    }
  }, [searchText, replaceText, templates]);

  const handleLoadTemplate = useCallback((template: Template) => {
    setSearchText(template.searchText);
    setReplaceText(template.replaceText);
  }, []);

  const handleDeleteTemplate = useCallback(
    (templateId: string) => {
      if (window.confirm("确定要删除这个模板吗？")) {
        try {
          const updatedTemplates = templates.filter((t) => t.id !== templateId);
          setTemplates(updatedTemplates);
          localStorage.setItem(
            "textReplacerTemplates",
            JSON.stringify(updatedTemplates)
          );
          alert("模板已删除！");
        } catch (error) {
          console.error("删除模板失败：", error);
          alert("删除模板失败，请检查浏览器控制台。");
        }
      }
    },
    [templates]
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

      <div className="flex flex-col sm:flex-row sm:space-y-2 md:space-y-0 sm:space-x-0 md:space-x-4 mb-6 items-center">
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
      </div>

      {/* 模板管理部分 */}
      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-bold mb-4">已保存模版</h2>

        {templates.length === 0 ? (
          <p className="text-center text-gray-500 mt-4 mb-6">
            暂无保存的模版，请先保存模版。
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-3 sm:p-4 border border-gray-300 rounded shadow"
              >
                <h2
                  className="text-lg sm:text-xl font-semibold mb-2 truncate"
                  title={template.name}
                >
                  {template.name}
                </h2>
                <div className="mb-1">
                  <div className="flex items-center">
                    <span className="font-medium text-sm sm:text-base mr-1">
                      查找:
                    </span>
                    <span
                      className="text-gray-700 truncate text-sm sm:text-base"
                      title={template.searchText}
                    >
                      {template.searchText || "(空)"}
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex items-center">
                    <span className="font-medium text-sm sm:text-base mr-1">
                      替换为:
                    </span>
                    <span
                      className="text-gray-700 truncate text-sm sm:text-base"
                      title={template.replaceText}
                    >
                      {template.replaceText || "(空)"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleLoadTemplate(template)}
                    className="px-2 sm:px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs sm:text-sm"
                  >
                    加载
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs sm:text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
