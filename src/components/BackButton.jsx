import { ArrowLeft } from "lucide-react";

const BackButton = ({ onClick, className = "", children }) => (
  <button
    type="button"
    onClick={onClick || (() => window.history.back())}
    className={`p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center ${className}`}
  >
    <ArrowLeft className="h-5 w-5 text-gray-500" />
    {children && <span className="ml-2">{children}</span>}
  </button>
);

export default BackButton;
