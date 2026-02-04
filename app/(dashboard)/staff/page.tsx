import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search, MoreVertical, BadgeCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function StaffPage() {
    const staff = [
        { id: 1, name: "Alice", role: "Stylist", phone: "1234567890", status: "Active" },
        { id: 2, name: "Bob", role: "Manager", phone: "1234567891", status: "Active" },
        { id: 3, name: "Charlie", role: "Assistant", phone: "1234567892", status: "On Leave" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Staff Management</h1>
                    <p className="text-gray-500">Manage your employees.</p>
                </div>
                <Button className="bg-pink-600 hover:bg-pink-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Staff
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {staff.map((member) => (
                    <Card key={member.id} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                        <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-lg">
                                    {member.name.charAt(0)}
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                            <p className="text-sm text-gray-500">{member.role}</p>

                            <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
                                <span className="text-gray-600">{member.phone}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {member.status}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
