"use client";

import React, { useState, useEffect } from "react";

import {
    CreditCard,
    Users,
    Shield, User, RefreshCw, ShieldCheck, Smartphone, Bell,
    MessageSquare,
    Briefcase,
    X,
    Edit3,
    CheckCircle2,
    Loader2,
    Plus,
    Eye,
    Globe,
    EyeOff,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = 'khushaliramani22@gmail.com'; // Fixed admin email

const SettingsPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedSetting, setSelectedSetting] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isAddingStaff, setIsAddingStaff] = useState(false);


    // Password step state
    const [passwordStep, setPasswordStep] = useState('verify');
    const [passwordError, setPasswordError] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const defaultData = {
        global: {
            site_title: "Kaira Fashion Store",
            store_name: "Kaira Fashion Store",
            store_logo: "",
            support_email: "support@kaira.com",
            support_phone: "+91 00000 00000",
            currency: "INR",
            tax_rate: 18,
            maintenance_mode: false,
            checkout_enabled: true,
            shipping_flat_rate: 50,
            shipping_free_above: 2000,
            announcement_text: "",
            show_announcement: true
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
        security: {
            two_fa_enabled: false
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
    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from("store_settings")
            .select("settings_json")
            .eq("id", 1)
            .single();

        if (data?.settings_json) {
            setFormData({
                ...defaultData,
                ...data.settings_json,
                global: { ...defaultData.global, ...data.settings_json.global },
                apps: { ...defaultData.apps, ...data.settings_json.apps },
                notifications: { ...defaultData.notifications, ...data.settings_json.notifications },
                security: data.settings_json.security || defaultData.security,
                snippets: { ...defaultData.snippets, ...data.settings_json.snippets },
            });
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleUpdate = (section, key, value) => {
        let cleanValue = value;
        if (key === 'store_logo' && typeof value === 'string') {
            cleanValue = value.replace(/^\/images\/colorbox\//, '');
        }
        setFormData((prev) => ({
            ...prev,
            [section]: { ...prev[section], [key]: cleanValue },
        }));
    };

    // Password verification
    const handleVerifyPassword = async () => {
        if (!currentPassword.trim()) {
            setPasswordError('Current password is required');
            return;
        }

        setPasswordError('');
        setPasswordLoading(true);

        try {
            const res = await fetch('/api/admin/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: ADMIN_EMAIL,
                    current_password: currentPassword
                }),
            });

            const result = await res.json();

            if (result.success) {
                setPasswordStep('new');
            } else {
                setPasswordError('Invalid current password');
            }
        } catch (err) {
            setPasswordError('Verification failed. Please try again.');
        } finally {
            setPasswordLoading(false);
        }
    };

    // Password update
    const handleUpdatePassword = async () => {
        if (!newPassword || !confirmPassword) {
            setPasswordError('New password and confirmation required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            return;
        }

        setPasswordError('');
        setPasswordLoading(true);

        try {
            const res = await fetch('/api/admin/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: ADMIN_EMAIL,
                    new_password: newPassword
                }),
            });

            const result = await res.json();

            if (result.success) {
                setPasswordStep('success');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordError(result.message || 'Update failed');
            }
        } catch (err) {
            setPasswordError('Update failed. Please try again.');
        } finally {
            setPasswordLoading(false);
        }
    };

    // Reset password flow
    const resetPasswordFlow = () => {
        setPasswordStep('verify');
        setPasswordError('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    // Save other settings
    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings_json: formData }),
            });

            const result = await res.json();
            if (result.success) {
                await fetchSettings();
                alert('Settings saved!');
            } else {
                alert('Save failed: ' + result.error);
            }
        } catch (err) {
            alert('Save failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const settingsData = [
        {
            category: "SYSTEM", items: [
                { id: "payment", title: "Account and Payment Info", desc: "Manage your account and payments.", icon: <CreditCard size={24} /> },
                { id: "users", title: "Manage Users", desc: "Manage users associated with this account.", icon: <Users size={24} /> },
                { id: "groups", title: "Groups, Permissions, Jobs", desc: "Manage your groups, permissions and job titles.", icon: <Users size={24} /> },
                { id: "security", title: "Security", desc: "Manage passwords, set up authentication.", icon: <Shield size={24} /> },
                { id: "announcement", title: "Announcement Bar", desc: "Manage the top announcement banner message.", icon: <Bell size={24} /> },
            ]
        },
        {
            category: "PERSONAL", items: [
                { id: "profile", title: "Profile", desc: "Update your profile information, personal performance settings.", icon: <User size={24} /> },
                { id: "sync", title: "Contacts and Calendar Sync", desc: "Edit your company's name, address, time, zone and more.", icon: <RefreshCw size={24} /> },
                { id: "apps", title: "Apps", desc: "Manage your Pinnacle for iPhone or Android apps.", icon: <Smartphone size={24} /> },
                { id: "notifications", title: "Notifications", desc: "Manage pop-up reminders, in-app notification settings.", icon: <Bell size={24} /> },
                { id: "snippets", title: "Text Snippets", desc: "Manage your text snippets library.", icon: <MessageSquare size={24} /> },
            ]
        },
    ];

    const handleSave = async (sectionId) => {
        setLoading(true);
        try {


            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings_json: formData }),
            });

            const result = await res.json();
            if (result.success) {
                await fetchSettings(); 
                alert(`${sectionId.toUpperCase()} save successfull!`);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error("Save Error:", err);
            alert('error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const openDrawer = (item) => {
        setSelectedSetting(item);
        setIsDrawerOpen(true);
        setIsAddingStaff(false);
  
        if (item.id === 'security') {
            resetPasswordFlow();
        }
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
                                <div key={i} onClick={() => openDrawer(card)} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 flex flex-col min-h-[300px] cursor-pointer active:scale-95 group">
                                    <div className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl mb-12 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        {card.icon}
                                    </div>
                                    <div className="mt-auto">
                                        <h3 className="text-2xl font-light text-gray-500 mb-4 leading-tight max-w-[180px]">
                                            {card.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 leading-relaxed">{card.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Overlay */}
            {isDrawerOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsDrawerOpen(false)} />
            )}

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-500 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-8 h-full flex flex-col">
                    <div className="flex justify-between items-center border-b pb-6 mb-8">
                        <div>
                            <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-1">Editing</p>
                            <h2 className="text-xl font-semibold text-gray-800">{selectedSetting?.title}</h2>
                        </div>
                        <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-6">
                        <p className="text-gray-500">{selectedSetting?.desc}</p>

                        {/* Security Multi-Step Password */}
                        {selectedSetting?.id === 'security' && (
                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    <Shield size={16} className="text-blue-600" />
                                    Update Password
                                </h4>

                                {passwordStep === 'verify' && (
                                    <form onSubmit={(e) => { e.preventDefault(); handleVerifyPassword(); }} className="space-y-4">
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-semibold text-gray-500">Current Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showCurrentPassword ? 'text' : 'password'}
                                                        value={currentPassword}
                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                        placeholder="Enter current password"
                                                        autoComplete="current-password"
                                                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                {passwordError && (
                                                    <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={handleVerifyPassword}
                                                disabled={passwordLoading || !currentPassword}
                                                className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {passwordLoading ? <Loader2 className="animate-spin" size={18} /> : 'Next'}
                                            </button>

                                        </div>
                                    </form>
                                )}

                                {passwordStep === 'new' && (
                                    <form onSubmit={(e) => { e.preventDefault(); handleUpdatePassword(); }} className="space-y-4">
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-semibold text-gray-500">New Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="New password (min 8 chars)"
                                                        autoComplete="new-password"
                                                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-semibold text-gray-500">Confirm New Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        placeholder="Confirm new password"
                                                        autoComplete="new-password"
                                                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
                                            </div>
                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={resetPasswordFlow}
                                                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    onClick={handleUpdatePassword}
                                                    disabled={passwordLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {passwordLoading ? <Loader2 className="animate-spin" size={18} /> : 'Update Password'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}

                                {passwordStep === 'success' && (
                                    <div className="text-center space-y-4 pt-8">
                                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                                        <h3 className="text-xl font-bold text-green-700">Password Updated!</h3>
                                        <p className="text-gray-500">Your password has been changed successfully.</p>
                                        <button
                                            onClick={resetPasswordFlow}
                                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                                        >
                                            Change Another Password
                                        </button>
                                    </div>
                                )}

                                {/* 2FA Toggle */}
                                <section className="space-y-4 pt-6 border-t">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Two-Factor Authentication</h4>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                        <div>
                                            <span className="text-sm font-bold text-gray-700 block">Enable 2FA</span>
                                            <span className="text-[10px] text-gray-400">Secure your account with OTP</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.security?.two_fa_enabled || false}
                                                onChange={(e) => handleUpdate('security', 'two_fa_enabled', e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </section>
                            </div>
                        )}


                        {selectedSetting?.id === 'payment' && (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-4">
            <CreditCard size={16} />
            Store Details & Global Settings
        </h4>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/20 space-y-5">
                
                {/* Store Basic Info */}
                <div className="space-y-4">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">General Information</h5>
                    
                    {/* Store Name */}
                    <div className="form-group">
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Store Name</label>
                        <input
                            type="text"
                            placeholder="Kaira Fashion Store"
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm shadow-sm transition-all"
                            value={formData.global.store_name}
                            onChange={(e) => setFormData({
                                ...formData,
                                global: { ...formData.global, store_name: e.target.value }
                            })}
                        />
                    </div>

                    {/* Support Email */}
                    <div className="form-group">
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Support Email</label>
                        <input
                            type="email"
                            placeholder="support@kaira.com"
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm shadow-sm transition-all"
                            value={formData.global.support_email}
                            onChange={(e) => setFormData({
                                ...formData,
                                global: { ...formData.global, support_email: e.target.value }
                            })}
                        />
                    </div>

                    {/* Support Phone & Currency */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Support Phone</label>
                            <input
                                type="text"
                                placeholder="+91 00000 00000"
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm shadow-sm transition-all"
                                value={formData.global.support_phone}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    global: { ...formData.global, support_phone: e.target.value }
                                })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Currency</label>
                            <select
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm shadow-sm transition-all outline-none cursor-pointer"
                                value={formData.global.currency}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    global: { ...formData.global, currency: e.target.value }
                                })}
                            >
                                <option value="INR">INR (₹) - Indian Rupee</option>
                                <option value="USD">USD ($) - US Dollar</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Financial Settings */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Financial Settings</h5>
                    
                    {/* Tax Rate */}
                    <div className="form-group">
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tax Rate (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="18"
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm shadow-sm transition-all"
                                value={formData.global.tax_rate}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    global: { ...formData.global, tax_rate: Number(e.target.value) }
                                })}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                                %
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save and Apply Button Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end sticky bottom-0 z-10">
                <button 
                    onClick={() => handleSave('payment')}
                    disabled={loading}
                    className="bg-black text-white px-8 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={14} />
                            Save and Apply
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
)}
                        {/* usermanagement */}
                        {selectedSetting?.id === 'users' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                {/* Header Section */}
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                        <Users size={16} />
                                        Manage Staff Members
                                    </h4>
                                    <button
                                        onClick={() => setIsAddingStaff(true)}
                                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                    >
                                        <Plus size={14} />
                                        Add Member
                                    </button>
                                </div>

                                {/* User Management Card */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Staff Details</th>
                                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role</th>
                                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {/* Example User Row */}
                                                <tr className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                                                KR
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-800">Khushali Ramani</p>
                                                                <p className="text-[11px] text-gray-500">khushaliramani22@gmail.com</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-tight">
                                                            Admin
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                            <span className="text-[11px] font-medium text-gray-600">Active</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="p-2 text-gray-400 hover:text-black transition-colors">
                                                            <Edit3 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Empty State Logic (Optional) */}
                                    <div className="p-12 flex flex-col items-center justify-center text-center bg-slate-50/30">
                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-3">
                                            <Users className="text-gray-300" size={24} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-800">Assign roles to your team</p>
                                        <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Roles allow you to control what parts of the store staff can access.</p>
                                    </div>

                                    {/* Save and Apply Button Footer */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={() => handleSave('users')}
                                            disabled={loading}
                                            className="bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={14} />
                                                    Save and Apply
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {selectedSetting?.id === 'groups' && (
                            <div className="space-y-8 animate-in fade-in duration-500">

                                {/* 1. Customer Groups Section */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <Users size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Customer Groups</h4>
                                                <p className="text-xs text-gray-500">Define customer segments for targeted marketing</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {['Retail Customers', 'VIP Members', 'Wholesale/B2B'].map((group) => (
                                                <div key={group} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-all">
                                                    <span className="text-sm font-medium text-gray-700">{group}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Active</span>
                                                        <button className="text-gray-400 hover:text-black p-1 rounded hover:bg-gray-100 transition-all"><Edit3 size={14} /></button>

                                                    </div>
                                                </div>
                                            ))}
                                            <button className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all">
                                                + Create New Group
                                            </button>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-gray-50/50 border-t flex justify-end">
                                        <button
                                            onClick={() => handleSave('customer_groups')}
                                            className="bg-black text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-all shadow-sm"
                                        >
                                            Save and Apply Groups
                                        </button>
                                    </div>
                                </div>

                                {/* 2. Role Permissions Section */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Role Permissions</h4>
                                                <p className="text-xs text-gray-500">Configure what your staff can see and edit</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { label: 'View Analytics', desc: 'Can see sales reports' },
                                                { label: 'Manage Products', desc: 'Add/Edit/Delete products' },
                                                { label: 'Order Processing', desc: 'Update order status' },
                                                { label: 'Setting Access', desc: 'Can change store config' }
                                            ].map((perm) => (
                                                <label key={perm.label} className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                                                    <input type="checkbox" className="mt-1 w-4 h-4 accent-black rounded" defaultChecked />
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-700">{perm.label}</p>
                                                        <p className="text-[10px] text-gray-400">{perm.desc}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-gray-50/50 border-t flex justify-end">
                                        <button
                                            onClick={() => handleSave('permissions')}
                                            className="bg-black text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-all shadow-sm"
                                        >
                                            Update Permissions
                                        </button>
                                    </div>
                                </div>

                                {/* 3. Job Roles & Departments */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                                <Briefcase size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Department Jobs</h4>
                                                <p className="text-xs text-gray-500">Assign specific job titles to departments</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Department</label>
                                                    <select className="w-full p-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:ring-1 focus:ring-black outline-none">
                                                        <option>Logistics</option>
                                                        <option>Marketing</option>
                                                        <option>Inventory</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Default Role</label>
                                                    <select className="w-full p-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:ring-1 focus:ring-black outline-none">
                                                        <option>Manager</option>
                                                        <option>Staff Member</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-gray-50/50 border-t flex justify-end">
                                        <button
                                            onClick={() => handleSave('jobs')}
                                            className="bg-black text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-all shadow-sm"
                                        >
                                            Save Job Config
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {selectedSetting?.id === 'announcement' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <Bell size={16} />
                                    Announcement Bar
                                </h4>

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="space-y-5 p-6 bg-gradient-to-br from-slate-50/50 to-blue-50/30 backdrop-blur-sm">

                                        {/* Status Toggle */}
                                        <div className="flex items-center justify-between bg-white/50 p-4 rounded-xl border border-white/50 shadow-sm">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900">Status</label>
                                                <p className="text-xs text-gray-500">Show/hide the top announcement banner</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={formData.global?.show_announcement || false}
                                                    onChange={(e) => handleUpdate('global', 'show_announcement', e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        </div>

                                        {/* Message Textarea */}
                                        <div className="form-group">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Announcement Message</label>
                                            <textarea
                                                rows="3"
                                                value={formData.global?.announcement_text || ''}
                                                onChange={(e) => handleUpdate('global', 'announcement_text', e.target.value)}
                                                placeholder="e.g. 20% OFF sitewide! Use code SAVE20 at checkout"
                                                className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 resize-none leading-relaxed text-sm shadow-sm"
                                            />
                                        </div>

                                        {/* Action URL */}
                                        <div className="form-group">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Action URL</label>
                                            <input
                                                type="url"
                                                value={formData.global?.announcement_link || ''}
                                                onChange={(e) => handleUpdate('global', 'announcement_link', e.target.value)}
                                                placeholder="https://kairafashion.com/collections/sale"
                                                className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-sm shadow-sm"
                                            />
                                        </div>

                                        {/* Background Color */}
                                        <div className="form-group">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Background Color</label>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 relative">
                                                    <input
                                                        type="color"
                                                        value={formData.global?.announcement_bg || '#111827'}
                                                        onChange={(e) => handleUpdate('global', 'announcement_bg', e.target.value)}
                                                        className="w-full h-12 p-1 border border-gray-200 rounded-xl cursor-pointer absolute opacity-0 inset-0"
                                                    />
                                                    <div
                                                        className="w-full h-12 rounded-xl border-2 border-white shadow-sm flex items-center justify-center"
                                                        style={{ backgroundColor: formData.global?.announcement_bg || '#111827' }}
                                                    >
                                                        <span className="text-[10px] font-bold text-white mix-blend-difference uppercase">Pick Color</span>
                                                    </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={formData.global?.announcement_bg || '#111827'}
                                                    onChange={(e) => handleUpdate('global', 'announcement_bg', e.target.value)}
                                                    className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-sm font-mono shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Section */}
                                    <div className="px-6 py-4 bg-orange-50/30 border-t border-gray-100">
                                        <p className="text-[10px] font-bold text-orange-800 uppercase tracking-widest mb-3">Live Preview</p>
                                        <div
                                            className="h-12 rounded-lg flex items-center justify-center px-6 shadow-sm border font-medium text-white text-xs transition-all duration-300"
                                            style={{
                                                backgroundColor: formData.global?.announcement_bg || '#111827',
                                                opacity: formData.global?.show_announcement ? 1 : 0.3
                                            }}
                                        >
                                            {formData.global?.announcement_text || 'Announcement message appears here...'}
                                        </div>
                                    </div>

                                    {/* Save and Apply Button Footer */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={() => handleSave('announcement')}
                                            disabled={loading}
                                            className="bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    Applying...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={14} />
                                                    Save and Apply
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {selectedSetting?.id === 'profile' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <User size={16} />
                                    Personal Profile Settings
                                </h4>

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-8 bg-gradient-to-br from-slate-50/50 to-indigo-50/30 backdrop-blur-sm">

                                        {/* Profile Picture Upload Section */}
                                        <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-white/50">
                                            <div className="relative group">
                                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-black to-gray-700 flex items-center justify-center text-white text-3xl font-bold shadow-xl overflow-hidden">
                                                    {/* જો ઈમેજ હોય તો અહીં આવશે, અત્યારે ઇનિશિયલ બતાવે છે */}
                                                    KR
                                                </div>
                                                <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-black hover:bg-gray-50 transition-all">
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <div className="text-center md:text-left">
                                                <h5 className="text-base font-bold text-gray-900">Khushali Ramani</h5>
                                                <p className="text-xs text-gray-500 mb-3">Frontend Developer & Store Admin</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <button className="px-4 py-1.5 bg-black text-white text-[10px] font-bold rounded-lg hover:bg-gray-800 transition-all shadow-sm">
                                                        Change Photo
                                                    </button>
                                                    <button className="px-4 py-1.5 bg-white text-gray-600 text-[10px] font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition-all">
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Profile Details Form */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="form-group">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
                                                <input
                                                    type="text"
                                                    defaultValue="Khushali Ramani"
                                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black text-sm shadow-sm transition-all"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
                                                <input
                                                    type="email"
                                                    defaultValue="khushaliramani22@gmail.com"
                                                    disabled
                                                    className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed shadow-sm"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                                                <input
                                                    type="text"
                                                    placeholder="+91 00000 00000"
                                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black text-sm shadow-sm transition-all"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Job Title</label>
                                                <input
                                                    type="text"
                                                    defaultValue="Administrator"
                                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black text-sm shadow-sm transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Social Integration Preview */}
                                        <div className="mt-8 p-4 bg-white/40 rounded-2xl border border-white/50 border-dashed">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Linked Accounts</p>
                                            <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                        <CheckCircle2 size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-800">Google Account</p>
                                                        <p className="text-[10px] text-gray-500">Linked to khushaliramani22@gmail.com</p>
                                                    </div>
                                                </div>
                                                <button className="text-[10px] font-bold text-red-500 hover:text-red-700">Disconnect</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save and Apply Button Footer */}
                                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={() => handleSave('profile')}
                                            disabled={loading}
                                            className="bg-black text-white px-8 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    Updating Profile...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={14} />
                                                    Save and Apply
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedSetting?.id === 'sync' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <RefreshCw size={16} />
                                    Contacts and Calendar Sync
                                </h4>

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/20">

                                        {/* Integration Cards */}
                                        <div className="grid grid-cols-1 gap-4 mb-8">
                                            {/* Google Sync Card */}
                                            <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-blue-200 transition-all group">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                                        <Globe size={20} />
                                                    </div>
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full">Connected</span>
                                                </div>
                                                <h5 className="text-sm font-bold text-gray-800">Google Workspace</h5>
                                                <p className="text-[11px] text-gray-500 mb-4">Sync contacts and store events automatically.</p>
                                                <button className="w-full py-2 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-lg hover:bg-red-50 hover:text-red-600 transition-all">
                                                    Disconnect
                                                </button>
                                            </div>

                                            {/* Microsoft Sync */}
                                            <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col justify-between hover:border-blue-200 transition-all group">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                                        <Smartphone size={20} />
                                                    </div>
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-bold rounded-full">Not Linked</span>
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-bold text-gray-800">Outlook / Office 365</h5>
                                                    <p className="text-[11px] text-gray-500 mb-4">Connect your Microsoft business account.</p>
                                                    <button className="w-full py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-all">
                                                        Connect Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sync Settings */}
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Sync Preferences</h5>

                                            <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                                        <Users size={16} className="text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800">Two-way Contact Sync</p>
                                                        <p className="text-[11px] text-gray-500">Changes in store will update your phone contacts</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                                        <RefreshCw size={16} className="text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800">Auto-sync Frequency</p>
                                                        <p className="text-[11px] text-gray-500">How often should the data refresh?</p>
                                                    </div>
                                                </div>
                                                <select className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer">
                                                    <option>Real-time</option>
                                                    <option>Every 1 Hour</option>
                                                    <option>Daily</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save and Apply Button Footer */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={() => handleSave('sync')}
                                            disabled={loading}
                                            className="bg-black text-white px-8 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    Syncing...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={14} />
                                                    Save and Apply
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {selectedSetting?.id === 'apps' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <Smartphone size={16} />
                                    Mobile App Management
                                </h4>

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/20">

                                        {/* Download Links Section */}
                                        <div className="space-y-4 mb-8">
                                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available Platforms</h5>

                                            {/* iOS App */}
                                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white">
                                                        <Smartphone size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">Kaira for iPhone</p>
                                                        <p className="text-[11px] text-gray-500">Version 2.4.0 • iOS 15+</p>
                                                    </div>
                                                </div>
                                                <button className="px-4 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg hover:bg-black hover:text-white transition-all">
                                                    Get App
                                                </button>
                                            </div>

                                            {/* Android App */}
                                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                                                        <Smartphone size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">Kaira for Android</p>
                                                        <p className="text-[11px] text-gray-500">Version 2.4.1 • Android 10+</p>
                                                    </div>
                                                </div>
                                                <button className="px-4 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg hover:bg-emerald-700 hover:text-white transition-all">
                                                    Get App
                                                </button>
                                            </div>
                                        </div>

                                        {/* Device Sync Settings */}
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">App Features</h5>

                                            <div className="p-4 bg-white/60 rounded-xl border border-white/50 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-800">Biometric Login</p>
                                                        <p className="text-[10px] text-gray-500">Use FaceID or Fingerprint on mobile</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                                        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                                    </label>
                                                </div>

                                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-800">Offline Mode</p>
                                                        <p className="text-[10px] text-gray-500">Access orders without internet</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" />
                                                        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save and Apply Button Footer */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={() => handleSave('apps')}
                                            disabled={loading}
                                            className="bg-black text-white px-8 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={14} />
                                                    Save and Apply
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedSetting?.id === 'notifications' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <Bell size={16} />
                                    Notification Preferences
                                </h4>

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-6 bg-gradient-to-br from-slate-50 to-orange-50/20">

                                        {/* Order Updates Section */}
                                        <div className="space-y-4 mb-8">
                                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order & Activity</h5>

                                            <div className="space-y-3">
                                                {/* Order Status */}
                                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">Order Status Updates</p>
                                                        <p className="text-[11px] text-gray-500">Notify when order is shipped or delivered</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={formData.notifications?.order_status}
                                                            onChange={(e) => handleUpdate('notifications', 'order_status', e.target.checked)}
                                                        />
                                                        <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                                    </label>
                                                </div>

                                                {/* Payment Confirmations */}
                                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">Payment Confirmations</p>
                                                        <p className="text-[11px] text-gray-500">Send receipt after successful payment</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={formData.notifications?.payment_conf}
                                                            onChange={(e) => handleUpdate('notifications', 'payment_conf', e.target.checked)}
                                                        />
                                                        <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Marketing & Alerts Section */}
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Marketing & Alerts</h5>

                                            <div className="space-y-3">
                                                {/* Abandoned Cart */}
                                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">Abandoned Cart Reminders</p>
                                                        <p className="text-[11px] text-gray-500">Remind customers about items in their cart</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={formData.notifications?.abandoned_cart}
                                                            onChange={(e) => handleUpdate('notifications', 'abandoned_cart', e.target.checked)}
                                                        />
                                                        <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                                    </label>
                                                </div>

                                                {/* Login OTP */}
                                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">Security & Login OTP</p>
                                                        <p className="text-[11px] text-gray-500">Critical alerts regarding account access</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={formData.notifications?.login_otp}
                                                            onChange={(e) => handleUpdate('notifications', 'login_otp', e.target.checked)}
                                                        />
                                                        <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save and Apply Button Footer */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={() => handleSave('notifications')}
                                            disabled={loading}
                                            className="bg-black text-white px-8 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={14} />
                                                    Save and Apply
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {selectedSetting?.id === 'snippets' && (
                            <div className="space-y-6 animate-in fade-in duration-500 pb-10">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <MessageSquare size={16} />
                                    Text Snippets Library
                                </h4>

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-6 bg-gradient-to-br from-slate-50 to-purple-50/20 space-y-5">

                                        {/* 1. Customer Feedback */}
                                        <div className="form-group">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Customer Feedback Message</label>
                                            <textarea
                                                rows="3"
                                                value={formData.snippets?.feedback || ''}
                                                onChange={(e) => handleUpdate('snippets', 'feedback', e.target.value)}
                                                placeholder="Thank you for shopping with Kaira..."
                                                className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 text-sm shadow-sm transition-all resize-none leading-relaxed"
                                            />
                                        </div>

                                        {/* 2. Size Guide */}
                                        <div className="form-group">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Size Guide Info</label>
                                            <textarea
                                                rows="3"
                                                value={formData.snippets?.size_guide || ''}
                                                onChange={(e) => handleUpdate('snippets', 'size_guide', e.target.value)}
                                                placeholder="Please refer to the size chart..."
                                                className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 text-sm shadow-sm transition-all resize-none leading-relaxed"
                                            />
                                        </div>

                                        {/* 3. Return Instructions */}
                                        <div className="form-group">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Return Instructions</label>
                                            <textarea
                                                rows="3"
                                                value={formData.snippets?.return_inst || ''}
                                                onChange={(e) => handleUpdate('snippets', 'return_inst', e.target.value)}
                                                placeholder="You can request a return within 7 days..."
                                                className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 text-sm shadow-sm transition-all resize-none leading-relaxed"
                                            />
                                        </div>

                                        {/* 4. Out of Stock */}
                                        <div className="form-group">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Out of Stock Message</label>
                                            <textarea
                                                rows="2"
                                                value={formData.snippets?.out_of_stock || ''}
                                                onChange={(e) => handleUpdate('snippets', 'out_of_stock', e.target.value)}
                                                placeholder="This item is currently out of stock..."
                                                className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 text-sm shadow-sm transition-all resize-none leading-relaxed"
                                            />
                                        </div>

                                        {/* 5. Delayed Order */}
                                        <div className="form-group">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Delayed Order Alert</label>
                                            <textarea
                                                rows="2"
                                                value={formData.snippets?.delayed_order || ''}
                                                onChange={(e) => handleUpdate('snippets', 'delayed_order', e.target.value)}
                                                placeholder="Due to high demand, your order might take..."
                                                className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 text-sm shadow-sm transition-all resize-none leading-relaxed"
                                            />
                                        </div>

                                        {/* 6. Refund Timeline */}
                                        <div className="form-group">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Refund Timeline</label>
                                            <textarea
                                                rows="2"
                                                value={formData.snippets?.refund_timeline || ''}
                                                onChange={(e) => handleUpdate('snippets', 'refund_timeline', e.target.value)}
                                                placeholder="Refund will be processed within 5-7 business days..."
                                                className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 text-sm shadow-sm transition-all resize-none leading-relaxed"
                                            />
                                        </div>

                                        {/* 7. Shipping Charges */}
                                        <div className="form-group">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Shipping Charges Info</label>
                                            <textarea
                                                rows="2"
                                                value={formData.snippets?.shipping_charges || ''}
                                                onChange={(e) => handleUpdate('snippets', 'shipping_charges', e.target.value)}
                                                placeholder="Free Shipping on orders above ₹2000..."
                                                className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 text-sm shadow-sm transition-all resize-none leading-relaxed"
                                            />
                                        </div>

                                    </div>

                                    {/* Save and Apply Button Footer */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end sticky bottom-0 z-10">
                                        <button
                                            onClick={() => handleSave('snippets')}
                                            disabled={loading}
                                            className="bg-black text-white px-8 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    Saving Snippets...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={14} />
                                                    Save and Apply
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
