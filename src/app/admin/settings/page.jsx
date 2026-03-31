"use client";

import React, { useState, useEffect } from "react";
import {
    CreditCard,
    Users,
    Shield,
    User,
    RefreshCw,
    Smartphone,
    Bell,
    MessageSquare,
    X,
    CheckCircle2,
    Loader2,
    Plus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const SettingsPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedSetting, setSelectedSetting] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isAddingStaff, setIsAddingStaff] = useState(false);

    const defaultData = {
        global: {
            site_title: "Kaira Fashion Store",
            store_name: "Kaira Fashion Store",
            support_email: "support@kaira.com",
            support_phone: "+91 00000 00000",
            currency: "INR",
            tax_rate: 18,
            maintenance_mode: false,
            checkout_enabled: true,
            shipping_flat_rate: 50,
            shipping_free_above: 2000,
        },
        apps: {
            razorpay_key: "",
            razorpay_secret: "",
            delhivery_token: "",
            auto_sync: false,
        },
        notifications: {
            order_status: true,
            payment_conf: true,
            payment_failed: true,
            abandoned_cart: false,
            price_drop: false,
            login_otp: true,
        },
        snippets: {
            return_inst: "",
            refund_timeline: "",
            size_guide: "",
            shipping_charges: "",
            delayed_order: "",
            out_of_stock: "",
            feedback: "",
        },
    };

    const [formData, setFormData] = useState(defaultData);

    // Fetch settings
    useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await supabase
                .from("store_settings")
                .select("settings_json")
                .eq("id", 1)
                .single();

            console.log("FETCH DATA:", data);
            console.log("FETCH ERROR:", error);

            if (error) return;

            if (data?.settings_json) {
                setFormData({
                    ...defaultData,
                    ...data.settings_json,
                    global: { ...defaultData.global, ...data.settings_json.global },
                    apps: { ...defaultData.apps, ...data.settings_json.apps },
                    notifications: {
                        ...defaultData.notifications,
                        ...data.settings_json.notifications,
                    },
                    snippets: {
                        ...defaultData.snippets,
                        ...data.settings_json.snippets,
                    },
                });
            }
        };

        fetchSettings();
    }, []);

    // Update handler
    const handleUpdate = (section, key, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: { ...prev[section], [key]: value },
        }));
    };

    // Save via API route
    const saveToSupabase = async () => {
        setLoading(true);

        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    settings_json: formData,
                }),
            });

            const result = await res.json();
            console.log("SAVE RESULT:", result);

            if (!result.success) {
                alert("Error: " + result.error);
            } else {
                alert("Settings Saved Successfully ✨");
                setIsDrawerOpen(false);
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Something went wrong while saving settings.");
        }

        setLoading(false);
    };

    const settingsData = [
        {
            category: "SYSTEM",
            items: [
                {
                    id: "payment",
                    title: "Account and Payment Info",
                    desc: "Manage your account and payments.",
                    icon: <CreditCard size={24} />,
                },
                {
                    id: "users",
                    title: "Manage Users",
                    desc: "Manage users associated with this account.",
                    icon: <Users size={24} />,
                },
                {
                    id: "groups",
                    title: "Groups, Permissions, Jobs",
                    desc: "Manage your groups, permissions and job titles.",
                    icon: <Users size={24} />,
                },
                {
                    id: "security",
                    title: "Security",
                    desc: "Manage passwords, set up authentication.",
                    icon: <Shield size={24} />,
                },
            ],
        },
        {
            category: "PERSONAL",
            items: [
                {
                    id: "profile",
                    title: "Profile",
                    desc: "Update your profile information, personal performance settings.",
                    icon: <User size={24} />,
                },
                {
                    id: "sync",
                    title: "Contacts and Calendar Sync",
                    desc: "Edit your company's name, address, time, zone and more.",
                    icon: <RefreshCw size={24} />,
                },
                {
                    id: "apps",
                    title: "Apps",
                    desc: "Manage your Pinnacle for iPhone or Android apps.",
                    icon: <Smartphone size={24} />,
                },
                {
                    id: "notifications",
                    title: "Notifications",
                    desc: "Manage pop-up reminders, in-app notification settings.",
                    icon: <Bell size={24} />,
                },
                {
                    id: "snippets",
                    title: "Text Snippets",
                    desc: "Manage your text snippets library.",
                    icon: <MessageSquare size={24} />,
                },
            ],
        },
    ];

    const openDrawer = (item) => {
        setSelectedSetting(item);
        setIsDrawerOpen(true);
        setIsAddingStaff(false);
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] py-10 px-6 md:px-12 relative overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-light text-gray-400 mb-12 uppercase tracking-tight">Settings</h1>

                {settingsData.map((section, idx) => (
                    <div key={idx} className="mb-16">
                        <h2 className="text-3xl font-light text-gray-400 tracking-widest mb-8 uppercase">
                            {section.category}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {section.items.map((card, i) => (
                                <div
                                    key={i}
                                    onClick={() => openDrawer(card)}
                                    className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 flex flex-col min-h-[300px] cursor-pointer active:scale-95 group"
                                >
                                    <div className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl mb-12 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        {card.icon}
                                    </div>

                                    <div className="mt-auto">
                                        <h3 className="text-2xl font-light text-gray-500 mb-4 leading-tight max-w-[180px]">
                                            {card.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            {card.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Overlay Background --- */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsDrawerOpen(false)}
                />
            )}

            {/* --- Side Drawer --- */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-500 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-8 h-full flex flex-col">
                    <div className="flex justify-between items-center border-b pb-6 mb-8">
                        <div>
                            <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-1">Editing</p>
                            <h2 className="text-xl font-semibold text-gray-800">{selectedSetting?.title}</h2>
                        </div>
                        <button
                            onClick={() => setIsDrawerOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <p className="text-gray-500 mb-6">{selectedSetting?.desc}</p>

                        <div className="flex-1 overflow-y-auto">
                            <p className="text-xs text-gray-400 mb-6 uppercase tracking-wider">General Settings</p>
                            {/*--------payment & account setting ----------------------------------------------------------------*/}

                            <div className="space-y-6">
                                {selectedSetting?.id === 'payment' && (
                                    <>
                                        {/* Store Info */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Store Details</h4>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-semibold text-gray-500">Store Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.global.store_name}
                                                    onChange={(e) => handleUpdate('global', 'store_name', e.target.value)}
                                                    placeholder="e.g. Kaira Fashion Store"
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-semibold text-gray-500">Support Email</label>
                                                <input
                                                    type="email"
                                                    value={formData.global.support_email}
                                                    onChange={(e) => handleUpdate('global', 'support_email', e.target.value)}
                                                    placeholder="support@kaira.com"
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Payment Settings */}
                                        <div className="space-y-4 pt-4 border-t">
                                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Payment Gateway</h4>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-semibold text-gray-500">Razorpay Key ID</label>
                                                <input type="password" placeholder="rzp_test_..." className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <input type="checkbox" id="cod" className="w-4 h-4 text-blue-600" />
                                                <label htmlFor="cod" className="text-sm font-medium text-gray-700 cursor-pointer">Enable Cash on Delivery (COD)</label>
                                            </div>
                                        </div>

                                        {/* Tax Info */}
                                        <div className="space-y-4 pt-4 border-t">
                                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Tax & Currency</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-semibold text-gray-500">Currency</label>
                                                    <select className="p-3 border border-gray-200 rounded-xl outline-none">
                                                        <option>INR (₹)</option>
                                                        <option>USD ($)</option>
                                                    </select>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-semibold text-gray-500">GST %</label>
                                                    <input type="number" placeholder="12" className="p-3 border border-gray-200 rounded-xl outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* --- 2. MANAGE USERS --- */}
                                {selectedSetting?.id === 'store' && (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Global Store Settings</h4>
                                            <div className="grid gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-semibold text-gray-500">Site Title</label>
                                                    <input
                                                        type="text"
                                                        value={formData.global.site_title}
                                                        onChange={(e) => handleUpdate('global', 'site_title', e.target.value)}
                                                        placeholder="Kaira Fashion Store"
                                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-semibold text-gray-500">Store Name</label>
                                                    <input
                                                        type="text"
                                                        value={formData.global.store_name}
                                                        onChange={(e) => handleUpdate('global', 'store_name', e.target.value)}
                                                        placeholder="Kaira Fashion Store"
                                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-xs font-semibold text-gray-500">Support Email</label>
                                                        <input
                                                            type="email"
                                                            value={formData.global.support_email}
                                                            onChange={(e) => handleUpdate('global', 'support_email', e.target.value)}
                                                            placeholder="support@kaira.com"
                                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-xs font-semibold text-gray-500">Support Phone</label>
                                                        <input
                                                            type="tel"
                                                            value={formData.global.support_phone}
                                                            onChange={(e) => handleUpdate('global', 'support_phone', e.target.value)}
                                                            placeholder="+91 00000 00000"
                                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-xs font-semibold text-gray-500">Currency</label>
                                                        <select
                                                            value={formData.global.currency}
                                                            onChange={(e) => handleUpdate('global', 'currency', e.target.value)}
                                                            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="INR">INR (₹)</option>
                                                            <option value="USD">USD ($)</option>
                                                            <option value="EUR">EUR (€)</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-xs font-semibold text-gray-500">GST / Tax %</label>
                                                        <input
                                                            type="number"
                                                            value={formData.global.tax_rate}
                                                            onChange={(e) => handleUpdate('global', 'tax_rate', Number(e.target.value))}
                                                            placeholder="18"
                                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-700">Maintenance Mode</p>
                                                            <p className="text-[10px] text-gray-400">Hide store pages from customers.</p>
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.global.maintenance_mode}
                                                            onChange={(e) => handleUpdate('global', 'maintenance_mode', e.target.checked)}
                                                            className="w-5 h-5 accent-blue-600"
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-700">Checkout Enabled</p>
                                                            <p className="text-[10px] text-gray-400">Allow customers to complete orders.</p>
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.global.checkout_enabled}
                                                            onChange={(e) => handleUpdate('global', 'checkout_enabled', e.target.checked)}
                                                            className="w-5 h-5 accent-blue-600"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-xs font-semibold text-gray-500">Shipping Flat Rate</label>
                                                        <input
                                                            type="number"
                                                            value={formData.global.shipping_flat_rate}
                                                            onChange={(e) => handleUpdate('global', 'shipping_flat_rate', Number(e.target.value))}
                                                            placeholder="50"
                                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-xs font-semibold text-gray-500">Free Shipping Over</label>
                                                        <input
                                                            type="number"
                                                            value={formData.global.shipping_free_above}
                                                            onChange={(e) => handleUpdate('global', 'shipping_free_above', Number(e.target.value))}
                                                            placeholder="2000"
                                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedSetting?.id === 'users' && (
                                    <div className="space-y-6">
                                        {/* જો યુઝર ઉમેરવાનું ચાલુ ન હોય તો લિસ્ટ બતાવો */}
                                        {!isAddingStaff ? (
                                            <div className="space-y-6">
                                                <button
                                                    onClick={() => setIsAddingStaff(true)}
                                                    className="w-full py-4 border-2 border-dashed border-gray-200 text-gray-500 rounded-2xl flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-600 transition-all"
                                                >
                                                    <Plus size={20} />
                                                    <span className="font-medium">Add New Staff</span>
                                                </button>

                                                {/* old staff list */}
                                                <section className="space-y-4">
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Staff</h4>
                                                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">K</div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-800">Khushali R.</p>
                                                                <p className="text-[10px] text-gray-400 uppercase font-black">Admin</p>
                                                            </div>
                                                        </div>
                                                        <CheckCircle2 size={18} className="text-green-500" />
                                                    </div>
                                                </section>
                                            </div>
                                        ) : (
                                            /* જો isAddingStaff True હોય, તો ફોર્મ બતાવો */
                                            <div className="space-y-6">
                                                <button
                                                    onClick={() => setIsAddingStaff(false)} className="text-xs font-bold text-blue-600 uppercase flex items-center gap-1 hover:underline"
                                                >
                                                    ← Back to Staff List
                                                </button>

                                                <div className="space-y-4">
                                                    <input type="text" placeholder="Full Name" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
                                                    <input type="email" placeholder="Email Address" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
                                                </div>
                                            </div>
                                        )}<div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Assign Role</label>
                                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                                                <option value="admin">Admin (Full Access)</option>
                                                <option value="editor">Editor (Products & Orders)</option>
                                                <option value="support">Customer Support</option>
                                            </select>
                                        </div>

                                        {/* Action Button */}
                                        <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                                            Invite Staff Member
                                        </button>
                                    </div>
                                )}
                                {/* -----------------૧. Group Information Section */}
                                {selectedSetting?.id === 'groups' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            Manage your team groups, permissions, and specific job roles for your store staff.
                                        </p>


                                        <section className="space-y-4">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Group Information</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-600 mb-1.5 block ml-1">Group Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Inventory Manager"
                                                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-600 mb-1.5 block ml-1">Job Description</label>
                                                    <textarea
                                                        rows="3"
                                                        placeholder="What will this group do?"
                                                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
                                                    ></textarea>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-600 mb-1.5 block ml-1">Access Level</label>
                                                    <select className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer">
                                                        <option value="low">Low (View Only)</option>
                                                        <option value="medium">Medium (Editor Access)</option>
                                                        <option value="high">High (Full Control)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </section>

                                        {/* ૨. Specific Permissions Checkboxes */}
                                        <section className="space-y-4">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Specific Permissions</h4>
                                            <div className="grid grid-cols-1 gap-3">
                                                {[
                                                    { id: 'create', label: 'Create New Products', desc: 'Allow adding new items to store' },
                                                    { id: 'edit', label: 'Edit Existing Data', desc: 'Modify prices and descriptions' },
                                                    { id: 'delete', label: 'Delete Records', desc: 'Permanent removal of data' },
                                                    { id: 'export', label: 'Export Reports', desc: 'Download Excel/CSV files' }
                                                ].map((perm) => (
                                                    <label key={perm.id} className="group flex items-center justify-between p-4 bg-gray-50 border border-transparent rounded-2xl cursor-pointer hover:bg-white hover:border-blue-100 transition-all">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-700">{perm.label}</span>
                                                            <span className="text-[10px] text-gray-400">{perm.desc}</span>
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        </section>

                                        {/* Action Buttons */}
                                        <div className="pt-4 flex gap-3">
                                            <button className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all">
                                                Save Group Changes
                                            </button>
                                        </div>
                                    </div>
                                )}



                                {/* --- 3. SECURITY SETTINGS --- */}
                                {selectedSetting?.id === 'security' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            Manage your account security, update your password and set up two-factor authentication.
                                        </p>

                                        {/* Password Update Section */}
                                        <section className="space-y-4">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Update Password</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-600 mb-1.5 block ml-1">Current Password</label>
                                                    <input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-600 mb-1.5 block ml-1">New Password</label>
                                                    <input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        {/* Two-Factor Authentication Section */}
                                        <section className="space-y-4 pt-4 border-t border-gray-100">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Two-Factor Authentication</h4>
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-700">Enable 2FA</span>
                                                    <span className="text-[10px] text-gray-400">Secure your account with an OTP.</span>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        </section>

                                        {/* Session Control Section */}
                                        <section className="space-y-4 pt-4 border-t border-gray-100">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Session Management</h4>
                                            <button className="w-full p-4 bg-red-50 text-red-600 text-xs font-bold uppercase rounded-2xl hover:bg-red-100 transition-all text-center">
                                                Sign Out From All Other Devices
                                            </button>
                                        </section>
                                    </div>
                                )}

                                {/* 4 --- PROFILE SECTION --- */}
                                {selectedSetting?.id === 'profile' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            Update your personal information and profile settings.
                                        </p>

                                        {/* Profile Picture Upload */}
                                        <div className="flex flex-col items-center justify-center space-y-3 py-4">
                                            <div className="relative group">
                                                <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                                    {/* Jo image hoy to muki sakay, baki default icon */}
                                                    <span className="text-gray-400 text-xs text-center px-2">No Image</span>
                                                </div>
                                                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                                </button>
                                            </div>
                                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Change Photo</span>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="grid grid-cols-1 gap-5">
                                            {/* Full Name */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-600 ml-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter your full name"
                                                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                                />
                                            </div>

                                            {/* Email Address - Read Only */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-600 ml-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    value="admin@kairafashion.com"
                                                    readOnly
                                                    className="w-full p-3.5 bg-gray-100 border border-gray-200 rounded-2xl text-sm text-gray-500 cursor-not-allowed outline-none"
                                                />
                                            </div>

                                            {/* Phone Number */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-600 ml-1">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    placeholder="+91 00000 00000"
                                                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                                />
                                            </div>

                                            {/* Role - Read Only */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-600 ml-1">Account Role</label>
                                                <div className="w-full p-3.5 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                                    <span className="text-sm font-bold text-blue-700 uppercase tracking-tighter">Administrator</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- CONTACTS & CALENDAR SYNC SECTION --- */}
                                {selectedSetting?.id === 'sync' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300 pb-10">
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            Manage your store integrations with Google and Microsoft services.
                                        </p>

                                        {/* 1. CONTACTS SYNC SECTION */}
                                        <section className="space-y-4">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">1. Contacts Sync</h4>
                                            <div className="grid gap-3">
                                                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-700">Auto-Update Customers</p>
                                                        <p className="text-[11px] text-gray-500">Automatically sync new registrations</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                    </label>
                                                </div>

                                                <button className="w-full py-3 px-4 border-2 border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                                    Export Contacts to CSV
                                                </button>
                                            </div>
                                        </section>

                                        {/* 2. CALENDAR SYNC SECTION */}
                                        <section className="space-y-4">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">2. Calendar Sync</h4>
                                            <div className="space-y-3">
                                                {['Order Delivery Dates', 'Sale Events', 'Task Management'].map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                                                        <span className="text-sm font-bold text-gray-700">{item}</span>
                                                        <input type="checkbox" className="w-5 h-5 accent-blue-600 cursor-pointer" />
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        {/* 3. CONNECTION SETTINGS */}
                                        <section className="space-y-4">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">3. Connection Settings</h4>

                                            {/* Sync Frequency Dropdown */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-600 ml-1">Sync Frequency</label>
                                                <select className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:border-blue-500 appearance-none cursor-pointer">
                                                    <option>Every 1 hour</option>
                                                    <option>Daily</option>
                                                    <option>Weekly</option>
                                                </select>
                                            </div>

                                            {/* Account Buttons */}
                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                <button className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                                                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
                                                    <span className="text-xs font-bold text-gray-700">Google</span>
                                                </button>
                                                <button className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                                                    <img src="https://www.microsoft.com/favicon.ico" className="w-4 h-4" alt="M" />
                                                    <span className="text-xs font-bold text-gray-700">Microsoft</span>
                                                </button>
                                            </div>

                                            {/* Status Footer */}
                                            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col items-center gap-2 text-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                                    <span className="text-[11px] font-bold text-gray-400">Last Synced: 26 March 2026, 11:30 AM</span>
                                                </div>
                                                <button className="text-[10px] uppercase font-black text-blue-600 tracking-widest hover:text-blue-700">Force Sync Now</button>
                                            </div>
                                        </section>
                                    </div>
                                )}
                                {/* --- APPS & INTEGRATION SECTION --- */}
                                {selectedSetting?.id === 'apps' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            Manage your external application connections, payment gateways, and shipping provider integrations.
                                        </p>

                                        <div className="space-y-6">
                                            {/* Payment Gateway Section */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Payment Gateway (Razorpay)</h4>
                                                <div className="grid gap-4">
                                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Razorpay Key ID</label>
                                                        <input
                                                            type="text"
                                                            placeholder="rzp_live_..."
                                                            className="w-full bg-transparent text-sm font-bold text-gray-700 outline-none placeholder:text-gray-300"
                                                        />
                                                    </div>
                                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Razorpay Secret</label>
                                                        <input
                                                            type="password"
                                                            placeholder="••••••••••••"
                                                            className="w-full bg-transparent text-sm font-bold text-gray-700 outline-none placeholder:text-gray-300"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Shipping Partner Section */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Shipping Partner (Delhivery)</h4>
                                                <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <span className="text-sm font-bold text-gray-700 block">Enable Auto-Sync</span>
                                                        <span className="text-[10px] text-gray-400">Sync orders directly with Delhivery panel.</span>
                                                    </div>
                                                    <input type="checkbox" className="w-5 h-5 accent-blue-600 cursor-pointer" />
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">API Token</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter Delhivery API Token"
                                                        className="w-full bg-transparent text-sm font-bold text-gray-700 outline-none placeholder:text-gray-300"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Save Action */}
                                        <div className="pt-4">
                                            <button className="w-full bg-blue-600 text-white text-sm font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all active:scale-[0.98]">
                                                Save App Settings
                                            </button>
                                        </div>
                                    </div>
                                )}


                                {/* --- NOTIFICATIONS MANAGEMENT SECTION --- */}
                                {selectedSetting?.id === 'notifications' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            Manage how to send order updates, payment status, and marketing offers to your customers from here.

                                        </p>

                                        <div className="space-y-8">

                                            {/* 1. ઓર્ડર અને પેમેન્ટ અપડેટ્સ (Transactional) */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order & Payment Updates</h4>

                                                <div className="grid gap-3">
                                                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                                                        <div className="space-y-1">
                                                            <span className="text-sm font-bold text-gray-700 block">Order Status (Placed/Shipped)</span>
                                                            <span className="text-[10px] text-gray-400">Send order details via email and SMS.</span>
                                                        </div>
                                                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600 cursor-pointer" />
                                                    </div>

                                                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                                                        <div className="space-y-1">
                                                            <span className="text-sm font-bold text-gray-700 block">Payment Confirmation</span>
                                                            <span className="text-[10px] text-gray-400">Razorpay sends notifications immediately after a successful payment.
                                                            </span>
                                                        </div>
                                                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-green-600 cursor-pointer" />
                                                    </div>

                                                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border-2 border-red-50">
                                                        <div className="space-y-1">
                                                            <span className="text-sm font-bold text-red-600 block">Payment Failed Alert</span>
                                                            <span className="text-[10px] text-gray-400">Notify the customer of a failed transaction.</span>
                                                        </div>
                                                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-red-600 cursor-pointer" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 2. માર્કેટિંગ અને પ્રમોશનલ (Marketing) */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Marketing & Retention</h4>

                                                <div className="grid gap-3">
                                                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border-2 border-orange-50">
                                                        <div className="space-y-1">
                                                            <span className="text-sm font-bold text-orange-600 block">Abandoned Cart Recovery</span>
                                                            <span className="text-[10px] text-gray-400">
                                                                Send a reminder after 1 hour if there is an item left in the cart.</span>
                                                        </div>
                                                        <input type="checkbox" className="w-5 h-5 accent-orange-600 cursor-pointer" />
                                                    </div>

                                                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                                                        <div className="space-y-1">
                                                            <span className="text-sm font-bold text-gray-700 block">Price Drop & Back in Stock</span>
                                                            <span className="text-[10px] text-gray-400">Send an alert when a Wishlist item becomes cheaper.</span>
                                                        </div>
                                                        <input type="checkbox" className="w-5 h-5 accent-blue-600 cursor-pointer" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 3. Security */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Account & Security</h4>
                                                <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <span className="text-sm font-bold text-gray-700 block">Login OTP Notifications</span>
                                                        <span className="text-[10px] text-gray-400">
                                                            Send OTP for security on every new login.</span>
                                                    </div>
                                                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-black cursor-pointer" />
                                                </div>
                                            </div>

                                        </div>

                                        {/* Save Changes Button */}
                                        <div className="pt-4">
                                            <button className="w-full bg-blue-600 text-white text-sm font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-[0.98]">
                                                Save Notification Preferences
                                            </button>
                                        </div>
                                    </div>
                                )}


                                {/* --- TEXT SNIPPETS SECTION --- */}
                                {selectedSetting?.id === 'snippets' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            Manage ready-made messages and policy snippets here to quickly respond to your customers' questions.
                                        </p>

                                        <div className="space-y-8 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {/* 1. Refund & Return Policy */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                    Refund & Return Snippets
                                                </h4>
                                                <div className="grid gap-4">
                                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-transparent focus-within:border-blue-100 transition-all">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">
                                                            Return Instructions
                                                        </label>
                                                        <textarea
                                                            rows="3"
                                                            value={formData.snippets.return_inst}
                                                            onChange={(e) =>
                                                                handleUpdate("snippets", "return_inst", e.target.value)
                                                            }
                                                            className="w-full bg-transparent text-sm text-gray-700 outline-none resize-none leading-relaxed"
                                                        />
                                                    </div>

                                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">
                                                            Refund Timeline
                                                        </label>
                                                        <textarea
                                                            rows="2"
                                                            value={formData.snippets.refund_timeline}
                                                            onChange={(e) =>
                                                                handleUpdate("snippets", "refund_timeline", e.target.value)
                                                            }
                                                            className="w-full bg-transparent text-sm text-gray-700 outline-none resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 2. FAQ Snippets */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                    FAQ Snippets
                                                </h4>
                                                <div className="grid gap-4">
                                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">
                                                            Size Guide Info
                                                        </label>
                                                        <textarea
                                                            rows="2"
                                                            value={formData.snippets.size_guide}
                                                            onChange={(e) =>
                                                                handleUpdate("snippets", "size_guide", e.target.value)
                                                            }
                                                            className="w-full bg-transparent text-sm text-gray-700 outline-none resize-none"
                                                        />
                                                    </div>

                                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">
                                                            Shipping Charges
                                                        </label>
                                                        <textarea
                                                            rows="2"
                                                            value={formData.snippets.shipping_charges}
                                                            onChange={(e) =>
                                                                handleUpdate("snippets", "shipping_charges", e.target.value)
                                                            }
                                                            className="w-full bg-transparent text-sm text-gray-700 outline-none resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 3. Order Issue Templates */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                    Order Issues
                                                </h4>
                                                <div className="grid gap-4">
                                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border-l-4 border-orange-400">
                                                        <label className="text-[10px] font-bold text-orange-400 uppercase">
                                                            Delayed Order Message
                                                        </label>
                                                        <textarea
                                                            rows="2"
                                                            value={formData.snippets.delayed_order}
                                                            onChange={(e) =>
                                                                handleUpdate("snippets", "delayed_order", e.target.value)
                                                            }
                                                            className="w-full bg-transparent text-sm text-gray-700 outline-none resize-none"
                                                        />
                                                    </div>

                                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border-l-4 border-red-400">
                                                        <label className="text-[10px] font-bold text-red-400 uppercase">
                                                            Out of Stock Alternative
                                                        </label>
                                                        <textarea
                                                            rows="2"
                                                            value={formData.snippets.out_of_stock}
                                                            onChange={(e) =>
                                                                handleUpdate("snippets", "out_of_stock", e.target.value)
                                                            }
                                                            className="w-full bg-transparent text-sm text-gray-700 outline-none resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 4. Feedback & Incentives */}
                                            <div className="space-y-4 pb-4">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                    Reviews & Rewards
                                                </h4>
                                                <div className="grid gap-4">
                                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border-l-4 border-green-400">
                                                        <label className="text-[10px] font-bold text-green-400 uppercase">
                                                            Post-Purchase Follow-up
                                                        </label>
                                                        <textarea
                                                            rows="2"
                                                            value={formData.snippets.feedback}
                                                            onChange={(e) =>
                                                                handleUpdate("snippets", "feedback", e.target.value)
                                                            }
                                                            className="w-full bg-transparent text-sm text-gray-700 outline-none resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Profile, Apps, Notifications jeva simple cards mate j aa section dekhase */}
                                {['payment', 'users', 'groups', 'security', 'profile', 'sync', 'apps', 'notifications', 'snippets'].indexOf(selectedSetting?.id) === -1 && (
                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-gray-600">Name / Detail</label>
                                            <input
                                                type="text"
                                                placeholder={`Enter ${selectedSetting?.title}...`}
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}


                            </div>
                        </div>


                    </div>

                    <div className="border-t pt-6 flex gap-4">


                        <button
                            disabled={loading}
                            onClick={saveToSupabase}
                            className="mt-8 w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {loading ? "Saving Changes..." : "Apply Settings"}
                        </button>

                        <button
                            onClick={() => setIsDrawerOpen(false)}
                            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>


                </div>
            </div>
        </div>


    );
};

export default SettingsPage;

