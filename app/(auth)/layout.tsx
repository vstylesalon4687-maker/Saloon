export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-gray-100 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 animate-fade-in">
                <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 relative mb-4">
                        <img src="/vstyles-logo.png" alt="VStyles Logo" className="object-contain w-full h-full" />
                    </div>
                    <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        VStyles Saloon Management System
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
}
