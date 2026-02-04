import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function CustomersPage() {
    const customers = [
        { id: 1, name: "Alice Johnson", mobile: "9876543210", email: "alice@email.com", visits: 5, lastVisit: "2023-10-15" },
        { id: 2, name: "Bob Wilson", mobile: "9876543211", email: "bob@email.com", visits: 2, lastVisit: "2023-10-12" },
        { id: 3, name: "Carol Smith", mobile: "9876543212", email: "carol@email.com", visits: 12, lastVisit: "2023-10-18" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Customers</h1>
                    <p className="text-gray-500">Manage your client base.</p>
                </div>
                <Button className="bg-pink-600 hover:bg-pink-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Customer
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>All Customers</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input placeholder="Search customers..." className="pl-8" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Contact</th>
                                    <th className="px-6 py-3">Visits</th>
                                    <th className="px-6 py-3">Last Visit</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span>{customer.mobile}</span>
                                                <span className="text-xs text-gray-500">{customer.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{customer.visits}</td>
                                        <td className="px-6 py-4">{customer.lastVisit}</td>
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
