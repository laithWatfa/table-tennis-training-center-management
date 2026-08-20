import * as React from "react";
import type { SVGProps } from "react";
const SvgDelete = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={29}
    height={29}
    fill="none"
    {...props}
  >
    <path
      fill="#f1f5f9"
      d="M8.458 25.375a2.33 2.33 0 0 1-1.706-.71 2.33 2.33 0 0 1-.71-1.707V7.25H4.833V4.833h6.042V3.625h7.25v1.208h6.042V7.25h-1.209v15.708a2.33 2.33 0 0 1-.709 1.708 2.32 2.32 0 0 1-1.707.709zM20.542 7.25H8.458v15.708h12.084zm-9.667 13.292h2.417V9.667h-2.417zm4.833 0h2.417V9.667h-2.417z"
    />
  </svg>
);
export default SvgDelete;
