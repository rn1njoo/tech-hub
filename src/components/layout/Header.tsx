import { Button } from "../UI";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">Tech Hub</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            최신순
          </Button>
          <Button variant="ghost" size="sm">
            인기순
          </Button>
        </div>
      </div>
    </header>
  );
};
