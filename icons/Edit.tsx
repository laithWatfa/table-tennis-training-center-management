import * as React from "react";
import type { SVGProps } from "react";
const SvgEdit = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={29}
    height={26}
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M25.585 7.38c.64-.573.998-1.35.998-2.16s-.358-1.587-.997-2.16c-.639-.572-1.505-.894-2.408-.894-.904 0-1.77.322-2.41.894L4.643 17.522c-.28.25-.488.56-.604.899l-1.596 4.714a.5.5 0 0 0-.007.288.53.53 0 0 0 .16.25.6.6 0 0 0 .279.143.7.7 0 0 0 .32-.007l5.26-1.43a2.5 2.5 0 0 0 1.004-.538z"
    />
  </svg>
);
export default SvgEdit;
