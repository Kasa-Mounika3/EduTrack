const Skeleton = ({ rows = 3 }) => {
  return (
    <div className="grid gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="panel animate-pulse" key={index}>
          <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="mt-4 h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800"></div>
          <div className="mt-2 h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800"></div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
