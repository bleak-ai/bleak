import {AlertCircle} from "lucide-react";

interface ErrorDisplayProps {
  error: Error;
}

export const ErrorDisplay = ({error}: ErrorDisplayProps) => {
  return (
    <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
      <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
      <div className="text-sm">
        <p className="font-medium text-foreground">Something went wrong</p>
        <p className="text-muted-foreground mt-1">{error.message}</p>
      </div>
    </div>
  );
};
