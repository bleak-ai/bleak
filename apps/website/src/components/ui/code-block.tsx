import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {oneDark} from "react-syntax-highlighter/dist/esm/styles/prism";
import {cn} from "../../lib/utils";
import {Copy, Check} from "lucide-react";
import {useState} from "react";

interface CodeBlockProps {
  children: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
  title?: string;
}

export const CodeBlock = ({
  children,
  language = "typescript",
  className,
  showLineNumbers = false,
  title
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Custom style based on Astro's approach
  const customStyle = {
    ...oneDark,
    'code[class*="language-"]': {
      ...oneDark['code[class*="language-"]'],
      fontFamily:
        '"JetBrains Mono", "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", "Consolas", monospace',
      fontSize: "12px",
      lineHeight: "1.5",
      color: "#e5e7eb",
      background: "transparent"
    },
    'pre[class*="language-"]': {
      ...oneDark['pre[class*="language-"]'],
      background: "rgb(13, 13, 13)",
      padding: "16px",
      margin: "0",
      borderRadius: "8px",
      border: "1px solid rgb(39, 39, 42)",
      overflow: "auto"
    }
  };

  return (
    <div className={cn("relative group my-6 w-full max-w-full", className)}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 text-zinc-300 text-sm font-medium border border-zinc-700 rounded-t-lg border-b-0">
          <span>{title}</span>
        </div>
      )}

      <div className="relative w-full overflow-hidden">
        <button
          onClick={copyToClipboard}
          className="absolute top-3 right-3 z-10 p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-md transition-colors opacity-0 group-hover:opacity-100"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-zinc-300" />
          )}
        </button>

        <SyntaxHighlighter
          language={language}
          style={customStyle}
          showLineNumbers={showLineNumbers}
          className="responsive-code-block"
          customStyle={{
            background: "rgb(13, 13, 13)",
            padding: "16px",
            margin: "0",
            borderRadius: title ? "0 0 8px 8px" : "8px",
            border: "1px solid rgb(39, 39, 42)",
            fontSize: "12px",
            lineHeight: "1.5"
          }}
          codeTagProps={{
            style: {
              fontFamily:
                '"JetBrains Mono", "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", "Consolas", monospace',
              fontSize: "12px",
              lineHeight: "1.5",
              color: "#e5e7eb"
            },
            className: "responsive-code-block"
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
