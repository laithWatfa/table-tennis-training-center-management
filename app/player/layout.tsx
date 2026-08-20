"use client"
import React, { useState } from 'react'
import { Drawer } from '@/components/manager';
import { Header , Sidebar } from '@/components/player';
import Image from 'next/image';


const Layout = ({children,
}: Readonly<{
  children: React.ReactNode;
}>
) => {
    const [open,setOpen] = useState<boolean>(false)
  return (
    <div className="min-h-screen overflow-hidden ">
    
      <Header/>

      
      <header className='fixed z-50 flex items-center justify-between bg-surface lg:hidden p-2 px-4 w-screen h-fit shadow-basic'>
        <button
        className=" text-primary font-bold rounded text-lead md:text-h3"
        onClick={() => setOpen(true)}
      >
        ☰
      </button>

      <Image src={"/logo.svg"} height={400} width={400} alt="logo" className='h-8 w-8'/>


      </header>
      

      {/* Drawer for small screens */}
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Sidebar/>
      </Drawer>

      {/* Main content */}
      <main className="flex-1 z-0 p-4 text-textPrimary  pt-20 ">
        {children}
        </main>
    </div>
  )
}

export default Layout