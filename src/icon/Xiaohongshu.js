import React from "react";
import "./index.css";

export default ({style = {}, className = "icon"}) => (
  <svg style={style} viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#ff2442" />
    <path
      fill="#fff"
      d="M9.2 10.2h3.1l2.2 4.2 2.2-4.2h3.1l-3.7 6.7 3.9 7h-3.2l-2.4-4.5-2.5 4.5H8.8l4-7-3.6-6.7Zm12 0h5.2c3.2 0 5 1.6 5 4.4 0 1.8-.8 3.1-2.2 3.8l2.8 5.5h-3.3l-2.3-4.9h-2.2v4.9h-3V10.2Zm3 2.6v3.7h2c1.4 0 2.2-.6 2.2-1.9 0-1.2-.8-1.8-2.2-1.8h-2Z"
    />
    <rect x="8.5" y="27.1" width="23" height="2.7" rx="1.35" fill="#fff" />
  </svg>
);
