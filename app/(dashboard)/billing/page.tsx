"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Plus, Trash2, Printer, Save, Search, User, Receipt } from "lucide-react";

export default function BillingPage() {
    const [items, setItems] = useState([
        { id: 1, service: "", staff: "", price: 0, qty: 1 }
    ]);
    const [customer, setCustomer] = useState({ mobile: "", name: "", email: "" });
    const [discount, setDiscount] = useState({ type: "none", value: 0 });
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [currentDate, setCurrentDate] = useState<string>("");

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString());
    }, []);

    const services = [
        { id: "s1", name: "Haircut", price: 50 },
        { id: "s2", name: "Styling", price: 100 },
        { id: "s3", name: "Hair Color", price: 150 },
        { id: "s4", name: "Facial", price: 200 },
        { id: "s5", name: "Manicure", price: 80 },
        { id: "s6", name: "Pedicure", price: 90 },
    ];

    const staffList = [
        { id: "st1", name: "Alice (Stylist)" },
        { id: "st2", name: "Bob (Manager)" },
        { id: "st3", name: "Charlie (Assistant)" },
    ];

    const addItem = () => {
        setItems([...items, { id: Date.now(), service: "", staff: "", price: 0, qty: 1 }]);
    };

    const removeItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const updateItem = (id: number, field: string, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                if (field === "service") {
                    const selectedService = services.find(s => s.id === value);
                    return { ...item, service: value, price: selectedService ? selectedService.price : 0 };
                }
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        let discountAmount = 0;
        if (discount.type === "percentage") {
            discountAmount = subtotal * (discount.value / 100);
        } else if (discount.type === "amount") {
            discountAmount = discount.value;
        }
        return Math.max(0, subtotal - discountAmount);
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Billing Form */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-pink-500" />
                            Customer Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <div className="relative">
                                <Input
                                    id="mobile"
                                    placeholder="9876543210"
                                    value={customer.mobile}
                                    onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                                />
                                <Button size="icon" variant="ghost" className="absolute right-0 top-0 h-full">
                                    <Search className="w-4 h-4 text-gray-500" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Client Name</Label>
                            <Input
                                id="name"
                                placeholder="Name"
                                value={customer.name}
                                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-pink-500" />
                            Services
                        </CardTitle>
                        <Button size="sm" onClick={addItem} className="bg-pink-50 text-pink-600 hover:bg-pink-100 border-pink-200">
                            <Plus className="w-4 h-4 mr-1" /> Add Service
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.map((item, index) => (
                            <div key={item.id} className="grid gap-4 md:grid-cols-12 items-end border-b pb-4 last:border-0 last:pb-0 animate-fade-in relative">
                                <div className="md:col-span-4 space-y-1.5">
                                    <Label className={index !== 0 ? "md:hidden" : ""}>Service</Label>
                                    <Select
                                        value={item.service}
                                        onChange={(e) => updateItem(item.id, "service", e.target.value)}
                                    >
                                        <option value="">Select Service</option>
                                        {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </Select>
                                </div>
                                <div className="md:col-span-3 space-y-1.5">
                                    <Label className={index !== 0 ? "md:hidden" : ""}>Staff</Label>
                                    <Select
                                        value={item.staff}
                                        onChange={(e) => updateItem(item.id, "staff", e.target.value)}
                                    >
                                        <option value="">Select Staff</option>
                                        {staffList.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                                    </Select>
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <Label className={index !== 0 ? "md:hidden" : ""}>Price</Label>
                                    <Input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value))}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <Label className={index !== 0 ? "md:hidden" : ""}>Qty</Label>
                                    <Input
                                        type="number"
                                        value={item.qty}
                                        onChange={(e) => updateItem(item.id, "qty", parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="md:col-span-1 pt-2 md:pt-0">
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removeItem(item.id)}
                                        disabled={items.length === 1}
                                        className="w-full md:w-10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Discount Type</Label>
                            <Select
                                value={discount.type}
                                onChange={(e) => setDiscount({ ...discount, type: e.target.value })}
                            >
                                <option value="none">None</option>
                                <option value="percentage">Percentage (%)</option>
                                <option value="amount">Amount (₹)</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Discount Value</Label>
                            <Input
                                type="number"
                                value={discount.value}
                                onChange={(e) => setDiscount({ ...discount, value: parseFloat(e.target.value) })}
                                disabled={discount.type === 'none'}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                                <option value="UPI">UPI</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bill Preview */}
            <div className="lg:col-span-1">
                <Card className="sticky top-6 border-pink-100 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-t-lg pb-6">
                        <CardTitle className="text-white flex items-center justify-between">
                            <span>Bill Summary</span>
                            <Printer className="w-5 h-5 opacity-80 cursor-pointer hover:opacity-100" onClick={() => window.print()} />
                        </CardTitle>
                        <p className="text-pink-100 text-sm mt-1">{currentDate}</p>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-4">
                            {items.map((item) => (
                                item.service && (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <div>
                                            <span className="font-medium text-gray-900 block">{services.find(s => s.id === item.service)?.name || 'Unknown'}</span>
                                            <span className="text-gray-500 text-xs">{item.qty} x ₹{item.price}</span>
                                        </div>
                                        <span className="font-medium">₹{item.price * item.qty}</span>
                                    </div>
                                )
                            ))}
                            {items.every(i => !i.service) && (
                                <p className="text-sm text-gray-500 italic text-center py-4">Add services to see summary</p>
                            )}
                        </div>

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                            </div>
                            {discount.type !== 'none' && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>- ₹{(calculateSubtotal() - calculateTotal()).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
                                <span>Total</span>
                                <span className="text-pink-600">₹{calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-3 bg-gray-50 rounded-b-lg">
                        <Button className="w-full bg-pink-600 hover:bg-pink-700 shadow-lg shadow-pink-200">
                            <Save className="w-4 h-4 mr-2" /> Generate Bill
                        </Button>
                        <Button variant="outline" className="w-full">
                            Reset Form
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
