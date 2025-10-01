import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import attendigoBg2 from "@/assets/attendigo_bg2.png";

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, signup, user } = useAuthContext();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/attendance');
    }
  }, [user, navigate]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error: loginError } = await login(email, password);
        if (loginError) {
          setError(loginError.message || 'Invalid email or password');
        } else {
          navigate('/attendance');
        }
      } else {
        if (!fullName.trim()) {
          setError('Full name is required');
          setIsSubmitting(false);
          return;
        }
        const { error: signupError } = await signup(email, password, fullName);
        if (signupError) {
          setError(signupError.message || 'Failed to create account');
        } else {
          navigate('/attendance');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                  aria-label="Full Name"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                onBlur={() => validateEmail(email)}
                className="pl-10"
                disabled={isSubmitting}
                aria-label="Email"
                aria-invalid={!!emailError}
              />
              {emailError && (
                <p className="text-xs text-destructive mt-1">{emailError}</p>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                onBlur={() => validatePassword(password)}
                className="pl-10"
                disabled={isSubmitting}
                aria-label="Password"
                aria-invalid={!!passwordError}
              />
              {passwordError && (
                <p className="text-xs text-destructive mt-1">{passwordError}</p>
              )}
            </div>
            
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1"
                variant={isLogin ? "default" : "outline"}
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                  setEmailError('');
                  setPasswordError('');
                }}
                disabled={isSubmitting}
              >
                {isSubmitting && isLogin ? 'Logging in...' : 'Login'}
              </Button>
              <Button 
                type="button" 
                className="flex-1"
                variant={!isLogin ? "secondary" : "outline"}
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                  setEmailError('');
                  setPasswordError('');
                }}
                disabled={isSubmitting}
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