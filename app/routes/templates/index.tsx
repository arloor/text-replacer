import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

// Define the Template interface (should be consistent with TextReplacer component)
interface Template {
  id: string;
  name: string;
  searchText: string;
  replaceText: string;
}

export default function TemplatesManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedTemplates = localStorage.getItem("textReplacerTemplates");
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }
    } catch (error) {
      console.error("加载模板失败：", error);
      alert("加载模板列表失败，请检查浏览器控制台。");
    }
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

  const handleLoadTemplate = useCallback(
    (template: Template) => {
      // Navigate to the text replacer page and pass template data via location state
      navigate("/text-replacer", {
        state: {
          searchText: template.searchText,
          replaceText: template.replaceText,
        },
      });
    },
    [navigate]
  );

  return (
    <div className="container mx-auto p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">模版管理</h1>
        <Link
          to="/"
          className="w-full sm:w-auto text-center px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm sm:text-base"
        >
          返回替换工具
        </Link>
      </div>

      {templates.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">
          暂无模版，请先在文本替换页面保存模版。
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
  );
}
