"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useSettings } from "@/hooks/useSettings";

export default function Header() {
  const { totalCount } = useCart();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isPageOpen, setIsPageOpen] = useState(false);
  const pageRef = useRef(null);

  const dropdownRef = useRef(null);
  const shopRef = useRef(null);
  const router = useRouter();

  const { global } = useSettings();
  const storeName = global?.store_name || "Kaira Fashion Store";

  const shopCategories = [
    "NEW ARRIVALS", "BESTSELLER", "FS WORK", "DRESSES", "CO-ORDS",
    "TOPS & SHIRTS", "TEES", "WAISTCOATS", "CAMIS & TANKS",
    "BLAZERS", "TROUSERS", "JEANS", "LIVIN PANTS", "SKIRTS & SKORTS"
  ];
  const closeMobileMenu = () => {
    if (typeof window !== "undefined") {
      const menuElement = document.getElementById('offcanvasNavbar');
      if (menuElement) {
        import('bootstrap').then((bootstrap) => {
          const bsOffcanvas = bootstrap.Offcanvas.getInstance(menuElement) || new bootstrap.Offcanvas(menuElement);
          bsOffcanvas.hide();
        });
      }
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    // Listen for custom profile picture update event
    const handleProfileUpdate = (event) => {
      console.log('Profile update event received:', event.detail);
      setUser(event.detail.user);
    };

    window.addEventListener('profilePictureUpdated', handleProfileUpdate);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (shopRef.current && !shopRef.current.contains(event.target)) {
        setIsShopOpen(false);
      }
      if (pageRef.current && !pageRef.current.contains(event.target)) {
        setIsPageOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
      window.removeEventListener('profilePictureUpdated', handleProfileUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    closeMobileMenu();
    router.push("/login");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-light text-uppercase fs-6 p-3 border-bottom align-items-center">
        <div className="container-fluid">
          <div className="row justify-content-between align-items-center w-100">

            {/* LOGO */}
            <div className="col-auto">
              <a className="navbar-brand text-black" href="/">
                {global?.store_logo && global.store_logo.trim() !== '' ? (
                  <img
                    src={global.store_logo.startsWith('http') ? global.store_logo : `/images/colorbox/${global.store_logo}`}
                    alt={`${storeName} Logo`}
                    style={{ width: '112px', height: '45px', objectFit: 'contain' }}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <svg width="112" height="45" viewBox="0 0 112 45" xmlns="http://www.w3.org/2000/svg" fill="#111">
                    <path d="M2.51367 34.9297C2.58398 34.6836 2.64844 34.3789 2.70703 34.0156C2.77734 33.6523 2.83594 33.2012 2.88281 32.6621C2.92969 32.123 2.96484 31.4844 2.98828 30.7461C3.01172 29.9961 3.02344 29.123 3.02344 28.127V16.6836C3.02344 15.6875 3.01172 14.8203 2.98828 14.082C2.96484 13.332 2.92969 12.6875 2.88281 12.1484C2.83594 11.5977 2.77734 11.1406 2.70703 10.7773C2.64844 10.4141 2.58398 10.1094 2.51367 9.86328V9.79297H6.73242V9.86328C6.66211 10.1094 6.5918 10.4141 6.52148 10.7773C6.46289 11.1406 6.41016 11.5977 6.36328 12.1484C6.32812 12.6875 6.29297 13.332 6.25781 14.082C6.23438 14.8203 6.22266 15.6875 6.22266 16.6836V20.6035L16.4883 12.2188C17.6367 11.2813 18.2109 10.4727 18.2109 9.79297H23.1504V9.86328C22.459 10.0273 21.7559 10.3437 21.041 10.8125C20.3379 11.2695 19.5879 11.832 18.791 12.5L9.7207 20.0938L20.6367 32.082C21.0938 32.5508 21.4805 32.9434 21.7969 33.2598C22.125 33.5645 22.4121 33.8223 22.6582 34.0332C22.9043 34.2324 23.127 34.4023 23.3262 34.543C23.5371 34.6719 23.7539 34.8008 23.9766 34.9297V35H18.8262C18.7793 34.8945 18.6973 34.7598 18.5801 34.5957C18.4746 34.4316 18.3457 34.2617 18.1934 34.0859C18.0527 33.9102 17.8945 33.7285 17.7188 33.541C17.5547 33.3535 17.3965 33.1777 17.2441 33.0137L6.22266 20.9199V28.127C6.22266 29.123 6.23438 29.9961 6.25781 30.7461C6.29297 31.4844 6.32812 32.123 6.36328 32.6621C6.41016 33.2012 6.46289 33.6523 6.52148 34.0156C6.5918 34.3789 6.66211 34.6836 6.73242 34.9297V35H2.51367V34.9297ZM45.3846 35V34.9297C45.408 34.8711 45.4256 34.7832 45.4373 34.666C45.4491 34.5488 45.4549 34.4434 45.4549 34.3496C45.4549 33.9863 45.4022 33.5879 45.2967 33.1543C45.203 32.709 45.0155 32.1582 44.7342 31.502L42.6073 26.7207C41.951 26.6973 41.078 26.6855 39.9881 26.6855C38.8983 26.6855 37.7205 26.6855 36.4549 26.6855C35.5291 26.6855 34.6327 26.6855 33.7655 26.6855C32.91 26.6855 32.1366 26.6973 31.4452 26.7207L29.4237 31.3613C29.2479 31.7949 29.0604 32.2695 28.8612 32.7852C28.662 33.3008 28.5623 33.8223 28.5623 34.3496C28.5623 34.502 28.5741 34.6309 28.5975 34.7363C28.6209 34.8301 28.6444 34.8945 28.6678 34.9297V35H25.0819V34.9297C25.2928 34.707 25.5565 34.3145 25.8729 33.752C26.1893 33.1777 26.535 32.4629 26.91 31.6074L36.9823 9.26562H38.3885L47.9334 30.7461C48.1561 31.25 48.3846 31.7422 48.619 32.2227C48.8651 32.6914 49.0936 33.1133 49.3045 33.4883C49.5155 33.8633 49.703 34.1797 49.867 34.4375C50.0311 34.6953 50.1424 34.8594 50.201 34.9297V35H45.3846ZM33.994 25.1738C34.6737 25.1738 35.3709 25.1738 36.0858 25.1738C36.8006 25.1621 37.4979 25.1562 38.1776 25.1562C38.869 25.1445 39.5311 25.1387 40.1639 25.1387C40.7967 25.127 41.3709 25.1152 41.8866 25.1035L36.9471 13.9414L32.0955 25.1738H33.994ZM54.6989 34.9297C54.7692 34.6836 54.8337 34.3789 54.8923 34.0156C54.9509 33.6523 55.0036 33.2012 55.0505 32.6621C55.0973 32.123 55.1325 31.4844 55.1559 30.7461C55.1794 29.9961 55.1911 29.123 55.1911 28.127V16.6836C55.1911 15.6875 55.1794 14.8203 55.1559 14.082C55.1325 13.332 55.0973 12.6875 55.0505 12.1484C55.0036 11.5977 54.9509 11.1406 54.8923 10.7773C54.8337 10.4141 54.7692 10.1094 54.6989 9.86328V9.79297H58.9001V9.86328C58.8298 10.1094 58.7595 10.4141 58.6891 10.7773C58.6305 11.1406 58.5778 11.5977 58.5309 12.1484C58.4958 12.6875 58.4606 13.332 58.4255 14.082C58.402 14.8203 58.3903 15.6875 58.3903 16.6836V28.127C58.3903 29.123 58.402 29.9961 58.4255 30.7461C58.4606 31.4844 58.4958 32.123 58.5309 32.6621C58.5778 33.2012 58.6305 33.6523 58.6891 34.0156C58.7595 34.3789 58.8298 34.6836 58.9001 34.9297V35H54.6989V34.9297ZM69.9722 28.127C69.9722 29.123 69.9839 29.9961 70.0073 30.7461C70.0425 31.4844 70.0777 32.123 70.1128 32.6621C70.1597 33.2012 70.2124 33.6523 70.271 34.0156C70.3413 34.3789 70.4116 34.6836 70.482 34.9297V35H66.2632V34.9297C66.3335 34.6836 66.398 34.3789 66.4566 34.0156C66.5269 33.6523 66.5796 33.2012 66.6148 32.6621C66.6616 32.123 66.6968 31.4844 66.7202 30.7461C66.7554 30.0078 66.773 29.1348 66.773 28.127V16.6836C66.773 15.6875 66.7554 14.8203 66.7202 14.082C66.6968 13.332 66.6616 12.6875 66.6148 12.1484C66.5796 11.6094 66.5269 11.1582 66.4566 10.7949C66.398 10.4199 66.3335 10.1094 66.2632 9.86328V9.79297L67.0015 9.86328C67.2241 9.88672 67.4702 9.9043 67.7398 9.91602C68.021 9.91602 68.3081 9.91602 68.6011 9.91602C69.0581 9.91602 69.6734 9.86328 70.4468 9.75781C71.232 9.64062 72.228 9.58203 73.4351 9.58203C74.5601 9.58203 75.5972 9.73438 76.5464 10.0391C77.5073 10.3437 78.3394 10.7891 79.0425 11.375C79.7456 11.9609 80.2905 12.6816 80.6773 13.5371C81.0757 14.3809 81.2749 15.3418 81.2749 16.4199C81.2749 17.2637 81.1636 18.0488 80.9409 18.7754C80.73 19.4902 80.4253 20.1406 80.0269 20.7266C79.6402 21.3125 79.1714 21.834 78.6206 22.291C78.0698 22.7363 77.4546 23.1113 76.7749 23.416L82.9448 32.082C83.2495 32.5156 83.5308 32.8906 83.7886 33.207C84.0581 33.5234 84.3101 33.7988 84.5445 34.0332C84.7905 34.2559 85.0249 34.4434 85.2476 34.5957C85.4702 34.7363 85.6987 34.8477 85.9331 34.9297V35H80.853C80.8179 34.7773 80.7007 34.4844 80.5015 34.1211C80.314 33.7461 80.0913 33.377 79.8335 33.0137L73.6109 24.2422C73.3413 24.2656 73.0718 24.2891 72.8023 24.3125C72.5327 24.3242 72.2573 24.3301 71.9761 24.3301C71.648 24.3301 71.314 24.3184 70.9741 24.2949C70.646 24.2715 70.312 24.2305 69.9722 24.1719V28.127ZM69.9722 22.8008C70.2886 22.8711 70.6109 22.9238 70.939 22.959C71.2671 22.9824 71.5835 22.9941 71.8882 22.9941C72.7671 22.9941 73.5698 22.8652 74.2964 22.6074C75.023 22.3379 75.6382 21.9336 76.1421 21.3945C76.6577 20.8555 77.0562 20.1875 77.3374 19.3906C77.6187 18.582 77.7593 17.6387 77.7593 16.5605C77.7593 15.6816 77.6597 14.8848 77.4605 14.1699C77.2612 13.4551 76.9624 12.8516 76.564 12.3594C76.1773 11.8555 75.6851 11.4687 75.0874 11.1992C74.4898 10.918 73.7925 10.7773 72.9956 10.7773C72.187 10.7773 71.5425 10.8184 71.062 10.9004C70.5816 10.9824 70.2183 11.0703 69.9722 11.1641V22.8008ZM107.13 35V34.9297C107.154 34.8711 107.171 34.7832 107.183 34.666C107.195 34.5488 107.201 34.4434 107.201 34.3496C107.201 33.9863 107.148 33.5879 107.042 33.1543C106.949 32.709 106.761 32.1582 106.48 31.502L104.353 26.7207C103.697 26.6973 102.824 26.6855 101.734 26.6855C100.644 26.6855 99.4662 26.6855 98.2005 26.6855C97.2748 26.6855 96.3783 26.6855 95.5111 26.6855C94.6556 26.6855 93.8822 26.6973 93.1908 26.7207L91.1693 31.3613C90.9935 31.7949 90.806 32.2695 90.6068 32.7852C90.4076 33.3008 90.308 33.8223 90.308 34.3496C90.308 34.502 90.3197 34.6309 90.3431 34.7363C90.3666 34.8301 90.39 34.8945 90.4134 34.9297V35H86.8275V34.9297C87.0384 34.707 87.3021 34.3145 87.6185 33.752C87.9349 33.1777 88.2806 32.4629 88.6556 31.6074L98.7279 9.26562H100.134L109.679 30.7461C109.902 31.25 110.13 31.7422 110.365 32.2227C110.611 32.6914 110.839 33.1133 111.05 33.4883C111.261 33.8633 111.449 34.1797 111.613 34.4375C111.777 34.6953 111.888 34.8594 111.947 34.9297V35H107.13ZM95.7396 25.1738C96.4193 25.1738 97.1166 25.1738 97.8314 25.1738C98.5462 25.1621 99.2435 25.1562 99.9232 25.1562C100.615 25.1445 101.277 25.1387 101.91 25.1387C102.542 25.127 103.117 25.1152 103.632 25.1035L98.6927 13.9414L93.8412 25.1738H95.7396Z"></path>
                  </svg>
                )}
              </a>
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="col-auto">
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasNavbar"
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              {/* OFFCANVAS MENU */}
              <div
                className="offcanvas offcanvas-end"
                tabIndex="-1"
                id="offcanvasNavbar"
              >
                <div className="offcanvas-header">
                  <h5>Menu</h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                  ></button>
                </div>

                <div className="offcanvas-body">
                  <ul className="navbar-nav gap-4">
                    <li className="nav-item">
                      <Link href="/" className="nav-link active" onClick={closeMobileMenu}>
                        Home
                      </Link>

                    </li>

                    {/* SHOP DROPDOWN START */}
                    <li className="nav-item position-relative" ref={shopRef}>
                      <button
                        onClick={() => setIsShopOpen(!isShopOpen)}
                        className="nav-link border-0 bg-transparent text-uppercase small tracking-widest"
                        style={{ fontWeight: '500' }}
                      >
                        Shop {isShopOpen ? '▴' : '▾'}
                      </button>

                      {isShopOpen && (
                        <div
                          className="position-absolute shadow-xl py-4 z-50 animate-in fade-in slide-in-from-top-1"
                          style={{
                            backgroundColor: 'white',
                            width: '260px',
                            top: '100%',
                            left: '0',
                            border: '1px solid #e5d9cc',
                            zIndex: 9999,
                            display: 'block'
                          }}
                        >
                          <ul className="list-unstyled m-0">
                            {shopCategories.map((cat, index) => (
                              <li key={index}>
                                <Link
                                  href={`/shop?category=${cat.toLowerCase().replace(/ /g, '-')}`}
                                  className="d-block px-4 py-2 text-decoration-none text-dark hover-bg-white/40"
                                  style={{ fontSize: '13px', letterSpacing: '0.05em', fontWeight: '400' }}
                                  onClick={() => {
                                    setIsShopOpen(false);
                                    closeMobileMenu();
                                  }}
                                >
                                  {cat}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>


                    {/* BLOG LINK */}
                    <li className="nav-item">
                      <Link href="/blog" className="nav-link" onClick={closeMobileMenu}>
                        Blog
                      </Link>
                    </li>

                    {/* PAGE DROPDOWN */}
                    <li className="nav-item position-relative" ref={pageRef}>
                      <button
                        onClick={() => setIsPageOpen(!isPageOpen)}
                        className="nav-link border-0 bg-transparent text-uppercase small"
                        style={{ fontWeight: '500' }}
                      >
                        Page {isPageOpen ? '▴' : '▾'}
                      </button>

                      {isPageOpen && (
                        <div className="position-absolute shadow-lg py-2 z-3 bg-white border"
                          style={{ width: '200px', top: '100%', left: '0' }}>
                          <ul className="list-unstyled m-0">
                            <li><Link href="/about" className="dropdown-item py-2 px-3" onClick={() => { setIsPageOpen(false); closeMobileMenu(); }}>About</Link></li>
                            <li><Link href="/cart" className="dropdown-item py-2 px-3" onClick={() => { setIsPageOpen(false); closeMobileMenu(); }}>Cart</Link></li>
                            <li><Link href="/checkout" className="dropdown-item py-2 px-3" onClick={() => { setIsPageOpen(false); closeMobileMenu(); }}>Checkout</Link></li>
                            <li><Link href="/user-order" className="dropdown-item py-2 px-3" onClick={() => { setIsPageOpen(false); closeMobileMenu(); }}> My Orders</Link></li>
                            <li><Link href="/myaccount" className="dropdown-item py-2 px-3" onClick={() => { setIsPageOpen(false); closeMobileMenu(); }}> My Account</Link></li>

                            <li><Link href="/contact" className="dropdown-item py-2 px-3" onClick={() => { setIsPageOpen(false); closeMobileMenu(); }}>Contact</Link></li>
                            <li><Link href="/order-tracking" className="dropdown-item py-2 px-3" onClick={() => { setIsPageOpen(false); closeMobileMenu(); }}>Order Tracking</Link></li>
                          </ul>
                        </div>
                      )}
                    </li>


                    <li className="nav-item">
                      <Link href="/contact" className="nav-link" onClick={closeMobileMenu}>
                        Contact
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* RIGHT MENU======login====== */}
            <div className="col-3 col-lg-auto">
              <ul className="list-unstyled d-flex m-0">
                {/* USER LOGIN & DROPDOWN SECTION */}
                <li className="d-flex align-items-center me-3 position-relative" ref={dropdownRef}>

                  <div
                    className="d-flex align-items-center"
                    style={{ cursor: 'pointer' }}
                    onClick={() => user ? setIsDropdownOpen(!isDropdownOpen) : router.push("/login")}
                  >
                    {user ? (
                      <>
                        <span className="text-lowercase fw-bold text-primary me-2 d-none d-sm-inline" style={{ fontSize: '13px' }}>
                          hello, {user.user_metadata?.full_name?.split(' ')[0] || "user"}
                        </span>

                        {/* Profile Icon with Active State Color */}
                        <div className={`d-flex flex-column align-items-center ${isDropdownOpen ? 'text-[#800080]' : 'text-black'}`}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0-3-3 3 3 0 0 0 3 3z" />
                          </svg>

                          <span className="fw-bold" style={{ fontSize: '10px', marginTop: '-2px', borderBottom: isDropdownOpen ? '2px solid #800080' : 'none' }}>
                            Profile
                          </span>
                        </div>
                      </>
                    ) : (
                      <Link href="/login" className="text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0-3-3 3 3 0 0 0 3 3z" />
                        </svg>
                      </Link>
                    )}
                  </div>
                  {user && isDropdownOpen && (
                    <div
                      className="bg-white shadow-lg border rounded-3 overflow-hidden"                     
                    
                      style={{

                        position: typeof window !== 'undefined' && window.innerWidth < 768 ? 'fixed' : 'absolute',


                        top: typeof window !== 'undefined' && window.innerWidth < 768 ? '80px' : '120%',
                        left: typeof window !== 'undefined' && window.innerWidth < 768 ? '50%' : 'auto',
                        right: typeof window !== 'undefined' && window.innerWidth < 768 ? 'auto' : '0',

                        transform: typeof window !== 'undefined' && window.innerWidth < 768 ? 'translateX(-50%)' : 'none',

                        width: '280px',
                        zIndex: 2000,
                        textTransform: 'none',
                        maxWidth: 'calc(100vw - 40px)',
                      }}
                    >
                      {/* Header: User Info */}
                      <div className="p-3 d-flex align-items-center gap-3 border-bottom">
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden" style={{ width: '48px', height: '48px' }}>
                          {user?.user_metadata?.avatar_url ? (
                            <img
                              src={user.user_metadata.avatar_url}
                              alt="User Avatar"
                              className="w-100 h-100"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <svg className="text-blue-300" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0-3-3 3 3 0 0 0 3 3z" />
                            </svg>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <h6 className="mb-0 fw-bold text-dark">Hello {user.user_metadata?.full_name || "User"}</h6>
                          <p className="mb-0 text-muted small">{user.phone || user.email || "+91 0000000000"}</p>
                        </div>
                      </div>

                      {/* Body: Links */}
                      <div className="py-2">
                        <Link
                          href="/user-order"
                          className="d-flex align-items-center px-3 py-2 text-decoration-none text-dark hover-bg-light transition-all"
                          onClick={() => setIsDropdownOpen(false)}
                          style={{ gap: '12px' }}
                        >
                          <span>🛍️</span>
                          <span className="fw-medium" onClick={closeMobileMenu}>My Orders</span>
                        </Link>
                        {/* wishlist */}
                        <Link
                          href="/wishlist"
                          className="d-flex align-items-center px-3 py-2 text-decoration-none text-dark hover-bg-light transition-all"
                          onClick={() => setIsDropdownOpen(false)}
                          style={{ gap: '12px' }}
                        >
                          <span>❤️</span>
                          <span className="fw-medium" onClick={closeMobileMenu}>My Wishlist</span>
                        </Link>

                        <Link
                          href="/myaccount"
                          className="d-flex align-items-center px-3 py-2 text-decoration-none text-dark hover-bg-light transition-all"
                          onClick={() => setIsDropdownOpen(false)}
                          style={{ gap: '12px' }}
                        >
                          <span></span>
                          <span className="fw-medium" onClick={closeMobileMenu}>My Account</span>
                        </Link>

                        <button
                          className="w-100 text-start px-3 py-2 border-0 bg-transparent text-dark hover-bg-light transition-all"
                          style={{ paddingLeft: '43px' }}
                        >
                          <span className="fw-medium" onClick={closeMobileMenu}>Delete Account</span>
                        </button>

                        <hr className="my-1 mx-2 text-muted opacity-25" />

                        <button
                          onClick={handleLogout}
                          className="w-100 text-start px-3 py-2 border-0 bg-transparent text-dark hover-bg-light transition-all d-flex align-items-center gap-2"
                        >
                          <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>🚪</span>
                          <span className="fw-bold" onClick={closeMobileMenu}>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </li>

                {/* cart */}
                <li className="position-relative">
                  <Link href="/cart" className="text-black d-flex align-items-center" title="Cart">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="26"
                      height="26"
                      style={{ minWidth: '26px', display: 'block' }}
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M0 1a1 1 0 0 1 1-1h1.5a.5.5 0 0 1 .485.379L3.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L1.01 1H1a1 1 0 0 1-1-1zm5 13a1 1 0 1 0 1-1 1 1 0 0 0-1 1zm6 0a1 1 0 1 0 1-1 1 1 0 0 0-1 1z" />
                    </svg>

                    {/* RED BADGE */}
                    {totalCount > 0 && (
                      <span
                        className="position-absolute bg-danger text-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          top: "-8px",
                          right: "-10px",
                          width: "20px",
                          height: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          border: "2px solid white"
                        }}
                      >
                        {totalCount}
                      </span>
                    )}
                  </Link>
                </li>

              </ul>
            </div>

          </div>
        </div>
      </nav>
    </>
  );
}