import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export const HomePage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#6366f11a,_#0f172a)]" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 text-center text-white">
        <span className="rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.3em] text-indigo-200">
          Community Marketplace
        </span>
        <h1 className="text-4xl font-semibold md:text-6xl">
          Sell smarter. Buy confidently. All in one modern C2C platform.
        </h1>
        <p className="max-w-2xl text-lg text-slate-200">
          Manage listings, negotiate with buyers in real time, and orchestrate order lifecycles with a unified control center built for peer-to-peer commerce.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/register">
            <Button>Create seller account</Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
