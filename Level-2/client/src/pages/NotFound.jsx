import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <section className="page narrow-page">
      <div className="panel empty-state">
        <h1>Page not found</h1>
        <p>The route you opened does not exist in this React app.</p>
        <Link className="primary-link" to="/">
          Go to Dashboard
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
