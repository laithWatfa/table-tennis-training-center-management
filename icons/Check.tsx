import * as React from "react";
import type { SVGProps } from "react";
const SvgCheck = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <mask
      id="check_svg__a"
      width={22}
      height={22}
      x={1}
      y={1}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "luminance",
      }}
    >
      <path
        fill="#fff"
        stroke="#fff"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 22a9.97 9.97 0 0 0 7.071-2.929A9.97 9.97 0 0 0 22 12a9.97 9.97 0 0 0-2.929-7.071A9.97 9.97 0 0 0 12 2a9.97 9.97 0 0 0-7.071 2.929A9.97 9.97 0 0 0 2 12a9.97 9.97 0 0 0 2.929 7.071A9.97 9.97 0 0 0 12 22Z"
      />
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="m8 12 3 3 6-6"
      />
    </mask>
    <g mask="url(#check_svg__a)">
      <path fill="currentColor" d="M0 0h24v24H0z" />
    </g>
  </svg>
);
export default SvgCheck;
