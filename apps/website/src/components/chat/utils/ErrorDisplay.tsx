import {AlertCircle} from "lucide-react";

interface ErrorDisplayProps {
  error: Error;
}

export const ErrorDisplay = ({error}: ErrorDisplayProps) => {
  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
      <strong>Error:</strong> {error.message}
    </div>
  );
};
