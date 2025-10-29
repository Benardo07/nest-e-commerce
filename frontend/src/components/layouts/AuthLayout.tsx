import { PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';

export const AuthLayout = ({ children }: PropsWithChildren) => (
  <div className="flex min-h-screen bg-slate-900">
    <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-slate-900 p-16 text-white lg:flex">
      <div className="relative z-10 max-w-md space-y-6">
        <span className="inline-flex rounded-full bg-white/10 px-4 py-1 text-sm">C2C Marketplace</span>
        <h1 className="text-4xl font-bold">Connect buyers and sellers with trust.</h1>
        <p className="text-sm text-white/80">
          List products, negotiate in real time, and manage orders across the entire lifecycle with confidence and transparency.
        </p>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#ffffff11,_#00000077)]" />
    </div>
    <div className="flex flex-1 items-center justify-center bg-white px-6 py-24">
      <div className="w-full max-w-sm space-y-6">
        <NavLink to="/" className="text-2xl font-semibold text-indigo-600">
          C2C Marketplace
        </NavLink>
        {children}
      </div>
    </div>
  </div>
);
