import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto grid min-h-screen max-w-7xl content-center gap-10 px-4 py-16 lg:grid-cols-[1fr_420px] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <p className="eyebrow text-blue-200">EduTrack</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight md:text-7xl">
            Smart Student Management System
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            A calm, modern workspace for schools to manage students, courses, attendance, updates, and academic progress.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="btn-primary" to="/login">Sign In</Link>
            <Link className="btn-soft bg-white/10 text-white hover:bg-white/20" to="/register">Create Account</Link>
          </div>
        </motion.div>
        <motion.div className="panel border-white/10 bg-white/10 text-white backdrop-blur" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-blue-100">Today</p>
              <h2 className="text-2xl font-black">Campus Overview</h2>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-black text-emerald-100">Live</span>
          </div>
          <div className="mt-6 grid gap-3">
            {['Attendance reviewed', 'New course schedule', 'Parent meeting notes'].map((item) => (
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4" key={item}>
                <strong>{item}</strong>
                <p className="mt-1 text-sm text-slate-300">Shared with the right people at the right time.</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default Home;
