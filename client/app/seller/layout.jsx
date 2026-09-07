'use client'
import Navbar from '@/components/seller/Navbar'
import Sidebar from '@/components/seller/Sidebar'
import React, { useEffect } from 'react'
import { useAppContext } from '@/context/AppContext'

const Layout = ({ children }) => {

  const { token, router } = useAppContext();

  useEffect(() => {
    if (!token && !localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [token]);

  return (
    <div>
      <Navbar />
      <div className='flex w-full'>
        <Sidebar />
        {children}
      </div>
    </div>
  )
}

export default Layout