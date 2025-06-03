import React from "react";
import {CodeBlock} from "../ui/code-block";

interface MDXContentProps {
  content: string;
}

export const MDXContent: React.FC<MDXContentProps> = ({content}) => {
  // Enhanced markdown parser with Astro-like styling
  const parseContent = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactElement[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Headers - Astro-like styling
      if (line.startsWith("# ")) {
        elements.push(
          <h1
            key={i}
            className="text-4xl font-bold mb-8 mt-12 first:mt-0 text-white tracking-tight"
          >
            {line.substring(2)}
          </h1>
        );
        i++;
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={i}
            className="text-2xl font-semibold mb-6 mt-10 text-white tracking-tight border-b border-zinc-800 pb-3"
          >
            {line.substring(3)}
          </h2>
        );
        i++;
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-xl font-medium mb-4 mt-8 text-white">
            {line.substring(4)}
          </h3>
        );
        i++;
      }
      // Code blocks with title support
      else if (line.startsWith("```")) {
        const language = line.substring(3);
        i++;
        const codeLines: string[] = [];

        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }

        // Determine title based on language
        let title = "";
        if (language === "typescript" || language === "ts") {
          title = "TypeScript";
        } else if (language === "bash") {
          title = "Terminal";
        } else if (language === "json") {
          title = "JSON";
        } else if (language === "javascript" || language === "js") {
          title = "JavaScript";
        }

        elements.push(
          <CodeBlock key={i} language={language || "text"} title={title}>
            {codeLines.join("\n")}
          </CodeBlock>
        );
        i++; // Skip closing ```
      }
      // Paragraphs and text
      else if (line.trim() !== "") {
        // Handle bold text and inline code with better styling
        const processedLine = line
          .replace(
            /\*\*(.*?)\*\*/g,
            "<strong class='font-semibold text-white'>$1</strong>"
          )
          .replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" class="text-orange-400 hover:text-orange-300 underline" target="_blank" rel="noopener noreferrer">$1</a>'
          )
          .replace(
            /`(.*?)`/g,
            '<code class="px-2 py-1 bg-zinc-800 text-orange-300 rounded-md font-mono text-sm border border-zinc-700">$1</code>'
          );

        // Check if it's a list item
        if (line.startsWith("- ")) {
          const listItems: string[] = [];
          while (i < lines.length && lines[i].startsWith("- ")) {
            listItems.push(lines[i].substring(2));
            i++;
          }

          elements.push(
            <ul key={i} className="mb-6 space-y-2">
              {listItems.map((item, idx) => (
                <li
                  key={idx}
                  className="text-zinc-300 ml-6 relative leading-relaxed"
                >
                  <span className="absolute -left-6 text-orange-400 font-medium">
                    •
                  </span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: item
                        .replace(
                          /\*\*(.*?)\*\*/g,
                          "<strong class='font-semibold text-white'>$1</strong>"
                        )
                        .replace(
                          /\[([^\]]+)\]\(([^)]+)\)/g,
                          '<a href="$2" class="text-orange-400 hover:text-orange-300 underline" target="_blank" rel="noopener noreferrer">$1</a>'
                        )
                        .replace(
                          /`(.*?)`/g,
                          '<code class="px-2 py-1 bg-zinc-800 text-orange-300 rounded-md font-mono text-sm border border-zinc-700">$1</code>'
                        )
                    }}
                  />
                </li>
              ))}
            </ul>
          );
          continue;
        }

        // Parameters, Returns sections
        if (
          line.startsWith("**Parameters:**") ||
          line.startsWith("**Returns:**")
        ) {
          elements.push(
            <div
              key={i}
              className="mb-4 mt-6"
              dangerouslySetInnerHTML={{__html: processedLine}}
            />
          );
        } else {
          elements.push(
            <p
              key={i}
              className="mb-4 text-zinc-300 leading-relaxed text-base"
              dangerouslySetInnerHTML={{__html: processedLine}}
            />
          );
        }
        i++;
      } else {
        i++;
      }
    }

    return elements;
  };

  return (
    <div className="prose prose-invert prose-zinc max-w-none">
      <div className="space-y-1">{parseContent(content)}</div>
    </div>
  );
};
