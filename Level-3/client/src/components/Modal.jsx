const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 px-4 py-8">
      <div className="panel w-full max-w-3xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">{title}</h2>
          <button className="btn-soft h-10 w-10 px-0" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
