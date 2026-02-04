import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CreditCard, IndianRupee, Receipt, Calendar } from "lucide-react";

export default function Dashboard() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome back to VStyles Saloon.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-pink-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-pink-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">₹45,231.89</div>
                        <p className="text-xs text-gray-500 mt-1">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Bills</CardTitle>
                        <Receipt className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">+2,350</div>
                        <p className="text-xs text-gray-500 mt-1">+180.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Today's Sales</CardTitle>
                        <Calendar className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">₹12,234</div>
                        <p className="text-xs text-gray-500 mt-1">+19% from yesterday</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-cyan-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Active Staff</CardTitle>
                        <CreditCard className="h-4 w-4 text-cyan-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">12</div>
                        <p className="text-xs text-gray-500 mt-1">Currently clocked in</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-sm border border-gray-100">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {[
                                { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: '₹1,999.00', initials: 'OM' },
                                { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: '₹2,500.00', initials: 'IN' },
                                { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: '₹1,200.00', initials: 'SD' },
                                { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: '₹3,400.00', initials: 'JL' },
                                { name: 'William Kim', email: 'will.kim@email.com', amount: '₹950.00', initials: 'WK' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center group cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="h-9 w-9 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                                        <span className="text-pink-600 font-bold text-xs">{item.initials}</span>
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none text-gray-900">{item.name}</p>
                                        <p className="text-xs text-muted-foreground text-gray-500">{item.email}</p>
                                    </div>
                                    <div className="ml-auto font-medium text-gray-900">{item.amount}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 shadow-sm border border-gray-100">
                    <CardHeader>
                        <CardTitle>Top Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {['Hair Cut', 'Facial', 'Hair Color', 'Manicure', 'Pedicure'].map((service, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-700">{service}</span>
                                        <span className="text-gray-500">{80 - (i * 10)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full" style={{ width: `${80 - (i * 10)}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
