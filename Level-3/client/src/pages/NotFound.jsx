import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div className="panel max-w-md">
        <h1 className="text-4xl font-black">404</h1>
        <p className="muted mt-2">The page you requested does not exist.</p>
        <Link className="btn-primary mt-5" to="/dashboard">Go to Overview</Link>
      </div>
    </main>
  );
};

export default NotFound;
