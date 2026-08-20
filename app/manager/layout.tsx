"use client"
import React, { useState } from 'react'
import { Drawer,Sidebar, } from '@/components/manager';
import Image from 'next/image';

const Layout = ({children,
}: Readonly<{
  children: React.ReactNode;
}>
) => {
    const [open,setOpen] = useState<boolean>(false)
  return (
    <div className="flex min-h-screen ">
    
      <aside className="hidden relative lg:block w-64 bg-surface text-textPrimary shadow-[-4px_0px_8px_rgba(0,0,0,0.25)]">
        <Sidebar />
      </aside>

      
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
        <Sidebar />
      </Drawer>

      {/* Main content */}
      <main className="flex-1 p-4 text-textPrimary  overflow-hidden pt-20 lg:pt-8">
        {children}
        </main>
    </div>
  )
}

export default Layout