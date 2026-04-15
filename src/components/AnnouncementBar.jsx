"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AnnouncementBar = () => {
  const [visible, setVisible] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    setIsClient(true);
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('settings_json')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Announcement fetch error:', error);
        setAnnouncementText('Welcome to Kaira! Enjoy shopping ✨');
        setData({ settings_json: { global: { show_announcement: true } } });
      } else {
        setData(data);
        setAnnouncementText(data?.settings_json?.global?.announcement_text || 'Welcome to Kaira! Enjoy shopping ✨');
      }
    } catch (err) {
      console.error('Announcement fetch failed:', err);
      setAnnouncementText('Welcome to Kaira! Enjoy shopping ✨');
      setData({ settings_json: { global: { show_announcement: true } } });
    } finally {
      setLoading(false);
    }
  };

  if (!isClient || !visible || loading || !(data?.settings_json?.global?.show_announcement ?? true)) return null;

  return (
    <div className="bg-black text-white py-2.5 px-6 relative flex justify-center items-center w-full z-50">
      <p 
        className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-center max-w-4xl mx-auto px-4 break-words"
        dangerouslySetInnerHTML={{ __html: announcementText }}
      />
      
      <button 
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:opacity-50 transition-opacity p-1 hover:bg-white/10 rounded-full"
        title="Close announcement"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};

export default AnnouncementBar;
