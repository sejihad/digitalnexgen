import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkDownWithToggle = ({ content, limit = 300 }) => {
  const [expanded, setExpanded] = useState(false);

  // Truncated version
  const truncated =
    content.length > limit ? content.slice(0, limit) + "..." : content;

  return (
    <div className="markdown-container">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // ✅ Headings
          h1: ({ node, ...props }) => (
            <h1
              className="text-2xl font-bold mb-4 mt-6 text-black dark:text-white"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-xl font-bold mb-3 mt-5 text-black dark:text-white"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-lg font-bold mb-2 mt-4 text-black dark:text-white"
              {...props}
            />
          ),

          // ✅ Paragraphs
          p: ({ node, ...props }) => (
            <p
              className="mb-4 leading-relaxed text-black dark:text-white whitespace-pre-wrap"
              {...props}
            />
          ),

          // ✅ Lists
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc pl-5 mb-4 space-y-1 text-black dark:text-white"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal pl-5 mb-4 space-y-1 text-black dark:text-white"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="mb-1 ml-2 text-black dark:text-white" {...props} />
          ),

          // ✅ Text formatting
          strong: ({ node, ...props }) => (
            <strong
              className="font-bold text-black dark:text-white"
              {...props}
            />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-black dark:text-white" {...props} />
          ),

          // ✅ Code blocks
          code: ({ node, inline, ...props }) => {
            if (inline) {
              return (
                <code
                  className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-black dark:text-white"
                  {...props}
                />
              );
            }
            return (
              <pre className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4">
                <code
                  className="text-sm font-mono text-black dark:text-white"
                  {...props}
                />
              </pre>
            );
          },

          // ✅ Links
          a: ({ node, ...props }) => (
            <a
              className="text-black dark:text-white underline hover:text-white dark:hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),

          // ✅ Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-400 dark:border-gray-600 pl-4 italic my-4 text-gray-700 dark:text-white"
              {...props}
            />
          ),

          // ✅ Images
          img: ({ node, ...props }) => (
            <img
              className="max-w-full h-auto rounded-lg my-4"
              loading="lazy"
              {...props}
            />
          ),
        }}
      >
        {expanded ? content : truncated}
      </ReactMarkdown>

      {content.length > limit && (
        <button
          className="text-blue-600 dark:text-white underline font-medium mt-2"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "See Less" : "See More"}
        </button>
      )}
    </div>
  );
};

export default MarkDownWithToggle;
