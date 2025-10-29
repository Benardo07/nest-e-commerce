import { clsx } from 'clsx';
import { HTMLAttributes } from 'react';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx(
      'rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:shadow-md',
      className,
    )}
    {...props}
  />
);
