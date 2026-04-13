import React from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

async function getBlogData(slugOrId) {
  try {

    let { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slugOrId)
      .single();


    if (error || !data) {
      const { data: idData, error: idError } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', slugOrId)
        .single();
      
      if (idError) return null;
      return idData;
    }
    return data;
  } catch (err) {
    return null;
  }
}

export default async function BlogDetailPage({ params }) {

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const post = await getBlogData(slug);


  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-6xl font-serif mb-4">404</h1>
        <p className="text-gray-500 mb-8 font-serif italic text-xl">The story you're looking for has vanished into thin air.</p>
        <Link href="/blog" className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-pink-600 hover:border-pink-600 transition-all">
          BACK TO JOURNAL
        </Link>
      </div>
    );
  }

  return (
    <article className="bg-white min-h-screen font-sans text-gray-900 pb-20">
      <header className="pt-20 pb-12 container mx-auto px-6 max-w-4xl text-center">
        <div className="flex justify-center items-center gap-4 mb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
            {post.category || 'Lifestyle'}
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-serif italic mb-8 leading-tight">
          {post.title}
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 font-serif leading-relaxed mb-12 italic">
          "{post.description}"
        </p>
      </header>

      <div className="w-full max-w-5xl mx-auto px-6 mb-16">
        <div className="aspect-[16/9] overflow-hidden bg-gray-100 rounded-sm">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-all duration-1000"
          />
        </div>
      </div>

      <main className="container mx-auto px-6 max-w-3xl">
        <div className="prose prose-lg prose-stone mx-auto">
          <div className="whitespace-pre-line text-gray-700 leading-[1.8] text-lg font-light tracking-wide first-letter:text-6xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-pink-600">
            {post.content}
          </div>
        </div>
      </main>
    </article>
  );
}