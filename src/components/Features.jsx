"use client";

import { FaCalendarAlt, FaShoppingBag, FaGift, FaRecycle } from "react-icons/fa";

export default function Features() {
  const features = [
    {
      icon: <FaCalendarAlt size={50} className="mb-3" />,
      title: "Book An Appointment",
      description: "At imperdiet dui accumsan sit amet nulla risus est ultricies quis.",
      delay: 0,
    },
    {
      icon: <FaShoppingBag size={50} className="mb-3" />,
      title: "Pick Up In Store",
      description: "At imperdiet dui accumsan sit amet nulla risus est ultricies quis.",
      delay: 300,
    },
    {
      icon: <FaGift size={50} className="mb-3" />,
      title: "Special Packaging",
      description: "At imperdiet dui accumsan sit amet nulla risus est ultricies quis.",
      delay: 600,
    },
    {
      icon: <FaRecycle size={50} className="mb-3" />,
      title: "Free Global Returns",
      description: "At imperdiet dui accumsan sit amet nulla risus est ultricies quis.",
      delay: 900,
    },
  ];

  return (
    <section className="features py-5">
      <div className="container">
        <div className="row">
          {features.map((feature, index) => (
            <div
              key={index}
              className="col-md-3 d-flex flex-column align-items-center text-center aos-init aos-animate"
              data-aos="fade-in"
              data-aos-delay={feature.delay}
            >
              {feature.icon}
              <h4 className="element-title text-capitalize my-3">{feature.title}</h4>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}