import * as React from "react";
import type { SVGProps } from "react";
const SvgTimer = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    {...props}
  >
    <path
      fill="currentColor"
      d="M9 3V1h6v2zm2 11h2V8h-2zm1 8a8.7 8.7 0 0 1-3.488-.712A9.2 9.2 0 0 1 5.65 19.35a9.2 9.2 0 0 1-1.937-2.863A8.6 8.6 0 0 1 3 13q0-1.85.713-3.488A9.2 9.2 0 0 1 5.65 6.65a9.2 9.2 0 0 1 2.863-1.937A8.65 8.65 0 0 1 12 4a8.9 8.9 0 0 1 2.975.5Q16.4 5 17.65 5.95l1.4-1.4 1.4 1.4-1.4 1.4a9.7 9.7 0 0 1 1.45 2.675Q21 11.45 21 13a8.65 8.65 0 0 1-.713 3.488 9.2 9.2 0 0 1-1.937 2.862 9.2 9.2 0 0 1-2.863 1.938A8.6 8.6 0 0 1 12 22"
    />
  </svg>
);
export default SvgTimer;
