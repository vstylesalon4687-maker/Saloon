"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Search, MoreVertical, TrendingDown, Wallet, PieChart, CreditCard, Banknote, Calendar, Save, TrendingUp, Smartphone } from "lucide-react";
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
            {/* --- TOP ROW METRICS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Expenses */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all flex items-center min-h-[100px]">
                    <div className="bg-rose-50 p-3 rounded-full mr-4 text-rose-600">
                        <TrendingDown className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">₹{totalExpenses.toLocaleString()}</h3>
                        <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                    </div>
                </div>

                {/* Pending */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all flex items-center min-h-[100px]">
                    <div className="bg-amber-50 p-3 rounded-full mr-4 text-amber-600">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">
                            ₹{expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()}
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground">Pending Bills</p>
                    </div>
                </div>

                {/* Categories */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all flex items-center min-h-[100px]">
                    <div className="bg-teal-50 p-3 rounded-full mr-4 text-teal-600">
                        <PieChart className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">
                            {new Set(expenses.map(e => e.category)).size}
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground">Active Categories</p>
                    </div>
                </div>

                {/* Today's Expense Placeholder - Blue */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all flex items-center min-h-[100px]">
                    <div className="bg-blue-50 p-3 rounded-full mr-4 text-blue-600">
                        <Banknote className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">₹0</h3>
                        <p className="text-sm font-medium text-muted-foreground">Today's Spend</p>
                    </div>
                </div>
            </div>

            {/* --- MIDDLE SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Category Breakdown */}
                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                    <div className="flex justify-between items-start mb-6 border-b border-border pb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600">
                                <PieChart className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-foreground">Categories</h3>
                                <p className="text-xs text-muted-foreground">Top 5 by Amount</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="text-sm text-center text-muted-foreground py-8 bg-muted/30 rounded-xl border border-border border-dashed">
                            Visualization coming soon
                        </div>
                    </div>
                </div>

                {/* Expense Details (Chart Placeholder) */}
                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border lg:col-span-2">
                    <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-foreground">Daily Expenses</h3>
                                <p className="text-xs text-muted-foreground">Last 7 Days</p>
                            </div>
                        </div>
                        <Button variant="outline" className="h-8 rounded-lg px-3 text-xs">View Report</Button>
                    </div>
                    <div className="h-[150px] flex items-end justify-between gap-2 px-2 pb-2">
                        {/* Fake Bar Chart */}
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                            <div key={day} className="flex flex-col items-center gap-2 group cursor-pointer w-full">
                                <div
                                    className="w-full bg-blue-100 rounded-t-md hover:bg-blue-200 transition-all relative group-hover:shadow-md"
                                    style={{ height: `${[20, 60, 40, 80, 30, 90, 50][i]}%` }}
                                >
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- PAYMENT MODES --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-2xl p-4 flex items-center shadow-sm border border-border hover:shadow-md transition-shadow">
                    <div className="mr-3 p-2 bg-teal-50 text-teal-600 rounded-xl"><Banknote className="w-5 h-5" /></div>
                    <div>
                        <h3 className="font-bold text-lg text-foreground">
                            {expenses.filter(e => e.method === 'Cash').length}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">Cash Txns</p>
                    </div>
                </div>
                <div className="bg-card rounded-2xl p-4 flex items-center shadow-sm border border-border hover:shadow-md transition-shadow">
                    <div className="mr-3 p-2 bg-rose-50 text-rose-600 rounded-xl"><CreditCard className="w-5 h-5" /></div>
                    <div>
                        <h3 className="font-bold text-lg text-foreground">
                            {expenses.filter(e => e.method === 'Bank Transfer').length}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">Bank Transfers</p>
                    </div>
                </div>
                <div className="bg-card rounded-2xl p-4 flex items-center shadow-sm border border-border hover:shadow-md transition-shadow">
                    <div className="mr-3 p-2 bg-blue-50 text-blue-600 rounded-xl"><Smartphone className="w-5 h-5" /></div>
                    <div>
                        <h3 className="font-bold text-lg text-foreground">
                            {expenses.filter(e => e.method === 'Online' || e.method === 'GPay').length}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">Online/GPay</p>
                    </div>
                </div>
                <div className="bg-card rounded-2xl p-4 flex items-center shadow-sm border border-border hover:shadow-md transition-shadow">
                    <div className="mr-3 p-2 bg-purple-50 text-purple-600 rounded-xl"><Wallet className="w-5 h-5" /></div>
                    <div><h3 className="font-bold text-lg text-foreground">{expenses.length}</h3><p className="text-xs text-muted-foreground font-medium">Transactions</p></div>
                </div>
            </div>


            {/* --- EXPENSE LIST TABLE --- */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="p-5 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-card">
                    <h2 className="font-bold text-foreground text-lg">Expense History</h2>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search expenses..." className="pl-9 bg-muted/50 border-input rounded-xl focus:bg-background transition-colors h-10" />
                        </div>
                        <Button
                            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm h-10 px-4"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Add</span>
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-accent text-accent-foreground uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Expense Title</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading && <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</td></tr>}
                            {!loading && expenses.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No expenses found.</td></tr>}
                            {!loading && expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground">{expense.title}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium border border-blue-100">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{expense.date}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{expense.method}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${expense.status === 'Paid'
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-red-100 text-red-700 border border-red-200'
                                            }`}>
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-foreground">₹{expense.amount}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
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
                            <label className="flex items-center gap-2 cursor-pointer bg-green-50 px-3 py-2 rounded-md border border-green-100">
                                <input
                                    type="radio"
                                    checked={newExpense.status === 'Paid'}
                                    onChange={() => setNewExpense({ ...newExpense, status: 'Paid' })}
                                    className="text-green-500 focus:ring-green-500"
                                />
                                <span className="text-sm font-medium text-green-700">Paid</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer bg-red-50 px-3 py-2 rounded-md border border-red-100">
                                <input
                                    type="radio"
                                    checked={newExpense.status === 'Pending'}
                                    onChange={() => setNewExpense({ ...newExpense, status: 'Pending' })}
                                    className="text-red-500 focus:ring-red-500"
                                />
                                <span className="text-sm font-medium text-red-700">Pending</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t mt-4">
                        <Button variant="outline" className="mr-2 rounded-md" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button className="bg-primary hover:bg-primary/90 text-white rounded-md" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" /> Save Expense
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
