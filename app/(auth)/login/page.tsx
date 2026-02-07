"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent } from "@/components/ui/Card";
import { Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
import Link from "next/link";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
=======

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
>>>>>>> fe145a2ba9e18c235e6d78aaa01bd73397c39c6b
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
<<<<<<< HEAD
        setError("");

        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem('username') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/");
        } catch (err: any) {
            console.error(err);
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
=======
        // Simulate login
        setTimeout(() => {
            setLoading(false);
            router.push("/");
        }, 1000);
>>>>>>> fe145a2ba9e18c235e6d78aaa01bd73397c39c6b
    };

    return (
        <Card className="border shadow-xl">
            <CardContent className="pt-6">
                <form className="space-y-6" onSubmit={handleLogin}>
<<<<<<< HEAD
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-200">
                            {error}
                        </div>
                    )}
=======
>>>>>>> fe145a2ba9e18c235e6d78aaa01bd73397c39c6b
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
<<<<<<< HEAD

                    <div className="text-center text-sm">
                        <span className="text-gray-600">Don't have an account? </span>
                        <Link href="/register" className="font-medium text-pink-600 hover:text-pink-500">
                            Sign up
                        </Link>
                    </div>
=======
>>>>>>> fe145a2ba9e18c235e6d78aaa01bd73397c39c6b
                </form>
            </CardContent>
        </Card>
    );
}
