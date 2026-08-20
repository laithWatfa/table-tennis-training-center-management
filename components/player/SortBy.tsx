import { Sort } from "@/icons";
import { SetStateAction , Dispatch } from "react";

interface props {
    sortedBy : string , 
    onChange : Dispatch<SetStateAction<string>>
} 
export default function SortBy({sortedBy, onChange} : props) {
  const options = [
    { value: "createdAt", label: "الأحدث" },
    { value: "amount", label: "القيمة" },
];

  return (
    <>
    <div className="relative flex flex-col w-48">

      {/* Select input */}
      <Sort className="absolute bottom-1/2 translate-y-1/2 right-4 w-5 h-5 text-secondary"/>
      <select
        value={sortedBy}
        onChange={(e) => onChange(e.target.value)}
        className="relative appearance-none bg-transparent border-2 border-secondary text-secondary
          px-3 py-2 !pr-10 rounded-md cursor-pointer focus:outline-none  focus:border-secondary"
      >
        
        {/* Placeholder option so the select never shows the actual sortedBy value */}
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
    </>
  );
}
