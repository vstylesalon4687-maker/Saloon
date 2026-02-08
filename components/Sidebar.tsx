"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Receipt, Users, CreditCard, UserCog, LogOut, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
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
    const [isHovered, setIsHovered] = useState(false);

    // Effective state: expanded if not collapsed OR if hovered
    // On mobile, always expanded width when open
    const isExpanded = isOpen || (!isCollapsed) || isHovered;
    // On desktop, use collapsed width if not hovered and isCollapsed is true
    const currentWidth = (isCollapsed && !isHovered && !isOpen) ? "w-20" : "w-64";

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
                    "fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300 ease-in-out pt-0 flex flex-col shadow-none",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                    currentWidth
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Mobile Close */}
                <div className="flex justify-end p-2 md:hidden">
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Logo Area */}
                <div className="flex flex-col items-center justify-center py-8">
                    <div className={cn("relative transition-all duration-300", (!isExpanded && !isOpen) ? "w-20 h-20" : "w-64 h-32")}>
                        <img src="/vstyles-logo.png" alt="VStyles" className="object-contain w-full h-full" />
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
                                    title={!isExpanded ? link.label : ""}
                                    className={cn(
                                        "flex items-center px-4 py-3 transition-all duration-200 group mx-3 mb-1",
                                        (!isExpanded && !isOpen) ? "justify-center rounded-xl" : "rounded-xl",
                                        isActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium relative overflow-hidden"
                                            : "text-sidebar-foreground hover:bg-white hover:text-foreground",
                                    )}
                                >
                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                                    <Icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-gray-400 group-hover:text-foreground")} />
                                    {(isExpanded || isOpen) && (
                                        <span className="ml-3 truncate text-sm animate-slide-in-left">{link.label}</span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Bottom Actions */}
                <div className="mt-auto p-3 border-t border-gray-100 space-y-2">
                    <button
                        onClick={handleSignOut}
                        className={cn(
                            "flex w-full items-center p-3 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors rounded-lg group",
                            (!isExpanded && !isOpen) ? "justify-center" : ""
                        )}
                        title={!isExpanded ? "Sign Out" : ""}
                    >
                        <LogOut className="h-5 w-5 shrink-0 group-hover:text-red-500" />
                        {(isExpanded || isOpen) && <span className="ml-3 font-medium animate-slide-in-left">Sign Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
