import React from 'react';
import { Link } from 'react-router-dom';
import { Tv, Home, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 shadow-xl shadow-indigo-600/20">
        <Tv className="w-8 h-8" />
      </div>

      <h1 className="text-4xl font-extrabold text-white font-heading mb-2">404 — Room Not Found</h1>
      <p className="text-sm text-zinc-400 max-w-md mb-8">
        The watch party room you're looking for doesn't exist, has ended, or the link is expired.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link to="/">
          <Button variant="primary" size="md">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <Link to="/join">
          <Button variant="secondary" size="md">
            <Search className="w-4 h-4 mr-2" />
            Join with Code
          </Button>
        </Link>
      </div>
    </div>
  );
};
