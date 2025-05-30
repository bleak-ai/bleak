import {Loader} from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner = ({
  message = "Processing your request..."
}: LoadingSpinnerProps) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-3">
        <Loader className="w-5 h-5 animate-spin text-primary" />
        <span className="text-muted-foreground font-medium">{message}</span>
      </div>
    </div>
  );
};
