"use client";
import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'drawer-right';
    overlayClassName?: string;
}

export function Modal({ isOpen, onClose, title, children, className = "", variant = 'default', overlayClassName }: ModalProps) {
    if (!isOpen) return null;

    const isDrawer = variant === 'drawer-right';

    return (
        <div
            className={cn(
                "fixed inset-0 z-[100] flex bg-black/50 backdrop-blur-sm animate-in fade-in duration-200",
                isDrawer ? "justify-end items-stretch" : "items-center justify-center",
                overlayClassName
            )}
            onClick={onClose}
        >
            <div
                className={cn(
                    "bg-white overflow-hidden flex flex-col shadow-xl animate-in duration-300",
                    isDrawer
                        ? "w-full md:w-[65%] h-full slide-in-from-right border-l border-gray-200"
                        : "w-full max-w-4xl max-h-[90vh] rounded-lg zoom-in-95 my-auto mx-4",
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="flex items-center justify-between p-4 border-b shrink-0 bg-white z-10 border-pink-100">
                        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-gray-100 rounded-full">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                )}
                {/* Special headerless close button for drawer if title is empty */}
                {!title && isDrawer && (
                    <div className="absolute top-2 right-2 z-50">
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 bg-white/50 hover:bg-gray-100 rounded-full shadow-sm border">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                )}

                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
