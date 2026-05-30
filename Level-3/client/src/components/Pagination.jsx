const Pagination = ({ page, totalPages = 1, onPageChange }) => {
  return (
    <div className="mt-4 flex items-center justify-end gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
      <button className="btn-soft" type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        className="btn-soft"
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
