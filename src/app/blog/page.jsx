import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; // Ensure this path is correct

async function getBlogs() {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
  return data;
}

export default async function ProfessionalBlogPage() {
  const posts = await getBlogs();
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900">
      {/* 1. Elegant Header Section */}
      <header className="py-20 border-b border-gray-100">
        <div className="container mx-auto px-6 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-4 block">The Kaira Edit</span>
          <h1 className="text-5xl md:text-7xl font-serif italic mb-6">Style & Substance</h1>
          <p className="max-w-xl mx-auto text-gray-500 leading-relaxed">
            Exploring the intersection of tradition, modern fashion, and the stories behind our collections.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400 italic">No stories published yet. Stay tuned.</div>
        ) : (
          <>
            {/* 2. Featured Post Section (Visual Highlight) */}
            {featuredPost && (
              <section className="mb-24">
                <Link href={`/blog/${featuredPost.id}`} className="group grid md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-7 overflow-hidden bg-gray-100 aspect-[16/9]">
                    <img
                      src={featuredPost.image_url}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  </div>
                  <div className="md:col-span-5 flex flex-col justify-center">
                    <span className="text-pink-600 text-xs font-bold uppercase tracking-widest mb-4">Featured Story</span>
                    <h2 className="text-3xl md:text-4xl font-serif mb-4 group-hover:text-pink-700 transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                      {featuredPost.description}
                    </p>
                    <div className="flex items-center text-xs font-bold uppercase tracking-widest border-b border-black w-fit pb-1 group-hover:border-pink-700 group-hover:text-pink-700 transition-all">
                      Read Full Feature
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* 3. Latest Articles Grid */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-12 border-b pb-4 border-gray-100">Latest Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                {regularPosts.map((post) => (
                  <article key={post.id} className="group cursor-pointer">
                    <Link href={`/blog/${post.id}`}>
                      <div className="aspect-[3/4] overflow-hidden bg-gray-50 mb-6">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          {post.category || 'Lifestyle'} — {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <h4 className="text-xl font-serif group-hover:text-pink-800 transition-colors leading-snug">
                          {post.title}
                        </h4>
                        <p className="text-gray-500 text-sm line-clamp-2 italic">
                          "{post.description}"
                        </p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* 4. Minimal Footer Newsletter */}
      <footer className="bg-stone-50 py-20 mt-20 border-t border-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-serif mb-4">Stay in the Loop</h2>
          <p className="text-gray-500 text-sm mb-8">Sign up for our newsletter to receive styling tips and exclusive offers.</p>
          <div className="max-w-md mx-auto flex gap-2">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition"
            />
            <button className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition">
              Subscribe
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}