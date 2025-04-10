"use client";

import React, { useState, useEffect } from 'react';
import CONFIG from '@/config/config';
import { useGlobalContext, defaultUser } from '@/providers/GlobalContext';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface SidebarProps {
    router: AppRouterInstance
}

const Sidebar: React.FC<SidebarProps> = ({ router }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, setUser } = useGlobalContext();

    // Use state for the pathname, initialized to an empty string
    const [pageName, setPageName] = useState('');

    const changePageName = (path: string) => {
        const lastPart = path.split('/').pop();
        setPageName(lastPart || '');
        console.log(lastPart);
    }

    // Update pageName after mounting on the client
    useEffect(() => {
        changePageName(window.location.pathname);
    }, []);



    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <>
            {/* Hamburger button for mobile */}
            <button
                className="md:hidden fixed top-4 left-4 z-20 p-2 bg-gray-800 text-white rounded"
                onClick={toggleSidebar}
            >
                <i className="fa fa-bars"></i>
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out 
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    md:translate-x-0 md:static md:block h-screen z-10`}
            >
                <section className="p-4">
                    {/* Close button for mobile */}
                    <div className="md:hidden flex justify-end">
                        <button className="p-2 text-white" onClick={toggleSidebar}>
                            <i className="fa fa-times"></i>
                        </button>
                    </div>

                    <div className="flex items-center mb-4">
                        <div className="mr-3">
                            {/* <img src={user.imageUrl} className="rounded-full w-10 h-10" alt="User" /> */}
                        </div>
                        <div>
                            <p>{user.first_name + " " + user.last_name}</p>
                            <a href="#" className="text-green-500">
                                <i className="fa fa-circle"></i> Online
                            </a>
                        </div>
                    </div>

                    <ul>
                        <li className="text-gray-400 uppercase mb-2">Navigation</li>
                        <li className={`${pageName === 'home' ? 'bg-gray-700' : ''} mb-2`}>
                            <a
                                onClick={() => {
                                    router.push('/home');
                                    toggleSidebar();
                                    changePageName('/home');
                                }}
                                className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer"
                            >
                                <i className="fa fa-money mr-2"></i> <span>Home</span>
                            </a>
                        </li>
                        <li className={`${pageName === 'records' ? 'bg-gray-700' : ''} mb-2`}>
                            <a
                                onClick={() => {
                                    router.push('/home/records');
                                    toggleSidebar();
                                    changePageName('/home/records');
                                }}
                                className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer"
                            >
                                <i className="fa fa-book mr-2"></i> <span>Records</span>
                            </a>
                        </li>
                        {user.user_type === 'admin' && (
                            <li className={`${pageName === 'manage-accounts' ? 'bg-gray-700' : ''} mb-2`}>
                                <a
                                    onClick={() => {
                                        router.push('/home/manage-accounts');
                                        toggleSidebar();
                                        changePageName('/home/manage-accounts');
                                    }}
                                    className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer"
                                >
                                    <i className="fa fa-users mr-2"></i> <span>Manage Accounts</span>
                                </a>
                            </li>
                        )}
                        <li className="mb-2">
                            <a
                                onClick={() => {
                                    router.push('/');
                                    setUser(defaultUser);
                                    toggleSidebar();
                                }}
                                className="flex items-center p-2 hover:text-gray-300 rounded cursor-pointer"
                            >
                                <i className="fa fa-money mr-2"></i> <span className="font-light">Log out</span>
                            </a>
                        </li>
                    </ul>
                </section>
            </aside>

            {/* Backdrop overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 md:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}
        </>
    );
};

export default Sidebar;
