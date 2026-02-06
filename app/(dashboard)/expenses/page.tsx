<<<<<<< HEAD
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
=======
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Search, MoreVertical, TrendingDown, Wallet, PieChart, CreditCard, Banknote, Calendar, Save, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

export default function ExpensesPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [newExpense, setNewExpense] = useState({
        title: "",
        category: "Utilities",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        method: "Cash",
        status: "Paid"
    });

    // Fetch Expenses
    useEffect(() => {
        const q = query(collection(db, "expenses"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setExpenses(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching expenses:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        if (!newExpense.title || !newExpense.amount) return;
        try {
            await addDoc(collection(db, "expenses"), {
                ...newExpense,
                amount: Number(newExpense.amount),
                createdAt: new Date()
            });
            setIsAddModalOpen(false);
            setNewExpense({
                title: "",
                category: "Utilities",
                amount: "",
                date: new Date().toISOString().split('T')[0],
                method: "Cash",
                status: "Paid"
            });
        } catch (error) {
            console.error("Error saving expense:", error);
        }
    };

    const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    return (
        <div className="space-y-6 animate-fade-in p-2">

            {/* --- TOP ROW METRICS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Expenses */}
                <div className="bg-[#ef5350] rounded-lg p-4 text-white flex items-center shadow-md min-h-[100px]">
                    <div className="bg-white/20 p-3 rounded-full mr-4">
                        <TrendingDown className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">{totalExpenses.toLocaleString()}</h3>
                        <p className="text-sm opacity-90">Total Expenses</p>
                    </div>
                </div>

                {/* Pending */}
                <div className="bg-[#ffa726] rounded-lg p-4 text-white flex items-center shadow-md min-h-[100px]">
                    <div className="bg-white/20 p-3 rounded-full mr-4">
                        <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">
                            {expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()}
                        </h3>
                        <p className="text-sm opacity-90">Pending Bills</p>
                    </div>
                </div>

                {/* Categories */}
                <div className="bg-[#26c6da] rounded-lg p-4 text-white flex items-center shadow-md min-h-[100px]">
                    <div className="bg-white/20 p-3 rounded-full mr-4">
                        <PieChart className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">
                            {new Set(expenses.map(e => e.category)).size}
                        </h3>
                        <p className="text-sm opacity-90">Categories</p>
                    </div>
                </div>

                {/* Monthly Budget */}
                <div className="bg-[#7e57c2] rounded-lg p-4 text-white flex items-center shadow-md min-h-[100px]">
                    <div className="bg-white/20 p-3 rounded-full mr-4">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">-</h3>
                        <p className="text-sm opacity-90">Budget Used</p>
                    </div>
                </div>
            </div>

            {/* --- MIDDLE SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Category Breakdown (Purple) */}
                <div className="bg-[#5e35b1] rounded-lg p-4 text-white shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <PieChart className="w-8 h-8" />
                            <div>
                                <h3 className="font-bold text-lg">Categories</h3>
                                <p className="text-xs opacity-80">Top 5 by Amount</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {/* Dynamic categories visualization is a bit complex for now, keeping simple map if needed or static placeholder for now as request was "connect firebase" */}
                        <div className="text-xs text-center opacity-80 py-4">
                            (Visualization coming soon)
                        </div>
                    </div>
                </div>

                {/* Expense Details (Chart Placeholder) */}
                <div className="bg-[#1e88e5] rounded-lg p-4 text-white shadow-md lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-8 h-8" />
                            <div>
                                <h3 className="font-bold text-lg">Daily Expenses</h3>
                                <p className="text-xs opacity-80">Last 7 Days</p>
                            </div>
                        </div>
                        <Button className="bg-white/20 hover:bg-white/30 text-white text-xs h-8">View Report</Button>
                    </div>
                    <div className="h-[150px] flex items-end justify-between gap-2 px-2 pb-2">
                        {/* Fake Bar Chart */}
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                            <div key={day} className="flex flex-col items-center gap-2 group cursor-pointer w-full">
                                <div
                                    className="w-full bg-white/30 rounded-t hover:bg-white/50 transition-all relative group-hover:shadow-lg"
                                    style={{ height: `${[20, 60, 40, 80, 30, 90, 50][i]}%` }}
                                >
                                </div>
                                <span className="text-xs opacity-80">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- PAYMENT MODES --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#00acc1] rounded-lg p-4 text-white flex items-center shadow-sm">
                    <div className="mr-3 p-2 bg-white/20 rounded-full"><Banknote className="w-5 h-5" /></div>
                    <div>
                        <h3 className="font-bold text-lg">
                            {expenses.filter(e => e.method === 'Cash').length}
                        </h3>
                        <p className="text-xs opacity-90">Cash Txns</p>
                    </div>
                </div>
                <div className="bg-[#e53935] rounded-lg p-4 text-white flex items-center shadow-sm">
                    <div className="mr-3 p-2 bg-white/20 rounded-full"><CreditCard className="w-5 h-5" /></div>
                    <div>
                        <h3 className="font-bold text-lg">
                            {expenses.filter(e => e.method === 'Bank Transfer').length}
                        </h3>
                        <p className="text-xs opacity-90">Bank Transfers</p>
                    </div>
                </div>
                <div className="bg-[#4285f4] rounded-lg p-4 text-white flex items-center shadow-sm">
                    <div className="mr-3 font-bold text-xs bg-white/20 px-2 py-1.5 rounded">GPay</div>
                    <div>
                        <h3 className="font-bold text-lg">
                            {expenses.filter(e => e.method === 'Online' || e.method === 'GPay').length}
                        </h3>
                        <p className="text-xs opacity-90">Online/GPay</p>
                    </div>
                </div>
                <div className="bg-[#8e24aa] rounded-lg p-4 text-white flex items-center shadow-sm">
                    <div className="mr-3 font-bold text-xs bg-white/20 px-2 py-1.5 rounded">Total</div>
                    <div><h3 className="font-bold text-lg">{expenses.length}</h3><p className="text-xs opacity-90">Transactions</p></div>
                </div>
            </div>


            {/* --- EXPENSE LIST TABLE --- */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
                    <h2 className="font-bold text-gray-700">Expense History</h2>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input placeholder="Search expenses..." className="pl-8 bg-white" />
                        </div>
                        <Button
                            className="bg-[#ec407a] hover:bg-[#d81b60] text-white"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Add</span>
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#263238] text-white uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-3">Expense Title</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Method</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && <tr><td colSpan={7} className="text-center py-4">Loading...</td></tr>}
                            {!loading && expenses.length === 0 && <tr><td colSpan={7} className="text-center py-4">No expenses found.</td></tr>}
                            {!loading && expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-800">{expense.title}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{expense.date}</td>
                                    <td className="px-6 py-4 text-gray-500">{expense.method}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${expense.status === 'Paid'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-700">₹{expense.amount}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- ADD EXPENSE MODAL --- */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Expense"
            >
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Title</label>
                        <Input
                            value={newExpense.title}
                            onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                            placeholder="e.g. Electricity Bill"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Amount</label>
                            <Input
                                type="number"
                                value={newExpense.amount}
                                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Date</label>
                            <Input
                                type="date"
                                value={newExpense.date}
                                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Category</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                                value={newExpense.category}
                                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                            >
                                <option value="Utilities">Utilities</option>
                                <option value="Inventory">Inventory</option>
                                <option value="Rent">Rent</option>
                                <option value="Salaries">Salaries</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Pantry">Pantry</option>
                                <option value="Marketing">Marketing</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Payment Method</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                                value={newExpense.method}
                                onChange={(e) => setNewExpense({ ...newExpense, method: e.target.value })}
                            >
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                                <option value="Online">Online</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Check">Check</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Status</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={newExpense.status === 'Paid'}
                                    onChange={() => setNewExpense({ ...newExpense, status: 'Paid' })}
                                    className="text-green-500 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Paid</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={newExpense.status === 'Pending'}
                                    onChange={() => setNewExpense({ ...newExpense, status: 'Pending' })}
                                    className="text-red-500 focus:ring-red-500"
                                />
                                <span className="text-sm text-gray-700">Pending</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t mt-4">
                        <Button variant="outline" className="mr-2" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button className="bg-[#ec407a] hover:bg-[#d81b60] text-white" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" /> Save Expense
                        </Button>
                    </div>
                </div>
            </Modal>
>>>>>>> 5556c9962706df7b3dd77b79a8df3756fb30048f
        </div>
    );
}
