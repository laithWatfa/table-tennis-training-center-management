"use client";

import React, { useState, useEffect, useRef } from "react";

interface UserSuggestion {
id: string;
fullName: string;
email: string;
}

// Ensure you pass formData, and updateField from your main form shell context
interface UserAutocompleteProps {
currentUserId: string;
onUserSelect: (userId: string) => void;
classes? : string;
}

export default function UserAutocomplete({ currentUserId, onUserSelect, classes }: UserAutocompleteProps) {
const [searchTerm, setSearchTerm] = useState("");
const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
const [isOpen, setIsOpen] = useState(false);
const [loading, setLoading] = useState(false);
const wrapperRef = useRef<HTMLDivElement>(null);

// Close the dropdown suggestions menu if a user clicks completely outside of it
useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
    }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

// Debounced API search evaluation hook
useEffect(() => {
    if (searchTerm.trim().length < 2) {
    setSuggestions([]);
    return;
    }

    const delayDebounceFn = setTimeout(async () => {
    setLoading(true);
    try {
        const response = await fetch(`/api/manager/players/search?q=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setIsOpen(true);
        }
    } catch (error) {
        console.error("Failed fetching user query suggestions:", error);
    } finally {
        setLoading(false);
    }
    }, 300); // 300ms debounce buffer delay

    return () => clearTimeout(delayDebounceFn);
}, [searchTerm]);

const handleSelect = (user: UserSuggestion) => {
    setSearchTerm(user.fullName); // Show visual text string label to user
    onUserSelect(user.id);         // Pass the safe relational database id up to state handler
    setIsOpen(false);
};

return (
    <div ref={wrapperRef} className={`relative w-full ${classes}`}>
    <label htmlFor="player" className="font-bold text-small block mb-1">اللاعب / العميل</label>

    <div className="relative">
        <input
        id="player"
        type="text"
        value={searchTerm}
        onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value === "") onUserSelect(""); // Reset ID state if input is cleared
        }}
        placeholder="ابحث عن اسم العميل هنا..."
        autoComplete="off"
        className="w-full px-4 py-2 text-textSecondary border border-textSecondary rounded-lg bg-surface focus:outline-none !shadow-none"
        />
        {loading && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-textSecondary animate-pulse">
            جاري البحث...
        </span>
        )}
    </div>

    {/* Suggestion Dropdown Panel */}
    {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-surface border border-textSecondary rounded-lg max-h-60 overflow-y-auto shadow-lg divide-y divide-gray-100 dark:divide-slate-800">
        {suggestions.map((user) => (
            <li key={user.id}>
            <button
                type="button"
                onClick={() => handleSelect(user)}
                className="w-full text-right px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-slate-900 transition flex flex-col gap-0.5"
            >
                <span className="font-bold text-textPrimary">{user.fullName}</span>
                <span className="text-xs text-textSecondary">{user.email}</span>
            </button>
            </li>
        ))}
        </ul>
    )}

    {/* Informative fallback message if no matching name configurations are found */}
    {isOpen && searchTerm.trim().length >= 2 && suggestions.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-red-200 text-red-500 rounded-lg p-3 text-sm text-center shadow-lg">
        لا يوجد عميل مطابق لهذا الاسم.
        </div>
    )}
    </div>
);
}
