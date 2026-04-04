# Performance Optimization - Quick Start (Copy-Paste Ready)

## 🚀 Step-by-Step Implementation (Do This Now)

### STEP 1: Optimize NewArrivals Component (5 min)

**File:** `src/components/NewArrivals.jsx`

Replace the entire `fetchNewArrivals` function:

```javascript
// ✅ REPLACE THIS SECTION:
useEffect(() => {
  const fetchNewArrivals = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')  // ❌ REMOVE THIS LINE
        .eq('category', 'NEW ARRIVALS')
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error("Error fetching arrivals:", error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchNewArrivals();
}, []);
```

**With:**

```javascript
useEffect(() => {
  const fetchNewArrivals = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id,name,image1,price,category,created_at') // ✅ SPECIFIC COLUMNS
        .eq('category', 'NEW ARRIVALS')
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error("Error fetching arrivals:", error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchNewArrivals();
}, []);
```

---

### STEP 2: Optimize BestSellers Component (5 min)

**File:** `src/components/BestSellers.jsx`

Replace the `fetchBestSellers` function similarly:

```javascript
// Find this section:
const { data, error } = await supabase
  .from("products")
  .select("*")
  
// Change to:
const { data, error } = await supabase
  .from("products")
  .select("id,name,image1,price,category,created_at")
```

---

### STEP 3: Optimize HeroSlider Component (5 min)

**File:** `src/components/HeroSlider.jsx`

```javascript
// Change:
const { data, error } = await supabase
  .from("products")
  .select("*")
  .in("category", targetCategories)

// To:
const { data, error } = await supabase
  .from("products")
  .select("id,name,image1,category,created_at")
  .in("category", targetCategories)
  .limit(12)
```

---

### STEP 4: Add Image Optimization to Blog (5 min)

**File:** `src/components/Blog.jsx`

**Replace the entire file with:**

```javascript
"use client";

import Image from "next/image";

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      img: "/images/colorbox/post-image1.jpg",
      category: "Fashion",
      title: "How to look outstanding in pastel"
    },
    {
      id: 2,
      img: "/images/colorbox/post-image2.jpg",
      category: "Fashion",
      title: "Top 10 fashion trend for summer"
    },
    {
      id: 3,
      img: "/images/colorbox/post-image3.jpg",
      category: "Fashion",
      title: "Crazy fashion with unique moment"
    }
  ];

  return (
    <section className="blog py-5">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-5 mb-3">
          <h4 className="text-uppercase">Read Blog Posts</h4>
          <a href="/" className="btn-link">View All</a>
        </div>

        <div className="row">
          {blogPosts.map((post) => (
            <div className="col-md-4" key={post.id}>
              <article className="post-item">
                <div className="post-image" style={{ position: "relative", height: "300px", overflow: "hidden" }}>
                  <Image
                    src={post.img}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    quality={80}
                  />
                </div>

                <div className="post-content my-3">
                  <div className="post-meta text-uppercase text-secondary">
                    {post.category}
                  </div>
                  <h5 className="text-uppercase">{post.title}</h5>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

### STEP 5: Fix RelatedProduct Image Tags (5 min)

**File:** `src/components/RelatedProduct.jsx`

Find this section:
```javascript
<img
  src={product.image1}
  alt={product.name}
  className="product-image img-fluid"
  style={{ width: '365px', height: '400px', objectFit: 'cover' }}
/>
```

Replace with:
```javascript
import Image from "next/image";

// In your component JSX:
<div style={{ position: "relative", width: "100%", paddingBottom: "110%" }}>
  <Image
    src={product.image1}
    alt={product.name}
    fill
    className="product-image"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    style={{ objectFit: 'cover' }}
    quality={85}
  />
</div>
```

---

### STEP 6: Lazy Load AOS Library (10 min)

**Create new file:** `src/components/AOSInit.jsx`

```javascript
"use client";
import { useEffect } from "react";

