import * as React from "react";
import type { SVGProps } from "react";
const SvgCancel = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={26}
    height={26}
    fill="none"
    {...props}
  >
    <path
      fill="#e53935"
      d="M13 2.167A10.823 10.823 0 0 0 2.167 13c0 5.99 4.842 10.833 10.833 10.833 5.99 0 10.833-4.842 10.833-10.833 0-5.99-4.842-10.833-10.833-10.833m4.658 15.491a1.08 1.08 0 0 1-1.527 0L13 14.528l-3.13 3.13a1.08 1.08 0 1 1-1.528-1.527l3.13-3.13-3.13-3.132a1.08 1.08 0 0 1 1.527-1.527L13 11.472l3.13-3.13a1.08 1.08 0 0 1 1.528 1.527L14.528 13l3.13 3.13a1.1 1.1 0 0 1 0 1.528"
    />
  </svg>
);
export default SvgCancel;
