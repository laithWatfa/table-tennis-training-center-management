import { Dispatch , SetStateAction } from "react";

interface props {
  options : {id : string,label: string}[]
  value : string ; 
  onChange : Dispatch<SetStateAction<string>> ; 
  classes : string ; 
}

export default function RadioButtons({options , classes , value , onChange}: props) {
  return (
    <div className={`flex gap-0 bg-surface rounded-lg border-[1px] border-textSecondary overflow-hidden  ${classes}`}>
      {options.map((opt) => (
        <label
          key={opt.id}
          className={`cursor-pointer flex items-center px-4 py-1 font-bold transition-colors [&:not(:last-child)]:border-l border-textSecondary  
            ${value === opt.id 
              ? "bg-secondary text-whiteT" 
              : "text-textSecondary"}
          `}
        >
          <input
            type="radio"
            name="custom-radio"
            value={opt.id}
            checked={value === opt.id}
            onChange={() => onChange(opt.id)}
            className="hidden"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
