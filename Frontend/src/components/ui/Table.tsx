import React from 'react';
import { clsx } from 'clsx';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-dinora-border bg-white shadow-dinora">
      <table className={clsx('w-full text-left text-sm text-dinora-chocolate', className)}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <thead className={clsx('bg-dinora-bg/80 border-b border-dinora-border text-xs uppercase tracking-wider text-dinora-chocolate font-semibold', className)}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <tbody className={clsx('divide-y divide-dinora-border/60', className)}>{children}</tbody>;
};

export const TableRow: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        'transition-colors hover:bg-dinora-gold-light/20',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <th className={clsx('px-6 py-4 font-semibold', className)}>{children}</th>;
};

export const TableCell: React.FC<{ children: React.ReactNode; className?: string; colSpan?: number }> = ({
  children,
  className,
  colSpan,
}) => {
  return (
    <td colSpan={colSpan} className={clsx('px-6 py-4 align-middle', className)}>
      {children}
    </td>
  );
};
