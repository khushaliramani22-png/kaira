"use client";

import { createContext, useContext, useEffect, useState } from "react";

const defaultSettings = {
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

const SettingsContext = createContext({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error(`Settings fetch failed: ${res.status}`);
      const data = await res.json();
      const settingsJson = data?.settings_json ?? defaultSettings;

      setSettings({
        ...defaultSettings,
        ...settingsJson,
        global: { ...defaultSettings.global, ...settingsJson.global },
        apps: { ...defaultSettings.apps, ...settingsJson.apps },
        notifications: { ...defaultSettings.notifications, ...settingsJson.notifications },
        snippets: { ...defaultSettings.snippets, ...settingsJson.snippets },
      });
    } catch (err) {
      console.error("Failed to load settings:", err);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  useEffect(() => {
    if (settings?.global?.site_title) {
      document.title = settings.global.site_title;
    }
  }, [settings.global.site_title]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
