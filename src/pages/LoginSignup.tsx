import type { FormEvent } from "react";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import attendigoBg2 from "@/assets/attendigo_bg2.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { getAccessToken } from "@/utils/supabase";

type FieldErrors = {
  email?: string;
  password?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const validate = () => {
    const errors: FieldErrors = {};

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const submitter = (event.nativeEvent as SubmitEvent).submitter as
      | HTMLButtonElement
      | null;

    const action = submitter?.dataset.action === "signup" ? "signup" : "login";

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (action === "signup") {
        await signup(email.trim(), password);
        setSuccessMessage(
          "Success! Check your email to verify your account before logging in.",
        );
        setIsLogin(true);
        setPassword("");
        return;
      }

      await login(email.trim(), password);

      const token = await getAccessToken();

      if (token) {
        console.info("Supabase access token", token);
      }

      navigate("/take-attendance");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${attendigoBg2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
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
            {isLogin ? "Login" : "Sign Up"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1">
              <Label htmlFor="email" className="sr-only">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-10"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  autoComplete="email"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p id="email-error" className="text-sm text-destructive">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-10"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? "password-error" : undefined
                  }
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                />
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="text-sm text-destructive">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {formError && (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            )}
            {successMessage && (
              <p className="text-sm text-emerald-500" role="status">
                {successMessage}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                variant={isLogin ? "default" : "outline"}
                onClick={() => setIsLogin(true)}
                data-action="login"
                disabled={isSubmitting}
              >
                {isSubmitting && isLogin ? "Loading..." : "Login"}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                variant={!isLogin ? "secondary" : "outline"}
                onClick={() => setIsLogin(false)}
                data-action="signup"
                disabled={isSubmitting}
              >
                {isSubmitting && !isLogin ? "Loading..." : "Sign Up"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginSignup;
