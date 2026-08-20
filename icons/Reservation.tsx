import * as React from "react";
import type { SVGProps } from "react";
const SvgReservation = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={29}
    height={26}
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      d="M17 12h5v5h-5zm7-9h-1V1h-2v2h-8V1h-2v2h-1c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 2v2H10V5zM10 19V9h14v10z"
    />
    <g clipPath="url(#reservation_svg__a)">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M3.947 9.851a6.333 6.333 0 0 0-1.876 9.318 2.773 2.773 0 0 0 .689 5.454 2.772 2.772 0 0 0 2.743-3.162 6.33 6.33 0 0 0 3.307-.021l1.287 2.23a.79.79 0 0 0 1.081.289l1.371-.792a.79.79 0 0 0 .29-1.081l-1.287-2.23A6.334 6.334 0 0 0 3.947 9.852M2.76 20.666a1.187 1.187 0 1 1 0 2.375 1.187 1.187 0 0 1 0-2.375"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="reservation_svg__a">
        <path fill="#fff" d="M19 7H0v19h19z" />
      </clipPath>
    </defs>
  </svg>
);
export default SvgReservation;
