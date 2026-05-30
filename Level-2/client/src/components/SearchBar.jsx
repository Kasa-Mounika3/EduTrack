const SearchBar = ({ value, onChange }) => {
  return (
    <label className="search-bar">
      <span>Search students</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by name, email, or course"
      />
    </label>
  );
};

export default SearchBar;
