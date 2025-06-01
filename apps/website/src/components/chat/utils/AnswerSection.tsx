import {Button} from "../../ui/button";
import type {AnsweredQuestion} from "../../../api/interactiveApi";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface AnswerSectionProps {
  answer: string;
  answeredQuestions?: AnsweredQuestion[];
  onReset: () => void;
}

export const AnswerSection = ({
  answer,
  answeredQuestions,
  onReset
}: AnswerSectionProps) => {
  // Custom dark theme styles for MarkdownPreview
  const markdownDarkTheme = {
    backgroundColor: "transparent",
    color: "hsl(var(--foreground))",
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: "1.6",
    padding: 0,
    margin: 0,
    // Headings
    "h1, h2, h3, h4, h5, h6": {
      color: "hsl(var(--foreground))",
      fontWeight: "600",
      marginTop: "1.5em",
      marginBottom: "0.5em",
      lineHeight: "1.25"
    },
    // Paragraphs
    p: {
      color: "hsl(var(--foreground))",
      marginBottom: "1em",
      lineHeight: "1.6"
    },
    // Lists
    "ul, ol": {
      color: "hsl(var(--foreground))",
      paddingLeft: "1.5em",
      marginBottom: "1em"
    },
    li: {
      color: "hsl(var(--foreground))",
      marginBottom: "0.25em"
    },
    // Links
    a: {
      color: "hsl(var(--primary))",
      textDecoration: "underline",
      textDecorationColor: "hsl(var(--primary))"
    },
    "a:hover": {
      color: "hsl(var(--primary) / 0.8)"
    },
    // Code
    code: {
      backgroundColor: "hsl(var(--muted))",
      color: "hsl(var(--foreground))",
      padding: "0.125em 0.25em",
      borderRadius: "0.25em",
      fontSize: "0.875em",
      fontFamily: "monospace"
    },
    pre: {
      backgroundColor: "hsl(var(--muted))",
      color: "hsl(var(--foreground))",
      padding: "1em",
      borderRadius: "0.5em",
      overflow: "auto",
      marginBottom: "1em"
    },
    "pre code": {
      backgroundColor: "transparent",
      padding: 0
    },
    // Blockquotes
    blockquote: {
      borderLeft: "4px solid hsl(var(--border))",
      paddingLeft: "1em",
      marginLeft: 0,
      marginBottom: "1em",
      color: "hsl(var(--muted-foreground))",
      fontStyle: "italic"
    },
    // Tables
    table: {
      borderCollapse: "collapse",
      width: "100%",
      marginBottom: "1em"
    },
    "th, td": {
      border: "1px solid hsl(var(--border))",
      padding: "0.5em",
      textAlign: "left"
    },
    th: {
      backgroundColor: "hsl(var(--muted))",
      fontWeight: "600"
    },
    // Horizontal rules
    hr: {
      border: "none",
      borderTop: "1px solid hsl(var(--border))",
      marginTop: "2em",
      marginBottom: "2em"
    },
    // Strong and emphasis
    "strong, b": {
      color: "hsl(var(--foreground))",
      fontWeight: "600"
    },
    "em, i": {
      color: "hsl(var(--foreground))",
      fontStyle: "italic"
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-light text-foreground">Answer</h2>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="prose prose-neutral max-w-none">
            <MarkdownPreview
              source={answer}
              style={markdownDarkTheme}
              wrapperElement={{
                "data-color-mode": "dark"
              }}
            />
          </div>
        </div>

        {answeredQuestions && answeredQuestions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Based on your answers
            </h3>
            <div className="space-y-3">
              {answeredQuestions.map((qa, index) => (
                <div key={index} className="border-l-2 border-border pl-4">
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">{qa.question}</p>
                    <p className="text-foreground font-medium">{qa.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={onReset}
        variant="outline"
        className="px-8 py-3 text-base font-medium"
        size="lg"
      >
        Ask Another Question
      </Button>
    </div>
  );
};
