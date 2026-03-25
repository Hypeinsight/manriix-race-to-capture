export default function ProgressBar({ current, total = 4 }) {
  return (
    <div className="flex items-center gap-2 py-4">
      {Array.from({ length: total }, (_, i) => {
        const stepNum = i + 1;
        const isDone    = stepNum < current;
        const isCurrent = stepNum === current;

        return (
          <div key={i} className="flex-1 flex flex-col gap-1">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isDone    ? 'bg-brand-orange' :
                isCurrent ? 'bg-brand-yellow animate-pulse' :
                            'bg-dark-border dark:bg-dark-border'
              }`}
            />
          </div>
        );
      })}

      <span className="ml-1 text-xs font-semibold text-dark-muted dark:text-dark-muted shrink-0">
        {current}/{total}
      </span>
    </div>
  );
}