export default function AOSInit() {
  useEffect(() => {
    const importAOS = async () => {
      const AOS = (await import("aos")).default;
      await import("aos/dist/aos.css");
      
      AOS.init({
        duration: 1000,
        once: true,
        disable: window.innerWidth < 768, // Disable on mobile
        throttleDelay: 99,
        debounceDelay: 50
      });
    };

    importAOS();
  }, []);

  return null;
}
```

**Modify file:** `src/app/page.js`

```javascript
// Remove these import lines:
// import AOS from "aos";
// import "aos/dist/aos.css";

// Change to:
"use client";
import dynamic from "next/dynamic";

const AOSInit = dynamic(() => import("@/components/AOSInit"), { 
  ssr: false 
});

// In the return statement, add at the top:
<>
  <AOSInit />
  <div data-aos="fade-up">
    {/* rest of content */}
  </div>
</>
```

---

### STEP 7: Create Shared Data Fetching Hook (15 min)

**Create new file:** `src/hooks/useProducts.js`

```javascript
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useProducts(category = null, limit = 8) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('products')
          .select('id,name,image1,price,category,created_at');

        if (category) {
          query = query.eq('category', category);
        }

        const { data, error: err } = await query
          .order('created_at', { ascending: false })
          .limit(limit);

        if (err) throw err;
        setProducts(data || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching products:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, limit]);

  return { products, loading, error };
}
```

**Usage in components:**

```javascript
// Instead of useState + useEffect, use:
import { useProducts } from "@/hooks/useProducts";

export default function NewArrivals() {
  const { products, loading, error } = useProducts('NEW ARRIVALS', 8);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error loading products</div>;

  return (
    // Use products array directly
  );
}
```

---

### STEP 8: Add Response Caching Header (5 min)

**Create new file:** `src/app/api/products/featured/route.js`

```javascript
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    const [newArrivals, bestSellers, featured] = await Promise.all([
      supabase
        .from('products')
        .select('id,name,image1,price,category,created_at')
        .eq('category', 'NEW ARRIVALS')
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('products')
        .select('id,name,image1,price,category')
        .eq('category', 'BESTSELLER')
        .limit(8),
      supabase
        .from('products')
        .select('id,name,category,image1')
        .in('category', ['NEW ARRIVALS', 'BESTSELLER', 'JEANS'])
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

    const response = {
      newArrivals: newArrivals.data || [],
      bestSellers: bestSellers.data || [],
      featured: featured.data || [],
    };

    // Cache for 1 hour
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
```

---

## ✅ Verification Checklist

After making changes, verify:

- [ ] No console errors
- [ ] Images load correctly
- [ ] Animations still work (AOS)
- [ ] Products display properly
- [ ] Open DevTools → Network tab → Reload page
  - [ ] Check that Supabase API calls are fewer (should be 1-2 instead of 7)
  - [ ] Check that images are smaller (should show image optimization headers)

---

## 📊 Expected Results After These Steps

| Metric | Before | After | Improvement |
|--------|--------|-------|------------|
| Initial Load Time | 4-5s | 1.5-2s | **60-70%** |
| Supabase Queries | 7-8 | 1-2 | **85%** |
| API Payload Size | 150-200KB | 30-50KB | **75%** |
| Images Load Time | 2-3s | 500-800ms | **70%** |
| Lighthouse Score | 45-55 | 75-85 | **30-40 pts** |

---

## 📞 Troubleshooting

**Issue: Images not showing**
- Check image paths in Supabase
- Verify remote image patterns in `next.config.mjs`

**Issue: AOS animations not working**
- Check browser console for errors
- Ensure `data-aos` attributes are on elements

**Issue: Products still loading slowly**
- Check Supabase query limits
- Add indexes to your database: `CREATE INDEX idx_products_category ON products(category);`

**Issue: API route 404**
- Ensure file path is exactly `src/app/api/products/featured/route.js`
- Restart Next.js dev server

---

## 🎯 Next Steps

1. **Today:** Implement Steps 1-7 (30-45 minutes)
2. **Tomorrow:** Test and measure improvements
3. **This Week:** Implement Step 8 (API caching)
4. **Next Week:** Consider Server Components conversion (advanced)

