# Admin Logo Remove Feature

**Approved Plan Steps:**
- [x] 1. Edit src/app/admin/settings/page.jsx: Add Remove button next to logo filename (payment section)
- [x] 2. Button logic: Set store_logo='', delete from Supabase storage if URL, auto-save
- [x] 3. Test: Upload→Header img, Remove→Header SVG + storage clean

**Details:**
- Button: Red '× Remove' next to "Current: filename"
- Storage: If startsWith('https://') → extract path, supabase.storage.from('products').remove()
- Save: Trigger saveToSupabase()
- Header: Already handles '' → SVG

