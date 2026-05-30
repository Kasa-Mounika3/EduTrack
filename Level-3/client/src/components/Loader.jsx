const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex min-h-40 items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      <span className="h-5 w-5 animate-spin rounded-full border-4 border-slate-200 border-t-brand"></span>
      <span className="font-semibold">{text}</span>
    </div>
  );
};

export default Loader;
