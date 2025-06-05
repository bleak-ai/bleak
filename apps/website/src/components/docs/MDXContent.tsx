import React from "react";
import {CodeBlock} from "../ui/code-block";

interface MDXContentProps {
  content: string;
  onInternalNavigation?: (sectionId: string) => void;
}

export const MDXContent: React.FC<MDXContentProps> = ({
  content,
  onInternalNavigation
}) => {
  // Handle internal navigation
  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    // Check if it's an internal documentation link
    const internalLinks = [
      "api-reference",
      "getting-started",
      "dynamic-forms",
      "dynamic-forms-initialize",
      "dynamic-forms-components",
      "dynamic-forms-questions"
    ];

    if (internalLinks.includes(href) && onInternalNavigation) {
      e.preventDefault();
      onInternalNavigation(href);
      return;
    }

    // External links open in new tab
    if (href.startsWith("http")) {
      return; // Let default behavior handle it
    }
  };

  // Enhanced markdown parser with Silent Edge styling
  const parseContent = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactElement[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Headers - Silent Edge styling
      if (line.startsWith("# ")) {
        elements.push(
          <h1
            key={i}
            className="text-4xl font-semibold mb-8 mt-12 first:mt-0 text-foreground tracking-tight"
          >
            {line.substring(2)}
          </h1>
        );
        i++;
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={i}
            className="text-2xl font-semibold mb-6 mt-10 text-foreground tracking-tight border-b border-border pb-3"
          >
            {line.substring(3)}
          </h2>
        );
        i++;
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-xl font-medium mb-4 mt-8 text-foreground">
            {line.substring(4)}
          </h3>
        );
        i++;
      }
      // Code blocks
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
        // Handle bold text and inline code with Silent Edge styling
        const processedLine = line
          .replace(
            /\*\*(.*?)\*\*/g,
            "<strong class='font-semibold text-foreground'>$1</strong>"
          )
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, href) => {
            const isInternal = [
              "api-reference",
              "getting-started",
              "dynamic-forms",
              "dynamic-forms-initialize",
              "dynamic-forms-components",
              "dynamic-forms-questions"
            ].includes(href);
            const isExternal = href.startsWith("http");

            if (isInternal) {
              return `<a href="#" data-internal-link="${href}" class="text-primary hover:text-primary/90 underline font-medium transition-colors">${text}</a>`;
            } else if (isExternal) {
              return `<a href="${href}" class="text-primary hover:text-primary/90 underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">${text}</a>`;
            } else {
              return `<a href="${href}" class="text-primary hover:text-primary/90 underline font-medium transition-colors">${text}</a>`;
            }
          })
          .replace(
            /`(.*?)`/g,
            '<code class="px-2 py-1 bg-muted text-foreground rounded font-mono text-sm border border-border">$1</code>'
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
                  className="text-muted-foreground ml-6 relative leading-relaxed"
                >
                  <span className="absolute -left-6 text-primary font-medium">
                    •
                  </span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: item
                        .replace(
                          /\*\*(.*?)\*\*/g,
                          "<strong class='font-semibold text-foreground'>$1</strong>"
                        )
                        .replace(
                          /\[([^\]]+)\]\(([^)]+)\)/g,
                          (match, text, href) => {
                            const isInternal = [
                              "api-reference",
                              "getting-started",
                              "dynamic-forms",
                              "dynamic-forms-initialize",
                              "dynamic-forms-components",
                              "dynamic-forms-questions"
                            ].includes(href);
                            const isExternal = href.startsWith("http");

                            if (isInternal) {
                              return `<a href="#" data-internal-link="${href}" class="text-primary hover:text-primary/90 underline font-medium transition-colors">${text}</a>`;
                            } else if (isExternal) {
                              return `<a href="${href}" class="text-primary hover:text-primary/90 underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">${text}</a>`;
                            } else {
                              return `<a href="${href}" class="text-primary hover:text-primary/90 underline font-medium transition-colors">${text}</a>`;
                            }
                          }
                        )
                        .replace(
                          /`(.*?)`/g,
                          '<code class="px-2 py-1 bg-muted text-foreground rounded font-mono text-sm border border-border">$1</code>'
                        )
                    }}
                  />
                </li>
              ))}
            </ul>
          );
          continue;
        }

        // Check for emojis and special formatting
        if (line.startsWith("✅") || line.startsWith("❌")) {
          elements.push(
            <div
              key={i}
              className="mb-4 p-4 bg-muted/50 border border-border rounded-lg"
              dangerouslySetInnerHTML={{__html: processedLine}}
            />
          );
        }
        // Parameters, Returns sections
        else if (
          line.startsWith("**Parameters:**") ||
          line.startsWith("**Returns:**")
        ) {
          elements.push(
            <div
              key={i}
              className="mb-4 mt-6 font-medium text-foreground"
              dangerouslySetInnerHTML={{__html: processedLine}}
            />
          );
        } else {
          elements.push(
            <p
              key={i}
              className="mb-4 text-muted-foreground leading-relaxed"
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

  // Handle clicks on internal links
  React.useEffect(() => {
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A" && target.hasAttribute("data-internal-link")) {
        e.preventDefault();
        const sectionId = target.getAttribute("data-internal-link");
        if (sectionId && onInternalNavigation) {
          onInternalNavigation(sectionId);
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [onInternalNavigation]);

  return (
    <div className="prose prose-invert max-w-none">
      <div className="space-y-1">{parseContent(content)}</div>
    </div>
  );
};
