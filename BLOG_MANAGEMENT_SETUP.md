# 📚 Blog Management System Setup Guide

## Quick Start

Your Blog Management System is now ready to use! Follow these steps to get started:

## 1. Create the Blogs Table in Supabase

Go to your Supabase dashboard → SQL Editor and run this SQL:

```sql
-- Create blogs table
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'Fashion',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read for published blogs
CREATE POLICY "Allow public read published blogs" ON blogs
  FOR SELECT USING (status = 'published');

-- Create policies for authenticated users (admins) to manage blogs
CREATE POLICY "Allow authenticated users full access" ON blogs
  FOR ALL USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX blogs_status_idx ON blogs(status);
CREATE INDEX blogs_created_at_idx ON blogs(created_at DESC);
```

## 2. Navigate to Admin Panel

Once the table is created:

1. Open your admin panel at: `http://localhost:3000/admin`
2. Go to **Blog Management** (or `/admin/blogs`)
3. Click **+ Add Blog** to create your first blog post

## 3. Available Pages

### 📑 Blog List (`/admin/blogs`)
- View all blogs in a table format
- Search by title
- Pagination (10 items per page)
- Status badges (Draft/Published)
- Edit and Delete buttons

### ✍️ Add Blog (`/admin/blogs/add`)
- **Title** - Blog post title (required)
- **Description** - Brief summary for preview
- **Content** - Full blog content (supports plain text)
- **Category** - Fashion, Lifestyle, Trends, Tips & Tricks, Care Guide, News
- **Image** - Featured image (auto-uploaded to Supabase Storage)
- **Status** - Draft (hidden) or Published (visible to visitors)

### ✏️ Edit Blog (`/admin/blogs/edit/[id]`)
- Update any blog field
- Change image
- Toggle publish status
- Auto-saved with confirmation

## 4. Features

✅ **Image Upload**
- Automatic upload to Supabase Storage
- Shows preview before saving
- Images stored in `/products/blogs/` bucket

✅ **Status Management**
- **Draft** - Only admins see it
- **Published** - Visible on `/blog` page to all visitors

✅ **Alerts with SweetAlert2**
- Success messages after creating/updating
- Confirmation before deleting
- Error handling with detailed messages

✅ **Search & Pagination**
- Search blogs by title
- Paginate through blogs (10 per page)
- Clean table layout matching admin theme

✅ **Delete with Cleanup**
- Deletes blog from database
- Automatically removes image from storage
- Confirmation dialog

## 5. Front-End Display

Your public blog page at `/blog` will:
- ✅ Fetch only **published** blogs from database
- ✅ Display featured post with large image
- ✅ Show article grid with pagination
- ✅ Fallback to demo posts if no blogs exist

## 6. Database Schema

```
blogs
├── id (UUID) - Primary key
├── title (TEXT) - Blog title *required
├── description (TEXT) - Brief summary
├── content (TEXT) - Full content *required
├── image_url (TEXT) - Featured image URL
├── category (TEXT) - Category name
├── status (TEXT) - 'draft' or 'published'
├── created_at (TIMESTAMP) - Auto-generated
└── updated_at (TIMESTAMP) - Auto-generated
```

## 7. Customization

### Add More Categories
Edit `/admin/blogs/add/page.jsx` and `/admin/blogs/edit/[id]/page.jsx`:

```jsx
<option value="Your Category">Your Category</option>
```

### Change Image Storage
If using different bucket, update the upload code:

```javascript
// Find this line and change "products" to your bucket name:
.from("products")
```

### Modify Content Editor
Replace `<textarea>` with a rich text editor like:
- TipTap
- Quill
- Draft.js

## 8. Troubleshooting

**Q: Images not uploading?**
- Check Supabase bucket permissions
- Ensure `products` bucket exists
- Check image file size (max 5MB)

**Q: Blogs not showing on `/blog`?**
- Make sure status is set to "Published"
- Check browser console for errors
- Verify RLS policies are correct

**Q: Delete button not working?**
- Check RLS permissions
- Ensure authenticated user has delete access

## 9. Next Steps

💡 **Enhance the system:**
1. Add rich text editor (TipTap or Quill)
2. Add author field
3. Add comments section
4. Add tags system
5. Implement SEO meta fields
6. Add automatic slug generation
7. Add view count tracking

---

**Happy blogging! 🎉**
For questions, check your browser console for error messages.
