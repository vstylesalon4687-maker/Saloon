"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent } from "@/components/ui/Card";
import { Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate login
        setTimeout(() => {
            setLoading(false);
            router.push("/");
        }, 1000);
    };

    return (
        <Card className="border shadow-xl">
            <CardContent className="pt-6">
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div className="space-y-1">
                            <Label htmlFor="username">Username</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="pl-10"
                                    placeholder="Admin or Staff ID"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="pl-10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-600"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-gray-900">
                                Remember me
                            </label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="font-medium text-pink-600 hover:text-pink-500">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-pink-600 hover:bg-pink-700 shadow-lg shadow-pink-200"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
