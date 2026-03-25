"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Calendar, Trash2 } from "lucide-react";

export default function SubscribersList() {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);

    // ડેટા ફેચ કરવાનું ફંક્શન
    const fetchSubscribers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("newsletter_subscribers")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error) {
            setSubscribers(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    // સબસ્ક્રાઇબર ડિલીટ કરવાનું લોજિક
    const deleteSubscriber = async (id) => {
        if (confirm("Do you want to be removed from this email list?")) {
            const { error } = await supabase
                .from("newsletter_subscribers")
                .delete()
                .eq("id", id);

            if (!error) {
                setSubscribers(subscribers.filter((s) => s.id !== id));
            }
        }
    };

    if (loading) return <div className="p-10 text-center font-bold">Loading Subscribers...</div>;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">
                        Newsletter Subscribers
                    </h1>
                    <p className="text-sm text-gray-500 font-bold">Total Subscribers: {subscribers.length}</p>
                </div>
            </div>

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Joined Date</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {subscribers.map((sub) => (
                            <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <Mail size={16} />
                                        </div>
                                        <span className="font-bold text-gray-800">{sub.email}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                        <Calendar size={14} />
                                        {new Date(sub.created_at).toLocaleDateString("en-IN")}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => deleteSubscriber(sub.id)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {subscribers.length === 0 && (
                    <div className="p-10 text-center text-gray-400 font-bold">

                        No one has subscribed yet.
                    </div>
                )}
            </div>
        </div>
    );
}