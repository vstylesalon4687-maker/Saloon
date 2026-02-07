"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Receipt, Users, CreditCard, UserCog, LogOut, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed, toggleCollapse }: SidebarProps) {
    const pathname = usePathname();

    // Automatically close sidebar when route changes (mobile)
    useEffect(() => {
        if (isOpen && onClose) {
            onClose();
        }
    }, [pathname]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const links = [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/billing", label: "Billing", icon: Receipt },
        { href: "/customers", label: "Customers", icon: Users },
        { href: "/expenses", label: "Expenses", icon: CreditCard },
        { href: "/staff", label: "Employee", icon: UserCog },
    ];

    return (
        <>
            <div
                className={cn(
                    "fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen border-r border-gray-800 bg-[#162e42] transition-all duration-300 ease-in-out pt-0 flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                {/* Mobile Close */}
                <div className="flex justify-end p-2 md:hidden">
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-800 rounded-none">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Logo Area */}
                <div className="flex flex-col items-center justify-center py-6 border-b border-gray-700/50">
                    <div className={cn("relative transition-all duration-300", isCollapsed ? "w-10 h-10" : "w-40 h-20")}>
                        <img src="/vstyles-logo.png" alt="VStyles" className="object-contain w-full h-full invert brightness-0 grayscale" style={{ filter: 'brightness(0) invert(1)' }} />
                    </div>
                </div>

                {/* Navigation Links */}
                <ul className="flex-1 space-y-3 p-3 mt-4 overflow-y-auto overflow-x-hidden">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    title={isCollapsed ? link.label : ""}
                                    className={cn(
                                        "flex items-center p-3 text-gray-300 transition-all duration-200 hover:text-white group",
                                        isCollapsed ? "justify-center rounded-none" : "rounded-none",
                                        isActive && "bg-pink-500 text-white font-medium shadow-md",
                                        !isActive && "hover:bg-white/5"
                                    )}
                                >
                                    <Icon className={cn("h-6 w-6 shrink-0 transition-colors", isActive ? "text-white" : "text-gray-400 group-hover:text-white")} />
                                    {!isCollapsed && (
                                        <span className="ml-3 truncate">{link.label}</span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Bottom Actions */}
                <div className="mt-auto p-3 border-t border-gray-700/50 space-y-2">
                    {/* Toggle Button (Desktop Only) */}
                    <button
                        onClick={toggleCollapse}
                        className={cn(
                            "hidden md:flex items-center w-full p-3 text-gray-400 hover:bg-white/5 hover:text-white transition-colors rounded-none",
                            isCollapsed ? "justify-center" : ""
                        )}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                        {!isCollapsed && <span className="ml-3">Collapse</span>}
                    </button>

                    <button
                        onClick={handleSignOut}
                        className={cn(
                            "flex w-full items-center p-3 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors rounded-none group",
                            isCollapsed ? "justify-center" : ""
                        )}
                        title={isCollapsed ? "Sign Out" : ""}
                    >
                        <LogOut className="h-5 w-5 shrink-0 group-hover:text-red-400" />
                        {!isCollapsed && <span className="ml-3 font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
