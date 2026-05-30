const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="loader-box" role="status" aria-live="polite">
      <span className="spinner"></span>
      <span>{text}</span>
    </div>
  );
};

export default Loader;
