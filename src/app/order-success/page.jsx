// import Link from "next/link";
// import { CheckCircle } from "lucide-react";

// export default function OrderSuccess() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-white px-6">
//       <div className="text-center max-w-md">
//         <div className="flex justify-center mb-6">
//           <CheckCircle size={80} className="text-green-500 stroke-[1]" />
//         </div>
//         <h1 className="text-4xl font-serif mb-4">Order Confirmed</h1>
//         <p className="text-gray-500 font-light mb-10 leading-relaxed">
//           Your order has been placed successfully. We will notify you once your package is on its way.
//         </p>
//         <Link 
//           href="/shop" 
//           className="inline-block w-full py-4 bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition shadow-xl"
//         >
//           Continue Shopping
//         </Link>
//       </div>
//     </div>
//   );
// }
"use client";

import Link from "next/link";

export default function OrderSuccess() {

return (

<div className="min-h-screen flex items-center justify-center bg-gray-100">

<div className="bg-white p-10 rounded-lg shadow text-center">

<h1 className="text-3xl font-bold text-green-600 mb-4">
Order Placed Successfully 🎉
</h1>

<p className="text-gray-500 mb-6">
Your order has been placed successfully.
</p>

<Link
href="/"
className="bg-black text-white px-6 py-3 rounded"
>
Continue Shopping
</Link>

</div>

</div>

);
}