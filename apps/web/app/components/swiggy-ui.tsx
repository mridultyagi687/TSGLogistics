import type { ReactNode } from "react";

// Modern color palette
export const colors = {
  primary: "#6366F1", // Indigo
  primaryDark: "#4F46E5",
  primaryLight: "#818CF8",
  secondary: "#8B5CF6", // Purple
  accent: "#3B82F6", // Blue
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  gray: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121"
  }
};

export function SwiggyCard({
  children,
  className = "",
  padding = "p-6",
  hover = true
}: {
  children: ReactNode;
  className?: string;
  padding?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm ${padding} ${
        hover ? "transition-all hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SwiggyButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: "bg-[#6366F1] text-white hover:bg-[#4F46E5] shadow-md",
    secondary: "bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-md",
    outline: "bg-white dark:bg-gray-800 text-[#6366F1] dark:text-indigo-400 border-2 border-[#6366F1] dark:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
    ghost: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
    danger: "bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-md"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={`rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SwiggyBadge({
  children,
  variant = "default"
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const variants = {
    default: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
    success: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    danger: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    info: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

export function SwiggyStatCard({
  label,
  value,
  icon,
  trend
}: {
  label: string;
  value: string | number;
  icon?: string;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <SwiggyCard className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p
              className={`mt-1 text-sm font-medium ${
                trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-3xl">
            {icon}
          </div>
        )}
      </div>
    </SwiggyCard>
  );
}

export function SwiggyInput({
  label,
  className = "",
  ...props
}: {
  label?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 ${className}`}
        {...props}
      />
    </div>
  );
}

export function SwiggyTextarea({
  label,
  className = "",
  ...props
}: {
  label?: string;
  className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        className={`w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 ${className}`}
        {...props}
      />
    </div>
  );
}

