"use client";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Menu } from "lucide-react";

<<<<<<< HEAD
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

=======
>>>>>>> fe145a2ba9e18c235e6d78aaa01bd73397c39c6b
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
<<<<<<< HEAD
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    if (!user) return null;
=======
>>>>>>> fe145a2ba9e18c235e6d78aaa01bd73397c39c6b

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-20 shadow-sm">
                <div className="flex items-center">
                    <div className="w-32 h-14 relative">
                        <img src="/vstyles-logo.png" alt="Logo" className="object-contain w-full h-full" />
                    </div>
                </div>
                <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="p-4 md:ml-64 min-h-screen transition-all duration-300">
                <main className="mx-auto max-w-7xl animate-fade-in py-2 md:py-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
