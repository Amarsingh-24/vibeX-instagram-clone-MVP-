import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Sparkles, AlertCircle, User, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<string[]>([]);
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  // Load saved accounts on mount
  useEffect(() => {
    const accounts = JSON.parse(localStorage.getItem("vibeX_saved_accounts") || "[]");
    setSavedAccounts(accounts);
    const lastUsedEmail = localStorage.getItem("vibeX_last_email");
    if (lastUsedEmail && accounts.includes(lastUsedEmail)) {
      setEmail(lastUsedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateForm = (isSignUp: boolean) => {
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    
    if (isSignUp && username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }
    
    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(false)) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      // Save account if remember me is checked
      if (rememberMe) {
        const accounts = JSON.parse(localStorage.getItem("vibeX_saved_accounts") || "[]");
        if (!accounts.includes(email)) {
          accounts.push(email);
          localStorage.setItem("vibeX_saved_accounts", JSON.stringify(accounts));
        }
        localStorage.setItem("vibeX_last_email", email);
      }
      
      await signIn(email, password);
    } catch (error: any) {
      const message = error?.message || "Sign in failed. Please check your credentials.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(true)) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      await signUp(email, password, username);
    } catch (error: any) {
      const message = error?.message || "Account creation failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavedAccountClick = (savedEmail: string) => {
    setEmail(savedEmail);
    setRememberMe(true);
    // Focus password field
    setTimeout(() => {
      document.getElementById("signin-password")?.focus();
    }, 100);
  };

  const removeSavedAccount = (accountToRemove: string) => {
    const updatedAccounts = savedAccounts.filter(acc => acc !== accountToRemove);
    setSavedAccounts(updatedAccounts);
    localStorage.setItem("vibeX_saved_accounts", JSON.stringify(updatedAccounts));
    if (localStorage.getItem("vibeX_last_email") === accountToRemove) {
      localStorage.removeItem("vibeX_last_email");
    }
    if (email === accountToRemove) {
      setEmail("");
    }
    toast.success("Account removed");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);
    try {
      await resetPassword(resetEmail);
      toast.success("Password reset link sent! Check your email inbox.");
      setShowResetDialog(false);
      setResetEmail("");
    } catch (error: any) {
      // Provide more user-friendly error messages
      let errorMessage = "Failed to send reset email";
      if (error?.message?.includes("rate limit")) {
        errorMessage = "Too many requests. Please wait a few minutes and try again.";
      } else if (error?.message?.includes("not found")) {
        errorMessage = "No account found with this email address.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-neon rounded-2xl mb-4 shadow-neon-blue animate-pulse">
            <Zap className="w-10 h-10 text-background" />
          </div>
          <h1 className="text-5xl font-display font-bold text-white mb-2">
            vibeX
          </h1>
          <p className="text-muted-foreground text-lg">Share your moments, feel the vibe</p>
        </div>

        <Card className="shadow-neon-purple border-border/50 bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-display text-2xl text-foreground">Welcome</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in or create an account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                {savedAccounts.length > 0 && (
                  <div className="mt-4 mb-4">
                    <Label className="text-foreground text-sm mb-2 block">Saved Accounts</Label>
                    <div className="space-y-2">
                      {savedAccounts.map((account) => (
                        <div 
                          key={account}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-smooth cursor-pointer group"
                        >
                          <button
                            type="button"
                            onClick={() => handleSavedAccountClick(account)}
                            className="flex items-center gap-3 flex-1 text-left"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-neon flex items-center justify-center">
                              <User className="w-5 h-5 text-background" />
                            </div>
                            <span className="text-foreground font-medium">{account}</span>
                          </button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSavedAccount(account);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or use another account</span>
                      </div>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-foreground">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      required
                      disabled={isLoading}
                      className="transition-smooth bg-input border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-foreground">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      required
                      disabled={isLoading}
                      className="transition-smooth bg-input border-border focus:border-primary"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer">
                      Remember my email
                    </Label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-neon hover:opacity-90 transition-smooth shadow-neon-blue text-background font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>

                  <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="w-full text-sm text-muted-foreground hover:text-primary mt-2">
                        Forgot password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                          Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="you@example.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            disabled={isLoading}
                            className="transition-smooth bg-input border-border focus:border-primary"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-foreground">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError("");
                      }}
                      required
                      minLength={3}
                      maxLength={30}
                      disabled={isLoading}
                      className="transition-smooth bg-input border-border focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">At least 3 characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      required
                      disabled={isLoading}
                      className="transition-smooth bg-input border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      required
                      minLength={6}
                      disabled={isLoading}
                      className="transition-smooth bg-input border-border focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-neon hover:opacity-90 transition-smooth shadow-neon-pink text-background font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Creating account..."
                    ) : (
                      <>
                        Create Account
                        <Sparkles className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
