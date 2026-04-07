"use client";
import { usePathname } from "next/navigation";
import { CartProvider } from "./context/CartContext";
import { SettingsProvider } from "./context/SettingsContext";
import Footer from "../components/Footer";
import "./styles/normalize.css";
import "./styles/swiper-bundle.min.css";
import "./styles/vendor.css";
import "./styles/style.css";
import "./globals.css";
import Header from "@/components/Header";



export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">

      <head>
        <title>Kaira Fashion Store</title>
   
        <meta name="description" content="Discover trendy fashion finds at Kaira. Your one-stop shop for everything you need. Explore high-quality women's clothing and accessories." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* google logo */}
        
<link rel="icon" href="/images/colorbox/favicon.ico" sizes="any" />
<link rel="apple-touch-icon" href="/images/colorbox/favicon.ico" />
        
        {/* Search Engine Optimization (SEO) */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://kaira-ten.vercel.app/" />

        {/* Bootstrap & Other Links... */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />

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
        <SettingsProvider>
          <CartProvider>
            {!isAdminPage && <Header />}
            {children}
            {!isAdminPage && <Footer />}
          </CartProvider>
        </SettingsProvider>
      </body>

    </html>
  );
}
