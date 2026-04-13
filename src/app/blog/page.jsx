import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

async function getBlogs() {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }
    
    return data;
  } catch (err) {
    return [];
  }
}

export default async function ProfessionalBlogPage() {
  const posts = await getBlogs();
  
  const featuredPost = posts[0];
  const latestFeatures = posts.slice(1, 4);
  const regularPosts = posts.slice(4);

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900">
      <header className="py-20 border-b border-gray-100">
        <div className="container mx-auto px-6 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold mb-4 block">The Kaira Edit</span>
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
            {/* ૨. Featured Post Section */}
            {featuredPost && (
              <section className="mb-24">
        
                <Link 
                  href={`/blog/${featuredPost.slug || featuredPost.id}`} 
                  className="group grid md:grid-cols-12 gap-12 items-center"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="md:col-span-7 overflow-hidden bg-gray-100 aspect-[16/10] rounded-sm">
                    <img
                      src={featuredPost.image_url}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  </div>
                  <div className="md:col-span-5 flex flex-col justify-center">
                    <span className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-4">Must Read</span>
                    <h2 className="text-3xl md:text-5xl font-serif mb-6 group-hover:text-gray-700 transition-colors leading-tight" style={{ textDecoration: 'none' }}>
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 mb-8 line-clamp-3 leading-relaxed text-lg" style={{ textDecoration: 'none' }}>
                      {featuredPost.description}
                    </p>
                    <div className="flex items-center text-xs font-bold uppercase tracking-widest border-b border-black w-fit pb-2 group-hover:border-gray-700 group-hover:text-gray-700 transition-all">
                      Read Full Feature
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* ૩. Latest Features Section */}
            {latestFeatures.length > 0 && (
              <section className="mb-24 py-16 border-y border-gray-100 bg-stone-50/50 -mx-6 px-6">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900">Latest Features</h3>
                  <div className="h-[1px] flex-1 bg-gray-200 mx-8"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {latestFeatures.map((post) => (
                    <Link 
                      key={post.id} 
                      href={`/blog/${post.slug || post.id}`} 
                      className="group"
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="aspect-video overflow-hidden mb-6">
                        <img 
                          src={post.image_url} 
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">{post.category}</span>
                      <h4 className="text-xl font-serif mt-2 group-hover:text-gray-400 transition-colors leading-snug" style={{ textDecoration: 'none' }}>
                        {post.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ૪. Latest Articles Grid */}
            {regularPosts.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-12 border-b pb-4 border-gray-100 text-gray-400">All Stories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                  {regularPosts.map((post) => (
                    <article key={post.id} className="group cursor-pointer">
                      <Link 
                        href={`/blog/${post.slug || post.id}`} 
                        style={{ textDecoration: 'none' }}
                      >
                        <div className="aspect-[3/4] overflow-hidden bg-gray-50 mb-6 rounded-sm">
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                              {post.category || 'Lifestyle'}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-2xl font-serif group-hover:text-gray-800 transition-colors leading-snug" style={{ textDecoration: 'none' }}>
                            {post.title}
                          </h4>
                          <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed" style={{ textDecoration: 'none' }}>
                            {post.description}
                          </p>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="bg-stone-50 py-24 mt-20 border-t border-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-serif mb-4">Stay in the Loop</h2>
          <p className="text-gray-500 text-sm mb-10 max-w-sm mx-auto">
            Sign up for our newsletter to receive styling tips, trend reports, and exclusive offers.
          </p>
          <div className="max-w-md mx-auto flex flex-col md:flex-row gap-0">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 bg-white border border-gray-200 px-6 py-4 text-sm focus:outline-none focus:border-black transition"
            />
            <button className="bg-black text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition mt-4 md:mt-0">
              Subscribe
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}