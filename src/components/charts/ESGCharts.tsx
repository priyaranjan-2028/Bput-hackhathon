import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';

const SCOPE_COLORS = ['#dc2626', '#2563eb', '#9333ea'];

export interface ScopeChartProps {
  scope1: number;
  scope2: number;
  scope3: number;
  height?: number;
}

export function ScopeDonutChart({ scope1, scope2, scope3 }: ScopeChartProps) {
  const data = [
    { name: 'Scope 1', value: scope1 },
    { name: 'Scope 2', value: scope2 },
    { name: 'Scope 3', value: scope3 },
  ];
  const total = scope1 + scope2 + scope3;

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-navy-700 mb-4">GHG Emissions by Scope</h3>
      <div className="flex items-center gap-6">
        <div className="w-40 h-40 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                {data.map((_, i) => <Cell key={i} fill={SCOPE_COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-navy-900">{total.toFixed(0)}</span>
            <span className="text-[10px] text-navy-400">tCO2e</span>
          </div>
        </div>
        <div className="space-y-3 flex-1">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SCOPE_COLORS[i] }} />
                <span className="text-sm text-navy-600">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-navy-800">{item.value.toFixed(1)} tCO2e</span>
                <span className="text-xs text-navy-400 ml-2">({total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Alias for EmissionsBreakdownChart
export function EmissionsBreakdownChart({ scope1, scope2, scope3, height = 200 }: ScopeChartProps) {
  const data = [
    { name: 'Scope 1 (Direct)', value: scope1 },
    { name: 'Scope 2 (Electricity)', value: scope2 },
    { name: 'Scope 3 (Value Chain)', value: scope3 },
  ];

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
            {data.map((_, i) => (
              <Cell key={i} fill={SCOPE_COLORS[i % SCOPE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ScopeBarChart component
export function ScopeBarChart({ data, height = 260 }: { data: { name: string; value: number }[]; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="value" name="tCO₂e" fill="#102a43" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// TrendLineChart component
export function TrendLineChart({ data, height = 260 }: { data: { period: string; value: number }[]; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
          <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface SubsidiaryChartData {
  name: string;
  scope1: number;
  scope2: number;
  scope3: number;
}

export function SubsidiaryComparisonChart({ data }: { data: SubsidiaryChartData[] }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-navy-700 mb-4">Emissions by Subsidiary</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#627d98' }} />
          <YAxis tick={{ fontSize: 11, fill: '#627d98' }} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="scope1" name="Scope 1" fill="#dc2626" radius={[2, 2, 0, 0]} />
          <Bar dataKey="scope2" name="Scope 2" fill="#2563eb" radius={[2, 2, 0, 0]} />
          <Bar dataKey="scope3" name="Scope 3" fill="#9333ea" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface ProgressData {
  name: string;
  submitted: number;
  approved: number;
  pending: number;
}

export function SubmissionProgressChart({ data }: { data: ProgressData[] }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-navy-700 mb-4">Submission Progress</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" barGap={1}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#627d98' }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#627d98' }} width={100} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="approved" name="Approved" fill="#059669" radius={[0, 2, 2, 0]} stackId="stack" />
          <Bar dataKey="submitted" name="Submitted" fill="#2563eb" radius={[0, 2, 2, 0]} stackId="stack" />
          <Bar dataKey="pending" name="Pending" fill="#d1d5db" radius={[0, 2, 2, 0]} stackId="stack" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface EmissionsTrendData {
  month: string;
  scope1: number;
  scope2: number;
  scope3: number;
}

export function EmissionsTrendChart({ data }: { data: EmissionsTrendData[] }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-navy-700 mb-4">Emissions Trend (FY 2025-26)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#627d98' }} />
          <YAxis tick={{ fontSize: 11, fill: '#627d98' }} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Area type="monotone" dataKey="scope1" name="Scope 1" stroke="#dc2626" fill="#dc262620" strokeWidth={2} />
          <Area type="monotone" dataKey="scope2" name="Scope 2" stroke="#2563eb" fill="#2563eb20" strokeWidth={2} />
          <Area type="monotone" dataKey="scope3" name="Scope 3" stroke="#9333ea" fill="#9333ea20" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
