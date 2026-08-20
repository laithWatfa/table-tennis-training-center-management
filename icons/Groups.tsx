import * as React from "react";
import type { SVGProps } from "react";
const SvgGroups = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={20}
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 11c-5.92 0-8 3-8 5v3h16v-3c0-2-2.08-5-8-5m0-1a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9"
    />
    <path
      fill="currentColor"
      stroke="#fff"
      strokeWidth={0.3}
      d="M6.025 10.219a3.52 3.52 0 0 0-3.55 1.397 3.52 3.52 0 0 0 .055 4.18l.136.18-.217.056a1.46 1.46 0 0 0-1.076 1.59 1.46 1.46 0 0 0 1.438 1.272 1.45 1.45 0 0 0 1.393-1.042c.059-.2.074-.41.045-.617l-.031-.223.218.057a3.5 3.5 0 0 0 1.836-.011l.112-.032.058.101.745 1.291a.31.31 0 0 0 .421.112l.794-.458a.31.31 0 0 0 .114-.42L7.77 16.36l-.058-.1.083-.082a3.517 3.517 0 0 0-1.77-5.96ZM2.81 16.604a.838.838 0 1 1-.001 1.675.838.838 0 0 1 0-1.675Z"
    />
  </svg>
);
export default SvgGroups;
