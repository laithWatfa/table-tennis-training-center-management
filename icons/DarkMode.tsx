import * as React from "react";
import type { SVGProps } from "react";
const SvgDarkMode = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 21q-3.775 0-6.387-2.613T3 12q0-3.45 2.25-5.988T11 3.05a.88.88 0 0 1 .575.088q.25.138.4.362t.163.525a.9.9 0 0 1-.188.575 5.16 5.16 0 0 0-.85 2.9q0 2.25 1.575 3.825T16.5 12.9q.776 0 1.538-.225a5 5 0 0 0 1.362-.625.95.95 0 0 1 .563-.162q.288.013.512.137a.9.9 0 0 1 .388.375.94.94 0 0 1 .087.6q-.35 3.45-2.937 5.725T12 21"
    />
  </svg>
);
export default SvgDarkMode;
