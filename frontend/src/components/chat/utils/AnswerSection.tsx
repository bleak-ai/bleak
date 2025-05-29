import {Button} from "../../ui/button";
import type {AnsweredQuestion} from "../../../api/interactiveApi";

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
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Answer</h2>
        </div>
        <div className="bg-muted/50 border border-border rounded-md p-4">
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {answer}
          </div>
        </div>

        {answeredQuestions && answeredQuestions.length > 0 && (
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground mb-2">
              Based on your answers:
            </h3>
            <div className="space-y-2">
              {answeredQuestions.map((qa, index) => (
                <div key={index} className="text-xs text-muted-foreground">
                  <span className="font-medium">Q:</span> {qa.question}
                  <br />
                  <span className="font-medium">A:</span> {qa.answer}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={onReset}
        variant="secondary"
        className="w-full"
        size="lg"
      >
        Ask Another Question
      </Button>
    </div>
  );
};
