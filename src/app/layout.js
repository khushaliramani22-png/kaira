"use client";
import { usePathname } from "next/navigation";
import { CartProvider } from "./context/CartContext";
import Footer from "../components/Footer";
import Script from "next/script";
import "./styles/normalize.css";
import "./styles/swiper-bundle.min.css";
import "./styles/vendor.css";
import "./styles/style.css";
import "./globals.css";
import Header from "@/components/Header";



export default function RootLayout({ children }) {
  const pathname = usePathname();

  // જો પાથ '/admin' થી શરૂ થતો હોય તો આ true થશે
  const isAdminPage = pathname.startsWith("/admin");



  

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">

      <head>
        <title>Kaira Fashion Store</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Bootstrap CSS */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />

        {/* Swiper */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.css"
        />

        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;700&family=Marcellus&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="homepage">
        <CartProvider>

          {!isAdminPage && <Header />}
          {children}
          {!isAdminPage && <Footer />}
        </CartProvider>
        {/* Bootstrap JS */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />

        <Script
          src="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.js"
          strategy="beforeInteractive"
        />

       {/* Scripts
<Script
  src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
  strategy="afterInteractive"
/>

{/* આ બધી સ્ક્રિપ્ટ્સ માત્ર ત્યારે જ લોડ થશે જો તે એડમિન પેજ ન હોય 
{!isAdminPage && (
  <>
    <Script src="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.js" strategy="beforeInteractive" />
    <Script src="/js/jquery.min.js" strategy="beforeInteractive" />
    <Script src="/js/modernizr.js" strategy="beforeInteractive" />
    <Script src="/js/plugins.js" strategy="afterInteractive" />
    <Script src="/js/script.min.js" strategy="afterInteractive" />
  </>
)} */}
      </body>

    </html>
  );
}
