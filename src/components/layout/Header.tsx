import Link from "next/link";

interface HeaderProps {
  onResetFilter: () => void;
}

export const Header = ({ onResetFilter }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            onClick={onResetFilter}
            className="text-xl font-bold text-gray-900"
          >
            Tech Hub
          </Link>
        </div>
      </div>
    </header>
  );
};
