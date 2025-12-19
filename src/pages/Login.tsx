import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("staff");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Please check your credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await register(email, password, name, role);
      if (result.success) {
        toast({
          title: "Account created!",
          description: `Registered as ${role}`,
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Registration failed",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">ThaiDriveSecure</h1>
          <p className="text-muted-foreground mt-2">
            Staff & Admin Dashboard
          </p>
        </div>

        {/* Login/Register Card */}
        <Card className="shadow-lg border-border/50">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="space-y-1 pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              {/* Login Tab */}
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="name@thaidrivesecure.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="name@thaidrivesecure.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Role</Label>
                    <RadioGroup
                      value={role}
                      onValueChange={(value: UserRole) => setRole(value)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <Label
                        htmlFor="staff"
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          role === "staff"
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <RadioGroupItem value="staff" id="staff" className="sr-only" />
                        <span className="text-sm font-medium">Staff</span>
                        <span className="text-xs text-muted-foreground">
                          Operational access
                        </span>
                      </Label>
                      <Label
                        htmlFor="admin"
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          role === "admin"
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <RadioGroupItem value="admin" id="admin" className="sr-only" />
                        <span className="text-sm font-medium">Admin</span>
                        <span className="text-xs text-muted-foreground">
                          Full access
                        </span>
                      </Label>
                    </RadioGroup>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2024 ThaiDriveSecure. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
