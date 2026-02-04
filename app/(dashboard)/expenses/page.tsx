import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search, MoreVertical, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function ExpensesPage() {
    const expenses = [
        { id: 1, title: "Utility Bill", category: "Utilities", amount: 1500, date: "2023-10-01", status: "Paid" },
        { id: 2, title: "Hair Products Stock", category: "Inventory", amount: 5000, date: "2023-10-05", status: "Paid" },
        { id: 3, title: "Cleaning Service", category: "Maintenance", amount: 1200, date: "2023-10-10", status: "Pending" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Expenses</h1>
                    <p className="text-gray-500">Track salon expenditures.</p>
                </div>
                <Button className="bg-pink-600 hover:bg-pink-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Expense
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingUp className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹7,700</div>
                        <p className="text-xs text-muted-foreground mt-1 text-gray-500">For this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        <TrendingDown className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹37,531</div>
                        <p className="text-xs text-muted-foreground mt-1 text-gray-500">Revenue - Expenses</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>Expense History</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input placeholder="Search expenses..." className="pl-8" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Expense</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{expense.title}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200">{expense.category}</span>
                                        </td>
                                        <td className="px-6 py-4">{expense.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded border ${expense.status === 'Paid' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>{expense.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium">₹{expense.amount}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
