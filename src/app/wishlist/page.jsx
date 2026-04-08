"use client";
import React from 'react';
import Link from 'next/link';

export default function WishlistPage() {

  const wishlistItems = []; 

  return (
    <div className="container py-5" style={{ minHeight: '60vh' }}>
      <h2 className="mb-4">My Wishlist</h2>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-5 border rounded bg-light">
          <div className="mb-3" style={{ fontSize: '50px' }}>❤️</div>
          <h4>your wishlist is empty!</h4>
          <p className="text-muted">save your favourit product.</p>
          <Link href="/shop" className="btn btn-dark px-4 py-2 mt-2">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="row">
       
          <p>show your items...</p>
        </div>
      )}
    </div>
  );
}