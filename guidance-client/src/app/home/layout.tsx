'use client';

import React, { ReactNode, useEffect } from 'react';
import Sidebar from '@/components/sidebar';

import { useGlobalContext } from '@/providers/GlobalContext';
import { useRouter } from 'next/navigation';


interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const {user, setUser} = useGlobalContext()
    const router = useRouter()
    useEffect(()=>{
        if (typeof window !== "undefined") {
              const storedUser = localStorage.getItem("user");
              if (storedUser) {
                setUser(JSON.parse(storedUser));
              } else{
                router.push('/login')
              }
            }
    }, [])
    return (
        <div className={'h-screen w-full flex bg-amber-50'}>
            <Sidebar router={router}/>
            <main  className='h-full w-full flex'>{children}</main>
        </div>
    );
};

export default Layout;