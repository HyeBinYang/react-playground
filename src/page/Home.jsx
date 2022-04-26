import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import Item from "../components/Item";
import "./Home.css";

const Home = () => {
  const [items] = useState(() => Array.from({ length: 1000 }));
  let handle = null;

  const createScrollStopListener = () => {
    if (handle) clearTimeout(handle);

    handle = setTimeout(() => {
      console.log("scroll");
      // localStorage.setItem("scroll_pos", Math.max(document.body.scrollTop, document.documentElement.scrollTop));
      localStorage.setItem("scroll_pos", document.documentElement.scrollTop);
    }, 200);
  };

  useEffect(() => {
    window.addEventListener("scroll", createScrollStopListener);

    if (localStorage.getItem("scroll_pos")) {
      const scrollTop = parseInt(localStorage.getItem("scroll_pos"));
      window.scrollTo(0, scrollTop);
    }

    return () => {
      window.removeEventListener("scroll", createScrollStopListener);
    };
  }, []);

  return (
    <div>
      <h1>Home</h1>
      <div className="image">
        <img
          src="https://cdn.royalcanin-weshare-online.io/gyJAPmYBaxEApS7LxQae/v1/ec40h-why-is-your-cat-scratching-so-much-hero-cat"
          alt=""
        />
      </div>
      <div className="items">
        {items.map((item, index) => (
          <Item id={index} key={index} />
        ))}
      </div>
    </div>
  );
};

export default Home;
