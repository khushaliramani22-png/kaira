"use client";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { ShoppingBag, X, Plus, Minus } from "lucide-react"; 
import { useEffect } from "react";

export default function CartPage() {

  const { cartItems, updateQuantity, removeFromCart, refreshCart, loading } = useCart();

 
  useEffect(() => {
    if (refreshCart) refreshCart();
  }, [refreshCart]);

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );


  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container min-vh-100 d-flex flex-column align-items-center justify-content-center text-center py-5">
        <div className="mb-4">
          <img 
            src="/images/colorbox/cart_empty.jpg.png" 
            alt="Empty Cart Illustration" 
            style={{ width: "100%", maxWidth: "380px", height: "auto" }}
          />
        </div>

        <h2 className="fw-bold mb-2" style={{ color: "#2d3436", fontSize: "1.8rem" }}>
          Your cart is empty
        </h2>

        <p className="text-muted mb-4 px-3" style={{ fontSize: "1.1rem", maxWidth: "500px" }}>
          Just relax, let us help you find some first-class products
        </p>

        <Link href="/shop" className="text-decoration-none">
          <button 
            className="btn text-white px-5 py-2 shadow-sm border-0" 
            style={{ 
              backgroundColor: "#9d178d",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "1.1rem",
              transition: "0.3s"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#801273"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#9d178d"}
          >
            Start Shopping
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-16 px-6 md:px-12 text-[#1a1a1a]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-normal mb-16 tracking-tight">Shopping cart</h1>

        <div className="flex flex-col lg:flex-row gap-20 items-start">

          
          <div className="w-full lg:w-[65%]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  <th className="pb-6 font-medium text-left">Product</th>
                  <th className="pb-6 font-medium text-center">Price</th>
                  <th className="pb-6 font-medium text-center">Quantity</th>
                  <th className="pb-6 font-medium text-right">Subtotal</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <tr key={item.id || item.product_id}>
                    <td className="py-10" style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => removeFromCart(item.product_id || item.id)}
                          className="text-gray-300 hover:text-black transition-colors"
                        >
                          <X size={18} strokeWidth={1.5} />
                        </button>

                        <div className="w-24 h-32 bg-[#fbfbfb] border border-gray-50 flex-shrink-0 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                           style={{ width: "150px", height: "150px", cursor: "pointer", objectFit: "cover", flexShrink: 0 }}
                          />
                        </div>

                        <div>
                          <span className="text-[15px] font-medium tracking-tight text-gray-800 block">
                            {item.name}
                          </span>
                          <span className="text-[12px] text-gray-400 uppercase tracking-wider">
                            {item.selected_size} / {item.selected_color}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-10 text-center text-sm text-gray-500 font-light">
                      ₹{item.price.toLocaleString()}
                    </td>

                    <td className="py-10 text-center">
                      <div className="inline-flex items-center border border-gray-200 bg-white shadow-sm">
                        <span className="w-10 text-center text-[13px]">{item.quantity}</span>
                        <div className="flex flex-col border-l border-gray-200">
                          <button
                            onClick={() => updateQuantity(item.product_id || item.id, 1)}
                            className="px-2 py-1 border-b border-gray-100 hover:bg-gray-50"
                          >
                            <Plus size={10} />
                          </button>
                          <button
                            onClick={() => updateQuantity(item.product_id || item.id, -1)}
                            className="px-2 py-1 hover:bg-gray-50"
                          >
                            <Minus size={10} />
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-10 text-center text-[15px] font-medium text-black">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="w-full lg:w-[35%] lg:sticky lg:top-10">
            <div className="bg-[#fcfcfc] border border-gray-100 p-8 md:p-10 shadow-sm">
              <h2 className="text-2xl font-normal mb-10 border-b border-gray-100 pb-4 tracking-tight">
                Cart totals
              </h2>
              
              <div>
                <div className="flex justify-between items-center py-6 border-b border-gray-100 text-[15px]">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-800 font-medium">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>

                <div className="py-8 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <span className="text-[15px] text-gray-500">Shipping</span>
                    <div className="text-right space-y-3">
                      <div className="flex items-center justify-end gap-3">
                        <label className="text-sm text-gray-600 font-light">Free shipping</label>
                        <input type="radio" name="shipping" defaultChecked className="accent-black h-4 w-4" />
                      </div>
                      <div className="flex items-center justify-end gap-3 text-gray-400">
                        <label className="text-sm font-light">Flat rate: ₹100</label>
                        <input type="radio" name="shipping" className="accent-black h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center py-8 text-xl font-medium text-black">
                  <span>Total</span>
                  <span className="font-bold text-2xl">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 block w-full text-center bg-black text-white py-4 text-sm uppercase tracking-widest font-semibold hover:bg-gray-900 transition !no-underline"
              >
                Proceed to checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}