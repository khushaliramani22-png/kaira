"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useSettings = () => {
  const [snippets, setSnippets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [global, setGlobal] = useState({});

  console.log('useSettings hook triggered');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        console.log('Fetching settings from Supabase...');
        const { data, error: fetchError } = await supabase
          .from('store_settings')
          .select('settings_json')
          .eq('id', 1)
          .single();

        console.log('Supabase data:', data);
        console.log('Supabase error:', fetchError);

        if (fetchError) throw fetchError;

        const settings = data?.settings_json || {};
        const snippetsData = settings.snippets || {};
        const globalData = settings.global || {};
        
        console.log('Full settings:', settings);
        console.log('Snippets:', snippetsData);
        console.log('Global:', globalData);
        
        setSnippets(snippetsData);
        setGlobal(globalData);
        setError(null);

      } catch (err) {
        console.error('Settings fetch error:', err);
        setError(err.message);
        setSnippets({});
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);
  return { snippets, global, loading, error };
};
