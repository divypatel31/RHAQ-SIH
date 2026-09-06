import React from "react";

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-ink/60 mt-1.5 max-w-xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ className = "" }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="text-center py-16 border border-dashed border-line rounded-lg">
      <p className="text-sm font-medium text-ink/70">{title}</p>
      {description && <p className="text-sm text-ink/45 mt-1">{description}</p>}
    </div>
  );
}

// Status is encoded as a left border accent + text color, not a pill badge —
// this is a structural device tied to real referral/follow-up state, used
// consistently everywhere a status appears so it reads as one language.
const STATUS_TOKENS = {
  referred: { border: "border-teal-500", text: "text-teal-600", label: "Referred" },
  travel_in_progress: { border: "border-teal-400", text: "text-teal-500", label: "Travelling" },
  arrived: { border: "border-amber-500", text: "text-amber-500", label: "Arrived" },
  seen: { border: "border-amber-500", text: "text-amber-500", label: "Seen" },
  completed: { border: "border-teal-600", text: "text-teal-600", label: "Completed" },
  missed: { border: "border-rose-500", text: "text-rose-500", label: "Missed" },

  on_track: { border: "border-teal-500", text: "text-teal-600", label: "On track" },
  due: { border: "border-amber-500", text: "text-amber-500", label: "Due" },
  overdue: { border: "border-clay-500", text: "text-clay-500", label: "Overdue" },
  closed: { border: "border-line", text: "text-ink/40", label: "Closed" },

  open: { border: "border-rose-500", text: "text-rose-500", label: "Open" },
  acknowledged: { border: "border-amber-500", text: "text-amber-500", label: "Acknowledged" },
  dispatched: { border: "border-teal-400", text: "text-teal-500", label: "Dispatched" },
  resolved: { border: "border-teal-600", text: "text-teal-600", label: "Resolved" },

  scheduled: { border: "border-teal-500", text: "text-teal-600", label: "Scheduled" },
  cancelled: { border: "border-line", text: "text-ink/40", label: "Cancelled" },
};

export function StatusTag({ status }) {
  const token = STATUS_TOKENS[status] || { border: "border-line", text: "text-ink/50", label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1 text-xs font-medium border-l-2 ${token.border} ${token.text} bg-ink/[0.02]`}>
      {token.label}
    </span>
  );
}

export function getStatusToken(status) {
  return STATUS_TOKENS[status] || { border: "border-line", text: "text-ink/50", label: status };
}

export function Card({ children, className = "", accentClass = "" }) {
  return (
    <div className={`bg-white border border-line rounded-md ${accentClass ? `border-l-4 ${accentClass}` : ""} ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white border border-line rounded-md p-5">
      <p className="text-xs font-medium text-ink/50 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-semibold text-ink mt-2 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-ink/45 mt-1">{sub}</p>}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-teal-500 text-white hover:bg-teal-600",
    secondary: "bg-white text-ink border border-line hover:border-ink/30",
    danger: "bg-white text-rose-500 border border-rose-500/30 hover:bg-rose-50",
    ghost: "text-ink/60 hover:text-ink",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function FormField({ label, required, children, error }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-ink/80 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

export function Input(props) {
  return (
    <input
      className="w-full px-3.5 py-2.5 border border-line rounded-md text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
      {...props}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      className="w-full px-3.5 py-2.5 border border-line rounded-md text-sm text-ink bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea(props) {
  return (
    <textarea
      className="w-full px-3.5 py-2.5 border border-line rounded-md text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
      {...props}
    />
  );
}

export function Banner({ children, variant = "info" }) {
  const variants = {
    info: "bg-teal-50 text-teal-700 border-teal-500",
    warning: "bg-amber-50 text-amber-700 border-amber-500",
    error: "bg-rose-50 text-rose-700 border-rose-500",
  };
  return (
    <div className={`border-l-2 px-4 py-3 text-sm mb-6 ${variants[variant]}`}>
      {children}
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className={`relative bg-white rounded-lg border border-line w-full ${width} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-lg leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-6 border-b border-line mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            active === tab.value ? "border-teal-500 text-ink" : "border-transparent text-ink/45 hover:text-ink/70"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
