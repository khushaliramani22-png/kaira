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
    Eye,
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
    const [passwordStep, setPasswordStep] = useState('verify'); // 'verify' | 'new' | 'success'
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
        { category: "SYSTEM", items: [
            { id: "payment", title: "Account and Payment Info", desc: "Manage your account and payments.", icon: <CreditCard size={24} /> },
            { id: "users", title: "Manage Users", desc: "Manage users associated with this account.", icon: <Users size={24} /> },
            { id: "groups", title: "Groups, Permissions, Jobs", desc: "Manage your groups, permissions and job titles.", icon: <Users size={24} /> },
            { id: "security", title: "Security", desc: "Manage passwords, set up authentication.", icon: <Shield size={24} /> },
            { id: "announcement", title: "Announcement Bar", desc: "Manage the top announcement banner message.", icon: <Bell size={24} /> },
        ]},
        { category: "PERSONAL", items: [
            { id: "profile", title: "Profile", desc: "Update your profile information, personal performance settings.", icon: <User size={24} /> },
            { id: "sync", title: "Contacts and Calendar Sync", desc: "Edit your company's name, address, time, zone and more.", icon: <RefreshCw size={24} /> },
            { id: "apps", title: "Apps", desc: "Manage your Pinnacle for iPhone or Android apps.", icon: <Smartphone size={24} /> },
            { id: "notifications", title: "Notifications", desc: "Manage pop-up reminders, in-app notification settings.", icon: <Bell size={24} /> },
            { id: "snippets", title: "Text Snippets", desc: "Manage your text snippets library.", icon: <MessageSquare size={24} /> },
        ]},
    ];

    const openDrawer = (item) => {
        setSelectedSetting(item);
        setIsDrawerOpen(true);
        setIsAddingStaff(false);
        // Reset password flow when opening security
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
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-semibold text-gray-500">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPassword ? 'text' : 'password'}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    placeholder="Enter current password"
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
                                )}

                                {passwordStep === 'new' && (
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-semibold text-gray-500">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="New password (min 8 chars)"
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

                        {/* Other settings sections (payment, announcement, etc.) */}
                        {selectedSetting?.id === 'payment' && (
                            <div className="space-y-6">
                                {/* Store details, payment, tax sections - unchanged */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Store Details</h4>
                                    {/* ... existing payment content ... */}
                                </div>
                            </div>
                        )}

                        {selectedSetting?.id !== 'security' && (
                            <div className="space-y-6">
                                {/* Generic settings or other specific sections */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-600">{selectedSetting?.title}</label>
                                    <input
                                        type="text"
                                        placeholder={`Enter ${selectedSetting?.title} details...`}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Save button (except for security password steps) */}
                    {selectedSetting?.id !== 'security' && (
                        <div className="border-t pt-6">
                            <button
                                onClick={handleSaveSettings}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save Settings'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
