"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Search, MoreVertical, TrendingDown, Wallet, PieChart, CreditCard, Banknote, Calendar, Save, TrendingUp, Smartphone, Trash2, Edit } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function ExpensesPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [editingStatusId, setEditingStatusId] = useState<string | null>(null);

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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (openDropdown) setOpenDropdown(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openDropdown]);

    const handleEdit = (expense: any) => {
        setIsEditMode(true);
        setEditingExpenseId(expense.id);
        setNewExpense({
            title: expense.title,
            category: expense.category,
            amount: expense.amount.toString(),
            date: expense.date,
            method: expense.method,
            status: expense.status
        });
        setIsAddModalOpen(true);
        setOpenDropdown(null);
    };

    const handleSave = async () => {
        if (!newExpense.title || !newExpense.amount) return;
        try {
            if (isEditMode && editingExpenseId) {
                // Update existing expense
                await updateDoc(doc(db, "expenses", editingExpenseId), {
                    ...newExpense,
                    amount: Number(newExpense.amount),
                    updatedAt: new Date()
                });
            } else {
                // Add new expense
                await addDoc(collection(db, "expenses"), {
                    ...newExpense,
                    amount: Number(newExpense.amount),
                    createdAt: new Date()
                });
            }
            setIsAddModalOpen(false);
            setIsEditMode(false);
            setEditingExpenseId(null);
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

    const handleDelete = async (expenseId: string) => {
        try {
            await deleteDoc(doc(db, "expenses", expenseId));
            setDeleteConfirmId(null);
            setOpenDropdown(null);
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    const handleStatusChange = async (expenseId: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, "expenses", expenseId), {
                status: newStatus,
                updatedAt: new Date()
            });
            setEditingStatusId(null);
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    return (
        <div className="space-y-6 animate-fade-in p-2">

            {/* --- TOP ROW METRICS --- */}
            {/* --- TOP ROW METRICS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Expenses */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all flex items-center min-h-[100px] group">
                    <div className="bg-rose-50 p-3 rounded-full mr-4 text-rose-600 group-hover:scale-110 transition-transform">
                        <TrendingDown className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">₹{totalExpenses.toLocaleString()}</h3>
                        <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                    </div>
                </div>

                {/* Pending */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all flex items-center min-h-[100px] group">
                    <div className="bg-amber-50 p-3 rounded-full mr-4 text-amber-600 group-hover:scale-110 transition-transform">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                            ₹{expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()}
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground">Pending Bills</p>
                    </div>
                </div>

                {/* Categories */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all flex items-center min-h-[100px] group">
                    <div className="bg-teal-50 p-3 rounded-full mr-4 text-teal-600 group-hover:scale-110 transition-transform">
                        <PieChart className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {new Set(expenses.map(e => e.category)).size}
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground">Active Categories</p>
                    </div>
                </div>

                {/* Today's Expense */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all flex items-center min-h-[100px] group">
                    <div className="bg-blue-50 p-3 rounded-full mr-4 text-blue-600 group-hover:scale-110 transition-transform">
                        <Banknote className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                            ₹{expenses
                                .filter(e => e.date === new Date().toISOString().split('T')[0])
                                .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
                                .toLocaleString()}
                        </h3>
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
                        {(() => {
                            const catStats = expenses.reduce((acc, curr) => {
                                acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
                                return acc;
                            }, {} as Record<string, number>);

                            const sortedCats = (Object.entries(catStats) as [string, number][])
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 5);

                            const maxVal = sortedCats[0]?.[1] || 1;

                            if (sortedCats.length === 0) return <div className="text-center text-muted-foreground py-8">No data available</div>;

                            return sortedCats.map(([cat, amount]) => (
                                <div key={cat} className="group">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-foreground">{cat}</span>
                                        <span className="font-bold text-foreground">₹{amount.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500 rounded-full transition-all duration-500 group-hover:bg-purple-600"
                                            style={{ width: `${(amount / maxVal) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* Expense Details (Daily Chart) */}
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
                    </div>
                    <div className="h-[200px] flex items-end justify-between gap-2 px-2 pb-2">
                        {(() => {
                            // Generate last 7 days
                            const last7Days = Array.from({ length: 7 }, (_, i) => {
                                const d = new Date();
                                d.setDate(d.getDate() - (6 - i));
                                return d.toISOString().split('T')[0];
                            });

                            const dailyTotals = last7Days.map(date => ({
                                date,
                                day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                                amount: expenses
                                    .filter(e => e.date === date)
                                    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
                            }));

                            const maxAmount = Math.max(...dailyTotals.map(d => d.amount), 1); // Avoid div by zero

                            return dailyTotals.map((d) => (
                                <div key={d.date} className="flex flex-col items-center gap-2 group cursor-pointer w-full h-full justify-end">
                                    <div className="relative w-full flex flex-col justify-end h-full">
                                        {/* Tooltip */}
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded transition-opacity whitespace-nowrap z-10">
                                            ₹{d.amount.toLocaleString()}
                                        </div>
                                        <div
                                            className="w-full bg-blue-100 rounded-t-lg hover:bg-blue-500 transition-all duration-300 relative"
                                            style={{ height: `${Math.max((d.amount / maxAmount) * 100, 4)}%` }} // Min height 4% for Empty days visibility
                                        >
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium">{d.day}</span>
                                </div>
                            ));
                        })()}
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
            <div className="bg-card rounded-2xl shadow-sm border border-border">
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
                <div className="overflow-x-auto overflow-y-visible">
                    <table className="w-full text-sm text-left relative">
                        <thead className="bg-accent text-accent-foreground uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Expense Title</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
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
                                        {editingStatusId === expense.id ? (
                                            <select
                                                autoFocus
                                                value={expense.status}
                                                onChange={(e) => handleStatusChange(expense.id, e.target.value)}
                                                onBlur={() => setEditingStatusId(null)}
                                                className="text-xs font-semibold px-2.5 py-1 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            >
                                                <option value="Paid">Paid</option>
                                                <option value="Pending">Pending</option>
                                            </select>
                                        ) : (
                                            <span
                                                onClick={() => setEditingStatusId(expense.id)}
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-all hover:shadow-md ${expense.status === 'Paid'
                                                    ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
                                                    }`}
                                            >
                                                {expense.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-foreground">₹{expense.amount}</td>
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
                title={isEditMode ? "Edit Expense" : "Add New Expense"}
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
                            <Save className="w-4 h-4 mr-2" /> {isEditMode ? "Update Expense" : "Save Expense"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* --- DELETE CONFIRMATION MODAL --- */}
            <Modal
                isOpen={deleteConfirmId !== null}
                onClose={() => setDeleteConfirmId(null)}
                title="Delete Expense"
            >
                <div className="p-6">
                    <p className="text-gray-700 mb-6">
                        Are you sure you want to delete this expense? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            className="rounded-md"
                            onClick={() => setDeleteConfirmId(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white rounded-md"
                            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div >
    );
}
