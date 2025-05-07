import { useState, useCallback } from "react";

export default function TextReplacer() {
  const [originalText, setOriginalText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");

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

      <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4">
        <button
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2 sm:mb-0"
          onClick={handleReplace}
        >
          替换内容
        </button>
        <button
          className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={handleCopy}
          disabled={!originalText}
        >
          复制结果
        </button>
      </div>
    </div>
  );
}
