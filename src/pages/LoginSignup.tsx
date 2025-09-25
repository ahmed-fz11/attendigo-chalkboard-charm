import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import attendigoBg2 from "@/assets/attendigo_bg2.png";

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication
    navigate('/attendance');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${attendigoBg2})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Card className="w-full max-w-md shadow-lg backdrop-blur-sm bg-card/95">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <h1 className="text-3xl font-bold text-primary">AttendiGo</h1>
          </div>
          <CardTitle className="text-2xl text-primary">
            {isLogin ? 'Login' : 'Sign Up'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1"
                variant={isLogin ? "default" : "outline"}
                onClick={() => setIsLogin(true)}
              >
                Login
              </Button>
              <Button 
                type="button" 
                className="flex-1"
                variant={!isLogin ? "secondary" : "outline"}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginSignup;