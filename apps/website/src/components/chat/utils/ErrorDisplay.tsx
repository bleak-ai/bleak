import {AlertCircle} from "lucide-react";

interface ErrorDisplayProps {
  error: Error;
}

export const ErrorDisplay = ({error}: ErrorDisplayProps) => {
  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
      <div className="text-sm">
        <p className="font-medium text-red-900">Something went wrong</p>
        <p className="text-red-700 mt-1">{error.message}</p>
      </div>
    </div>
  );
};
