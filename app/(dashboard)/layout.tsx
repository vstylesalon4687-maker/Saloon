"use client";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="flex bg-gray-50 min-h-screen">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 relative min-h-screen ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>

                {/* Mobile Header */}
                <header className="flex h-16 items-center border-b bg-white px-4 md:px-6 sticky top-0 z-20 shadow-sm md:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle Sidebar</span>
                    </Button>
                    <div className="ml-4 font-bold text-lg text-gray-800">VStyles Saloon</div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
