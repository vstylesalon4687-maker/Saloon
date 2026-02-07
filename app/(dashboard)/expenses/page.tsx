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
                <div className="bg-[#ef5350] rounded-none p-4 text-white flex items-center shadow-md min-h-[100px]">
                    <div className="bg-white/20 p-3 rounded-none mr-4">
                        <TrendingDown className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">{totalExpenses.toLocaleString()}</h3>
                        <p className="text-sm opacity-90">Total Expenses</p>
                    </div>
                </div>

                {/* Pending */}
                <div className="bg-[#ffa726] rounded-none p-4 text-white flex items-center shadow-md min-h-[100px]">
                    <div className="bg-white/20 p-3 rounded-none mr-4">
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
                <div className="bg-[#26c6da] rounded-none p-4 text-white flex items-center shadow-md min-h-[100px]">
                    <div className="bg-white/20 p-3 rounded-none mr-4">
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
                <div className="bg-[#7e57c2] rounded-none p-4 text-white flex items-center shadow-md min-h-[100px]">
                    <div className="bg-white/20 p-3 rounded-none mr-4">
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
                <div className="bg-[#5e35b1] rounded-none p-4 text-white shadow-md">
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
                <div className="bg-[#1e88e5] rounded-none p-4 text-white shadow-md lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-8 h-8" />
                            <div>
                                <h3 className="font-bold text-lg">Daily Expenses</h3>
                                <p className="text-xs opacity-80">Last 7 Days</p>
                            </div>
                        </div>
                        <Button className="bg-white/20 hover:bg-white/30 text-white text-xs h-8 rounded-none">View Report</Button>
                    </div>
                    <div className="h-[150px] flex items-end justify-between gap-2 px-2 pb-2">
                        {/* Fake Bar Chart */}
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                            <div key={day} className="flex flex-col items-center gap-2 group cursor-pointer w-full">
                                <div
                                    className="w-full bg-white/30 rounded-none hover:bg-white/50 transition-all relative group-hover:shadow-lg"
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
                <div className="bg-[#00acc1] rounded-none p-4 text-white flex items-center shadow-sm">
                    <div className="mr-3 p-2 bg-white/20 rounded-none"><Banknote className="w-5 h-5" /></div>
                    <div>
                        <h3 className="font-bold text-lg">
                            {expenses.filter(e => e.method === 'Cash').length}
                        </h3>
                        <p className="text-xs opacity-90">Cash Txns</p>
                    </div>
                </div>
                <div className="bg-[#e53935] rounded-none p-4 text-white flex items-center shadow-sm">
                    <div className="mr-3 p-2 bg-white/20 rounded-none"><CreditCard className="w-5 h-5" /></div>
                    <div>
                        <h3 className="font-bold text-lg">
                            {expenses.filter(e => e.method === 'Bank Transfer').length}
                        </h3>
                        <p className="text-xs opacity-90">Bank Transfers</p>
                    </div>
                </div>
                <div className="bg-[#4285f4] rounded-none p-4 text-white flex items-center shadow-sm">
                    <div className="mr-3 font-bold text-xs bg-white/20 px-2 py-1.5 rounded-none">GPay</div>
                    <div>
                        <h3 className="font-bold text-lg">
                            {expenses.filter(e => e.method === 'Online' || e.method === 'GPay').length}
                        </h3>
                        <p className="text-xs opacity-90">Online/GPay</p>
                    </div>
                </div>
                <div className="bg-[#8e24aa] rounded-none p-4 text-white flex items-center shadow-sm">
                    <div className="mr-3 font-bold text-xs bg-white/20 px-2 py-1.5 rounded-none">Total</div>
                    <div><h3 className="font-bold text-lg">{expenses.length}</h3><p className="text-xs opacity-90">Transactions</p></div>
                </div>
            </div>


            {/* --- EXPENSE LIST TABLE --- */}
            <div className="bg-white rounded-none shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
                    <h2 className="font-bold text-gray-700">Expense History</h2>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input placeholder="Search expenses..." className="pl-8 bg-white rounded-none" />
                        </div>
                        <Button
                            className="bg-[#ec407a] hover:bg-[#d81b60] text-white rounded-none"
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
                                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-none text-xs font-medium border border-blue-100">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{expense.date}</td>
                                    <td className="px-6 py-4 text-gray-500">{expense.method}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-none ${expense.status === 'Paid'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-700">₹{expense.amount}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 rounded-none">
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
                            className="rounded-none"
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
                                className="rounded-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Date</label>
                            <Input
                                type="date"
                                value={newExpense.date}
                                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                className="rounded-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Category</label>
                            <select
                                className="w-full h-10 px-3 rounded-none border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
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
                                className="w-full h-10 px-3 rounded-none border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
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
                                    className="text-green-500 focus:ring-green-500 rounded-none"
                                />
                                <span className="text-sm text-gray-700">Paid</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={newExpense.status === 'Pending'}
                                    onChange={() => setNewExpense({ ...newExpense, status: 'Pending' })}
                                    className="text-red-500 focus:ring-red-500 rounded-none"
                                />
                                <span className="text-sm text-gray-700">Pending</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t mt-4">
                        <Button variant="outline" className="mr-2 rounded-none" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button className="bg-[#ec407a] hover:bg-[#d81b60] text-white rounded-none" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" /> Save Expense
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
