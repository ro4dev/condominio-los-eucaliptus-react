import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  tone?: 'default' | 'blue' | 'green' | 'red';
}

const toneClass = { default: '', blue: 'blue', green: 'green', red: 'red' } as const;

export function StatCard({ label, value, tone = 'default' }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="label">{label}</div>
      <div className={'value ' + toneClass[tone]}>{value}</div>
    </div>
  );
}
