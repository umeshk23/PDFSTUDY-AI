import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const MarkdownRenderer = ({ content = '' }) => {
    return (
        <div className="prose prose-slate max-w-none text-neutral-800">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: (props) => <h1 className="text-3xl font-bold my-4" {...props} />,
                    h2: (props) => <h2 className="text-2xl font-bold my-4" {...props} />,
                    h3: (props) => <h3 className="text-xl font-bold my-4" {...props} />,
                    p: (props) => <p className="my-2 leading-7" {...props} />,
                    a: (props) => <a className="text-emerald-600 hover:underline" {...props} />,
                    ul: (props) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
                    ol: (props) => <ol className="list-decimal list-inside my-2 space-y-1" {...props} />,
                    li: (props) => <li className="ml-4" {...props} />,
                    strong: (props) => <strong className="font-semibold" {...props} />,
                    em: (props) => <em className="italic" {...props} />,
                    blockquote: (props) => (
                        <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4" {...props} />
                    ),
                    pre: (props) => (
                        <pre className="my-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100" {...props} />
                    ),
                    code: ({ inline, children, ...props }) => {
                        if (!inline) {
                            return (
                                <code className="font-mono text-sm" {...props}>
                                    {children}
                                </code>
                            )
                        }

                        return (
                            <code className="bg-slate-100 px-1 py-0.5 rounded text-sm" {...props}>
                                {children}
                            </code>
                        )
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}

export default MarkdownRenderer
