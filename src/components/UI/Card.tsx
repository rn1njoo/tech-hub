import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className = "", onClick }: CardProps) => {
  return (
    <div
      className={`py-3 mb-4 border-b border-black ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
