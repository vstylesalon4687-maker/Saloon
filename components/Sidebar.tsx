"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Receipt, Users, CreditCard, UserCog, LogOut, X } from "lucide-react";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/billing", label: "Billing", icon: Receipt },
        { href: "/customers", label: "Customers", icon: Users },
        { href: "/expenses", label: "Expenses", icon: CreditCard },
        { href: "/staff", label: "Staff", icon: UserCog },
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
                    "fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 pt-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex justify-end p-2 md:hidden">
                    <button onClick={onClose} className="p-2 text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex h-full flex-col overflow-y-auto bg-white px-4 pb-6">
                    <div className="mb-8 mt-4 md:mt-6 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <div className="w-52 h-32 relative mb-4">
                                <img src="/vstyles-logo.png" alt="VStyles Logo" className="object-contain w-full h-full" />
                            </div>
                        </div>
                    </div>
                    <ul className="space-y-2 font-medium flex-1">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        onClick={onClose}
                                        className={cn(
                                            "flex items-center rounded-xl p-3 text-gray-600 transition-all duration-200 hover:bg-pink-50 hover:text-pink-600 group",
                                            isActive && "bg-pink-50 text-pink-600 font-semibold shadow-sm"
                                        )}
                                    >
                                        <Icon className={cn("h-5 w-5 transition duration-75 text-gray-400 group-hover:text-pink-600", isActive && "text-pink-500")} />
                                        <span className="ml-3">{link.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <button className="flex w-full items-center rounded-xl p-3 text-gray-600 hover:bg-gray-50 transition-colors group">
                            <LogOut className="h-5 w-5 flex-shrink-0 text-gray-400 transition duration-75 group-hover:text-gray-900" />
                            <span className="ml-3 font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
