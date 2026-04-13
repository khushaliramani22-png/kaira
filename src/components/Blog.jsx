"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { supabase } from "@/lib/supabase"; 
export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("blogs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;
        setBlogs(data);
      } catch (err) {
        console.error("Error fetching blogs:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) return <div className="text-center py-5">Loading Blogs...</div>;
  if (blogs.length === 0) return null;

  return (
    <section className="blog py-5">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-5 mb-3">
          <h4 className="text-uppercase">Read Blog Posts</h4>
          <Link href="/blog" className="btn-link">View All</Link>
        </div>

        <div className="row">
          {blogs.map((post) => (
            <div className="col-md-4" key={post.id}>
              <article className="post-item">
                <div className="post-image">
                  <img 
                    src={post.image_url || "/images/placeholder.jpg"} 
                    className="img-fluid" 
                    alt={post.title} 
                    style={{ height: '250px', width: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div className="post-content my-3">
                  <div className="post-meta text-uppercase text-secondary small">
                    {post.category || 'Fashion'} 
                  </div>

                  <h5 className="text-uppercase mt-2">
                    <Link href={`/blog/${post.slug}`} className="text-decoration-none text-dark fw-bold">
                      {post.title}
                    </Link>
                  </h5>

                  <p className="text-muted small">
                    {post.excerpt || (post.content ? post.content.substring(0, 100) + '...' : '')}
                  </p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}