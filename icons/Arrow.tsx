import * as React from "react";
import type { SVGProps } from "react";
const SvgArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={12}
    fill="none"
    {...props}
  >
    <g clipPath="url(#arrow_svg__a)">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M11.289 10.157 5.632 4.5l1.414-1.414 4.95 4.95 4.95-4.95L18.36 4.5l-5.657 5.657a1 1 0 0 1-1.414 0"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="arrow_svg__a">
        <path fill="fill" d="M24 0v12H0V0z" />
      </clipPath>
    </defs>
  </svg>
);
export default SvgArrow;
