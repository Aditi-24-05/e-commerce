
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { EmailConfirmationDialog } from "@/components/EmailConfirmationDialog";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                toast({
                    title: "Account created!",
                    description: "You can now sign in with your credentials.",
                });
                setIsSignUp(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast({
                    title: "Welcome back!",
                    description: "You have successfully signed in.",
                });
                // Show email confirmation dialog instead of navigating immediately
                setShowConfirmDialog(true);
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary/30 pb-12">
            <Header />
            <div className="container max-w-md mx-auto pt-20 px-4">
                <Card className="shadow-lg border-none">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center text-primary">
                            {isSignUp ? "Create an account" : "Welcome back"}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {isSignUp
                                ? "Enter your email below to create your account"
                                : "Enter your email to sign in to your account"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAuth} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <Button type="submit" className="w-full flipkart-btn-primary" disabled={isLoading}>
                                {isLoading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 text-center text-sm">
                        <div className="text-muted-foreground">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                            <button
                                className="text-primary font-medium hover:underline"
                                onClick={() => setIsSignUp(!isSignUp)}
                            >
                                {isSignUp ? "Sign In" : "Sign Up"}
                            </button>
                        </div>
                        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
                            Back to shopping
                        </Link>
                    </CardFooter>
                </Card>
            </div>
            <EmailConfirmationDialog
                open={showConfirmDialog}
                onOpenChange={(open) => {
                    setShowConfirmDialog(open);
                    if (!open) {
                        // Navigate to home when dialog is closed
                        navigate("/");
                    }
                }}
                email={email}
            />
        </div>
    );
}
