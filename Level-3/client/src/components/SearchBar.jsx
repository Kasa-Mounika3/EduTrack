const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <label className="label">
      Search
      <input
        className="input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
};

export default SearchBar;
