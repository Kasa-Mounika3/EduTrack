const EmptyState = ({ title, message, action }) => {
  return (
    <div className="panel flex min-h-64 flex-col items-center justify-center text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-2xl text-brand dark:bg-blue-950">
        +
      </div>
      <h3 className="mt-4 text-xl font-black">{title}</h3>
      <p className="muted mt-2 max-w-md">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
