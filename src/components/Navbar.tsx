import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";

interface NavbarProps {
  showReportsButton?: boolean;
  showAttendanceButton?: boolean;
}

const Navbar = ({ showReportsButton, showAttendanceButton }: NavbarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    navigate('/');
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
            onClick={() => navigate('/attendance')}
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