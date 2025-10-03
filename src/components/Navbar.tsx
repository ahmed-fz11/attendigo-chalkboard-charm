import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  showReportsButton?: boolean;
  showAttendanceButton?: boolean;
  onLogout?: () => void;
}

const Navbar = ({ showReportsButton, showAttendanceButton, onLogout }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      }
    } catch (error) {
      console.error("Failed to log out", error);
    }

    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-card/90 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <span className="text-xl">📋</span>
        </div>
        <h1 className="text-2xl font-bold text-primary">AttendiGo</h1>
      </div>
      
      <div className="flex items-center gap-3">
        {showReportsButton && (
          <Button 
            variant="outline" 
            onClick={() => navigate('/reports')}
            className="hidden sm:flex"
          >
            Reports
          </Button>
        )}
        {showAttendanceButton && (
          <Button 
            variant="outline" 
            onClick={() => navigate('/take-attendance')}
            className="hidden sm:flex"
          >
            Take Attendance
          </Button>
        )}
        <Button variant="destructive" onClick={handleLogout} size="sm">
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
