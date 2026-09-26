'use client';

import React from "react";
import Carousel from "../../components/user/home/Carousel";
import Categories from "../../components/user/home/Categories";
import PopularProducts from "../../components/user/product/PopularProducts";
import NewArrivals from "../../components/user/product/NewArrivals";
import DressStyle from "../../components/user/home/DressStyle";
import Reviews from "../../components/user/home/Reviews";
import useScrollToTop from "../../hooks/useScrollToTop";

export default function Home() {
  useScrollToTop();

  return (
    <div className="w-full space-y-4">
      {/* Hero Showcase */}
      <Carousel />

      {/* Curated Categories */}
      <Categories />

      {/* Fresh Arrivals Drop */}
      <NewArrivals />

      {/* Curated Aesthetic Styles */}
      <DressStyle />

      {/* Signature Bestsellers */}
      <PopularProducts />

      {/* Client Perspectives */}
      <Reviews />
    </div>
  );
}
