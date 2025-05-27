interface ErrorDisplayProps {
  error: Error;
}

export const ErrorDisplay = ({error}: ErrorDisplayProps) => {
  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center mt-0.5">
          <span className="text-xs text-destructive font-bold">!</span>
        </div>
        <div className="space-y-1">
          <p className="text-destructive font-medium text-sm">
            Something went wrong
          </p>
          <p className="text-destructive/80 text-sm">{error.message}</p>
        </div>
      </div>
    </div>
  );
};
