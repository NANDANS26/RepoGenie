import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/atom-one-dark.css'

interface MarkdownRendererProps {
  content: string
  className?: string
}

const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-medium mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
          a: ({ node, ...props }) => <a className="text-primary-500 hover:underline" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          code: ({
            inline,
            className,
            children,
            ...props
          }: {
            inline?: boolean
            className?: string
            children?: React.ReactNode
          }) => {
            if (inline) {
              return (
                <code className="bg-dark-700 px-1.5 py-0.5 rounded text-sm" {...props}>
                  {children}
                </code>
              )
            }
            return (
              <pre className="bg-dark-800 rounded-lg p-4 mb-4 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            )
          },
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-primary-500 pl-4 italic text-dark-400 mb-4" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border border-dark-700 px-4 py-2 text-left bg-dark-800" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-dark-700 px-4 py-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer
