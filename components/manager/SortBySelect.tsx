import { Dispatch, SetStateAction} from "react";
import { FaSort } from "react-icons/fa6";


interface SortByProps {
  options : {value: string  , label: string}[]
  value : string ;
  onChange : Dispatch<SetStateAction<string>> 
}

export default function SortBySelect({options , value, onChange} : SortByProps) {



  return (
    <div className="flex flex-col w-fit  relative text-secondary md:order-last">
      {/* Label on top */}
      
        <FaSort className="absolute  left-2 w-6 h-6 top-1/2 -translate-y-1/2 pointer-events-none"/>

      {/* Select input */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-surface  font-bold pr-3 pl-8 py-1 rounded-md cursor-pointer
        border border-secondary
        focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {/* Placeholder option so the select never shows the actual value value */}
        <option value="" disabled hidden>
          ترتيب حسب
        </option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
