import * as React from "react";
import type { SVGProps } from "react";
const SvgSearch = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <g clipPath="url(#search_svg__a)">
      <path
        fill="#6b7280"
        d="M13 6.5c0 1.434-.466 2.76-1.25 3.834l3.956 3.96a1.002 1.002 0 0 1-1.415 1.415l-3.957-3.959A6.499 6.499 0 0 1 0 6.5a6.5 6.5 0 1 1 13 0M6.5 11a4.5 4.5 0 1 0 0-9.002A4.5 4.5 0 0 0 6.5 11"
      />
    </g>
    <defs>
      <clipPath id="search_svg__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default SvgSearch;
