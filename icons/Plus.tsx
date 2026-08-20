import * as React from "react";
import type { SVGProps } from "react";
const SvgPlus = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={29}
    height={29}
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      d="M21.75 12.084h-4.833V7.251a2.417 2.417 0 1 0-4.834 0l.086 4.833H7.25a2.417 2.417 0 1 0 0 4.833l4.92-.086-.087 4.92a2.417 2.417 0 1 0 4.834 0v-4.92l4.833.086a2.417 2.417 0 1 0 0-4.833"
    />
  </svg>
);
export default SvgPlus;
