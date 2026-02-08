export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-100 via-purple-50 to-pink-100 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 animate-fade-in">
                <div className="flex flex-col items-center justify-center">
                    <div className="w-24 h-24 relative mb-4 drop-shadow-md">
                        <img src="/vstyles-logo.png" alt="VStyles Logo" className="object-contain w-full h-full" />
                    </div>
                    <h2 className="text-center text-3xl font-bold tracking-tight text-[#4a044e]">
                        Welcome to VStyles
                    </h2>
                    <p className="mt-2 text-center text-sm text-[#831843]">
                        Premium Spa & Salon Management
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
}
