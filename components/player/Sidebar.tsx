"use client";
import Image from 'next/image';
import { useEffect, useState } from "react";
// import NavLink from './mana/NavLink';
import { NavLink } from '../manager';
import { Bills,DarkMode,Groups,LightMode,Logout,Reservation } from '@/icons';
import { signOut } from "next-auth/react"; 

const Sidebar = () => {

// 1. Initialize with a safe default string. No server crash!
const [theme, setTheme] = useState<"light" | "dark">("light");

useEffect(() => {
  // 2. Read from localStorage safely here (runs ONLY in the browser)
  const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
  const initialTheme = savedTheme || "light";
  
  if (savedTheme) {
    setTheme(savedTheme);
  }

  // 3. Apply the initial attributes to the document
  if (initialTheme === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "light");
  }
}, []); // Empty dependency array ensures this runs exactly once on mount

const toggleTheme = () => {
  const newTheme = theme === "light" ? "dark" : "light";
  setTheme(newTheme);
  
  localStorage.setItem("theme", newTheme);

  if (newTheme === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "light");
  }
};


      const handleLogout = async () => {
      // Triggers NextAuth cleanup and sets redirect target location
      await signOut({ 
        callbackUrl: "/sign-in", // Where to send the manager immediately after logging out
        redirect: true 
      });
    };

  return (
    <div className='fixed w-64 h-screen' >
        <span className='flex  justify-center items-center py-2 gap-1 border-b border-textSecondary'> 
            <Image src={"/title.svg"} width={400} height={400} alt='صالة السنديان' className='w-3/5'/>
            <Image src={"/logo.svg"} width={400} height={400} alt='logo' className='w-8'/>
        </span>
        <nav className='px-1 py-2'>
          <NavLink href={"/player/invoices"}  label='فواتيري' icon={<Bills/>}/>
          <NavLink href={"/player/subscriptions"} label='اشتراكاتي' icon={<Groups/>}/>
          <NavLink href={"/player/reservations"} label='حجوزاتي' icon={<Reservation/>}/>
        </nav>
        <span className='absolute bottom-4'>
          <button 
          onClick={toggleTheme}
          aria-label={`${theme == 'light' ? 'الوضع المضيء' : 'الوضع المظلم'}`}
          className='flex gap-2 px-4 py-2 rounded transition-colors font-bold text-textPrimary hover:text-primary'>
            {theme == "light" ? 
              <>
                <span className='flex items-center justify-center w-7 h-7 rounded-full bg-textPrimary'>
                  <DarkMode className='text-textSecondary'/>
                </span>
                الوضع المظلم
              </> : 
              <>
                <span className='flex items-center justify-center w-7 h-7 rounded-full bg-textPrimary'>
                  <LightMode className='text-textSecondary'/>
                </span>
                الوضع المضيء
              </>}
            
            
          </button>
          <button 
            onClick={handleLogout}
            className='flex gap-2 px-4 py-2 rounded transition-colors font-bold text-textSecondary hover:text-primary'>
            <Logout/>
            تسجيل الخروج
          </button>

        </span>
        
    </div>
  )
}

export default Sidebar