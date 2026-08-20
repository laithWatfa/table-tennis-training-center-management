import * as React from "react";
import type { SVGProps } from "react";
const SvgPaddle = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 17 22"
    width="1em"
    height="1em"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12.006 1.075a8 8 0 0 1 2.37 11.77 3.501 3.501 0 0 1-.87 6.89 3.5 3.5 0 0 1-3.465-3.994 8 8 0 0 1-4.177-.027l-1.626 2.815a1 1 0 0 1-1.366.366l-1.732-1a1 1 0 0 1-.366-1.366L2.4 13.715a8 8 0 0 1 9.606-12.639m1.5 13.66a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgPaddle;
