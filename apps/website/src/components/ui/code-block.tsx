import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {oneLight} from "react-syntax-highlighter/dist/esm/styles/prism";
import {cn} from "../../lib/utils";

interface CodeBlockProps {
  children: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock = ({
  children,
  language = "typescript",
  className,
  showLineNumbers = false
}: CodeBlockProps) => {
  const customStyle = {
    ...oneLight,
    'code[class*="language-"]': {
      ...oneLight['code[class*="language-"]'],
      fontFamily:
        '"JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      fontSize: "14px",
      lineHeight: "1.5"
    },
    'pre[class*="language-"]': {
      ...oneLight['pre[class*="language-"]'],
      background: "transparent",
      padding: "0",
      margin: "0",
      borderRadius: "0"
    }
  };

  return (
    <div className={cn("relative", className)}>
      <SyntaxHighlighter
        language={language}
        style={customStyle}
        showLineNumbers={showLineNumbers}
        customStyle={{
          background: "transparent",
          padding: "0",
          margin: "0"
        }}
        codeTagProps={{
          style: {
            fontFamily:
              '"JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
          }
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};
