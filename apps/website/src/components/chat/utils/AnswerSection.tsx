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
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-light text-neutral-900">Answer</h2>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <div className="prose prose-neutral max-w-none">
            <MarkdownPreview
              source={answer}
              style={{
                backgroundColor: "transparent",
                padding: 0,
                color: "#525252",
                fontFamily: "inherit"
              }}
            />
          </div>
        </div>

        {answeredQuestions && answeredQuestions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-neutral-700 uppercase tracking-wide">
              Based on your answers
            </h3>
            <div className="space-y-3">
              {answeredQuestions.map((qa, index) => (
                <div key={index} className="border-l-2 border-neutral-200 pl-4">
                  <div className="text-sm">
                    <p className="text-neutral-600 mb-1">{qa.question}</p>
                    <p className="text-neutral-900 font-medium">{qa.answer}</p>
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
        className="border-neutral-300 text-neutral-900 hover:bg-neutral-50 px-8 py-3 text-base font-medium"
        size="lg"
      >
        Ask Another Question
      </Button>
    </div>
  );
};
