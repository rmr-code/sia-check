import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer = ({
  content,
  baseTextColor,
}) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ ...props }) => (
          <h1
            className={`text-2xl font-bold mb-4 ${baseTextColor}`}
            {...props}
          />
        ),
        h2: ({ ...props }) => (
          <h2
            className={`text-xl font-semibold mb-4 ${baseTextColor}`}
            {...props}
          />
        ),
        p: ({ ...props }) => (
          <p
            className={`text-base leading-relaxed mb-4 ${baseTextColor}`}
            {...props}
          />
        ),
        ol: ({ ...props }) => (
          <ol className={`list-decimal ml-6 ${baseTextColor}`} {...props} />
        ),
        ul: ({ ...props }) => (
          <ul className={`list-disc ml-6 ${baseTextColor}`} {...props} />
        ),
        li: ({ ...props }) => (
          <li className={`${baseTextColor}`} {...props} />
        ),
        blockquote: ({ ...props }) => (
          <blockquote
            className={`border-l-4 border-gray-300 pl-4 italic my-4 ${baseTextColor}`}
            {...props}
          />
        ),
        code: ({ children, ...props }) => (
          <pre className="bg-gray-800 text-white p-3 rounded-md my-4">
            <code className="whitespace-pre-wrap" {...props}>
              {children}
            </code>
          </pre>
        ),
        table: ({ ...props }) => (
          <table
            className="table-auto border-collapse border border-gray-300 w-full my-4"
            {...props}
          />
        ),
        th: ({ ...props }) => (
          <th
            className="border border-gray-300 px-4 py-2 text-left font-bold"
            {...props}
          />
        ),
        tr: ({ ...props }) => (
          <tr className="border border-gray-300" {...props} />
        ),
        td: ({ ...props }) => (
          <td className="border border-gray-300 px-4 py-2" {...props} />
        ),
        a: ({ href, ...props }) => (
          <a href={href} className="text-blue-500 underline" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
