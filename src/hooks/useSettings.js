"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export const useSettings = () => {
  const [snippets, setSnippets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [global, setGlobal] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  console.log('useSettings hook triggered');

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Refetching settings from Supabase...');
      const { data, error: fetchError } = await supabase
        .from('store_settings')
        .select('settings_json')
        .eq('id', 1)
        .single();

      console.log('Supabase refetch data:', data);
      console.log('Supabase refetch error:', fetchError);

      if (fetchError) throw fetchError;

      const settings = data?.settings_json || {};
      const snippetsData = settings.snippets || {};
      const globalData = settings.global || {};
      
      console.log('Refetched settings:', settings);
      
      setSnippets(snippetsData);
      setGlobal(globalData);
      setError(null);
      return true;
    } catch (err) {
      console.error('Settings refetch error:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  return { snippets, global, loading, error, refetch, refreshKey, setRefreshKey };
};
