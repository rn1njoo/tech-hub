import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tech";
  size?: "sm" | "md";
}

export const Badge = ({
  children,
  variant = "primary",
  size = "md",
}: BadgeProps) => {
  const baseStyles = "inline-flex items-center rounded-full font-medium";
  const variantStyles = {
    primary: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    tech: "bg-purple-100 text-purple-800",
  };
  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
};
