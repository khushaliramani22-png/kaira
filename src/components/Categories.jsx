"use client";

import Image from "next/image";
import Link from "next/link";

export default function Categories() {
  const categories = [
    {
      title: "Shop for men",
      img: "/images/colorbox/cat-item1.jpg",
      href: "/",
    },
    {
      title: "Shop for women",
      img: "/images/colorbox/cat-item2.jpg",
      href: "/",
    },
    {
      title: "Shop accessories",
      img: "/images/colorbox/cat-item3.jpg",
      href: "/",
    },
  ];

  return (
    <section className="categories overflow-hidden">
      <div className="container">
        <div className="open-up" data-aos="zoom-out">
          <div className="row">
            {categories.map((cat, index) => (
              <div className="col-md-4" key={index}>
                <div className="cat-item image-zoom-effect">
                  <div className="image-holder">
                    <Link href={cat.href}>
                      <Image
                        src={cat.img}
                        alt={cat.title}
                        className="product-image img-fluid"
                        width={500}
                        height={500}
                      />
                    </Link>
                  </div>
                  <div className="category-content">
                    <div className="product-button">
                      <Link href={cat.href} className="btn btn-common text-uppercase">
                        {cat.title}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}