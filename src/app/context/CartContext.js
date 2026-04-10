"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase"; 

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    getUser();
  }, []);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user;

    if (currentUser) {
      const { data, error } = await supabase
        .from("cart") 
        .select("*")
        .eq("user_id", currentUser.id);

      if (!error && data) {
     
        setCartItems(data);
      }
    } else {
      const savedCart = localStorage.getItem("kaira_cart");
      if (savedCart) setCartItems(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  
  const addToCart = async (product, selectedSize, selectedColor) => {
    const newItem = {
      ...product,
      product_id: product.id,
      quantity: 1,
      selectedSize: selectedSize || null,
      selectedColor: selectedColor || null,
     
      variant: selectedSize && selectedColor ? `${selectedSize} / ${selectedColor}` : null
    };

    if (user) {
      const { error } = await supabase.from("cart").insert([{
        user_id: user.id,
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || product.image1,
        quantity: 1,
        size: selectedSize,   
        color: selectedColor,
        variant: newItem.variant
      }]);
      if (!error) refreshCart();
    } else {
      const updatedCart = [...cartItems, newItem];
      setCartItems(updatedCart);
      localStorage.setItem("kaira_cart", JSON.stringify(updatedCart));
    }
  };

  const removeFromCart = async (productId) => {
    const updatedCart = cartItems.filter((item) => (item.product_id || item.id) !== productId);
    setCartItems(updatedCart);
    localStorage.setItem("kaira_cart", JSON.stringify(updatedCart));

    if (user) {
      await supabase.from("cart").delete().eq("product_id", productId).eq("user_id", user.id);
    }
  };

  const updateQuantity = async (productId, amount) => {
    const item = cartItems.find(i => i.id === productId || i.product_id === productId);
    if (!item) return;

    const newQty = Math.max(1, item.quantity + amount);
    const updatedCart = cartItems.map((i) => 
      (i.product_id === productId || i.id === productId ? { ...i, quantity: newQty } : i)
    );
    
    setCartItems(updatedCart);
    localStorage.setItem("kaira_cart", JSON.stringify(updatedCart));

    if (user) {
      await supabase.from("cart")
        .update({ quantity: newQty })
        .eq("product_id", productId)
        .eq("user_id", user.id);
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem("kaira_cart");
    if (user) {
      await supabase.from("cart").delete().eq("user_id", user.id);
    }
  };

  const totalCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart, 
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        refreshCart,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);