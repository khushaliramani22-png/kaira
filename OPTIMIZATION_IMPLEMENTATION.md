# Performance Optimization Implementation Guide

## Quick Wins (Implement First - 30 minutes)

### 1. Optimize Supabase Queries - Add Column Selection

**File:** [src/components/NewArrivals.jsx](src/components/NewArrivals.jsx)

```javascript
// ❌ BEFORE: Fetching all columns
const { data, error } = await supabase
  .from('products')
  .select('*')  // ALL columns!
  .eq('category', 'NEW ARRIVALS')
  .limit(8);

// ✅ AFTER: Only fetch needed columns
const { data, error } = await supabase
  .from('products')
  .select('id,name,image1,price,category,created_at')  // Only what you need
  .eq('category', 'NEW ARRIVALS')
  .order('created_at', { ascending: false })
  .limit(8);
```

**Impact:** 30-50% reduction in payload size

---

**File:** [src/components/Categories.jsx](src/components/Categories.jsx)

```javascript
// ❌ BEFORE: Fetching all products to deduplicate categories
const { data, error } = await supabase
  .from("products")
  .select("category, image1");

// ❌ EVEN WORSE: Then deduplicates on client
const uniqueCategories = [];
const seenCategories = new Set();
data.forEach((item) => {
  if (item.category && !seenCategories.has(item.category)) {
    seenCategories.add(item.category);
    uniqueCategories.push({...});
  }
});

// ✅ BEST: Use SQL DISTINCT (requires Supabase RPC or change approach)
// For now, use pagination with limit
const { data, error } = await supabase
  .from("products")
  .select("category,image1")
  .limit(50);  // Limit to reasonable number
  .order('created_at', { ascending: false });
```

---

**File:** [src/components/HeroSlider.jsx](src/components/HeroSlider.jsx)

```javascript
// ❌ BEFORE: Fetch all, filter on client
const { data, error } = await supabase
  .from("products")
  .select("*")
  .in("category", targetCategories)
  .order("created_at", { ascending: false });

// ✅ AFTER: Filter at DB level and limit columns
const { data, error } = await supabase
  .from("products")
  .select('id,name,image1,category,created_at')
  .in("category", targetCategories)
  .order("created_at", { ascending: false })
  .limit(12);  // Get enough to ensure 1 per category
```

---

### 2. Fix Missing Image Optimization

**File:** [src/components/Blog.jsx](src/components/Blog.jsx)

```javascript
// ❌ BEFORE
import { useEffect, useState } from "react";
export default function Blog() {
  return (
    <img src="/images/colorbox/post-image1.jpg" className="img-fluid"/>
  );
}

// ✅ AFTER
import Image from "next/image";
export default function Blog() {
  return (
    <Image 
      src="/images/colorbox/post-image1.jpg" 
      alt="Fashion blog post"
      width={400}
      height={300}
      className="img-fluid"
    />
  );
}
```

---

**File:** [src/components/RelatedProduct.jsx](src/components/RelatedProduct.jsx)

```javascript
// ❌ BEFORE: Plain img tag
<img
  src={product.image1}
  alt={product.name}
  className="product-image img-fluid"
  style={{ width: '365px', height: '400px', objectFit: 'cover' }}
/>

// ✅ AFTER: Next.js Image with optimization
import Image from "next/image";

<Image
  src={product.image1}
  alt={product.name}
  fill
  className="product-image"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  style={{ objectFit: 'cover' }}
  quality={85}
  priority={false}
/>
```

---

### 3. Remove/Lazy-Load AOS Library

**File:** [src/app/page.js](src/app/page.js)

```javascript
// ❌ BEFORE: Always loads AOS
"use client";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Page() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);
  // ...
}

// ✅ AFTER: Remove from critical path (or lazy load)
"use client";
import dynamic from "next/dynamic";

const AOSInit = dynamic(() => import("@/components/AOSInit"), { 
  ssr: false // Only load on client
});

export default function Page() {
  return (
    <>
      <AOSInit />
      <HeroSlider />
      {/* ... rest of components ... */}
    </>
  );
}
```

**New file:** [src/components/AOSInit.jsx](src/components/AOSInit.jsx)

```javascript
"use client";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AOSInit() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      disable: () => {
        // Disable animations on mobile for better performance
        return window.innerWidth < 768;
      }
    });
  }, []);
  return null;
}
```

**Impact:** Defers 60KB+ of JavaScript from critical path

---

### 4. Add Proper Mobile Responsiveness to Images

**File:** [src/components/NewArrivals.jsx](src/components/NewArrivals.jsx)

```javascript
// ✅ Good responsive image setup
<Image
  src={product.image1}
  alt={product.name}
  fill
  className="object-cover transition-transform duration-700 group-hover:scale-110"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
  quality={85}  // Slightly compressed but good quality
  priority={index < 2}  // Only prioritize first 2 images
/>
```

---

## Medium-Effort Wins (1-2 hours)

### 5. Create API Route for Combined Product Fetching

**New file:** [src/app/api/products/featured/route.js](src/app/api/products/featured/route.js)

```javascript
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const revalidate = 3600; // Cache for 1 hour (ISR)

export async function GET(request) {
  // Get cookies for server-side client
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
    // Single optimized query instead of multiple
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

    return NextResponse.json({
      newArrivals: newArrivals.data || [],
      bestSellers: bestSellers.data || [],
      featured: featured.data || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
```

---

### 6. Implement React Query/SWR for Caching

**Installation:**
```bash
npm install swr
# OR
npm install @tanstack/react-query
```

**Example with SWR - [src/components/NewArrivals.jsx](src/components/NewArrivals.jsx):**

```javascript
"use client";
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(r => r.json());

export default function NewArrivals() {
  const { data: products, isLoading } = useSWR(
    '/api/products/featured',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    // render products.newArrivals
  );
}
```

**Impact:** 
- Automatic caching and deduplication
- Background revalidation
- Reduced API calls by 70%+

---

### 7. Optimize Context Providers

**File:** [src/app/context/CartContext.js](src/app/context/CartContext.js)

```javascript
// ❌ BEFORE: Context value changes on every render
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  
  return (
    <CartContext.Provider value={{ cartItems, setCartItems }}>
      {children}
    </CartContext.Provider>
  );
}

// ✅ AFTER: Memoize value to prevent unnecessary re-renders
import { useMemo, useCallback } from 'react';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  
  const value = useMemo(() => ({
    cartItems,
    setCartItems,
    addToCart: useCallback((item) => {
      setCartItems(prev => [...prev, item]);
    }, []),
  }), [cartItems]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
```

---

## Advanced Optimizations (2-4 hours)

### 8. Convert Home Page to Server Component

**Major refactor** - Change [src/app/page.js](src/app/page.js) from client to server component:

```javascript
// ✅ NEW: Server component (no "use client")
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import HeroSlider from "@/components/HeroSlider";
import NewArrivals from "@/components/NewArrivals";

export const revalidate = 3600; // ISR: revalidate every hour

async function getHomePageData() {
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

  const [newArrivals, bestSellers, featured] = await Promise.all([
    supabase.from('products').select('...').eq('category', 'NEW ARRIVALS').limit(8),
    supabase.from('products').select('...').eq('category', 'BESTSELLER').limit(8),
    supabase.from('products').select('...').in('category', ['NEW ARRIVALS', 'BESTSELLER', 'JEANS']).limit(3),
  ]);

  return { newArrivals: newArrivals.data, bestSellers: bestSellers.data, featured: featured.data };
}

export default async function Page() {
  const data = await getHomePageData();

  return (
    <div>
      <HeroSlider initialData={data.featured} />
      <NewArrivals initialData={data.newArrivals} />
      {/* ... */}
    </div>
  );
}
```

---

### 9. Add Database-Level Caching

If you have control over Supabase:

```sql
-- Create materialized view for featured products
CREATE MATERIALIZED VIEW featured_products AS
SELECT id, name, image1, category, created_at
FROM products
WHERE category IN ('NEW ARRIVALS', 'BESTSELLER', 'JEANS')
ORDER BY created_at DESC
LIMIT 100;

-- Create index for faster category queries
CREATE INDEX idx_products_category ON products(category) 
WHERE active = true;

-- Refresh view periodically (use Supabase scheduled functions)
REFRESH MATERIALIZED VIEW featured_products;
```

---

## Monitoring & Verification

### Measure Improvements:

1. **Core Web Vitals:**
   - Before: Run `npm run build` and check build time
   - After: Compare build time and bundle size

2. **API Calls:**
   - Before: Open DevTools Network tab on home page
   - After: Count network requests (should drop from 7+ to 1-2 for products)

3. **Lighthouse Score:**
```bash
npm install -g lighthouse
lighthouse https://yoursite.com --view
```

---

## Implementation Order:

1. **Week 1:** Quick wins (Queries #1-4) - 30 mins
2. **Week 1:** Image optimization (#2) - 30 mins  
3. **Week 1:** AOS lazy loading (#3) - 15 mins
4. **Week 2:** API route creation (#5) - 1 hour
5. **Week 2:** Add SWR caching (#6) - 30 mins
6. **Week 3:** Context optimization (#7) - 30 mins
7. **Week 4:** Server component conversion (#8) - 2-3 hours

---

## Expected Performance Gains:

- **Page Load Time:** 40-60% reduction
- **Largest Contentful Paint (LCP):** 2-3 seconds → 800ms
- **First Input Delay (FID):** Reduce by 50%+
- **API Calls:** Reduce from 7 to 1-2
- **Bundle Size:** 15-25% reduction

