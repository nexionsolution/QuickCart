"use client"
import React, { useState } from "react";
import { assets} from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";

const Navbar = () => {

  const { isSeller, router, user, userData, becomeSellerUser, setToken, setUser, setIsSeller, searchQuery, setSearchQuery, getCartCount } = useAppContext();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setIsSeller(false);
    localStorage.removeItem('token');
    localStorage.removeItem('isSeller');
    router.push('/');
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push('/')}
        src={assets.logo}
        alt="logo"
      />
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">
          Home
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">
          Shop
        </Link>
        <Link href="/" className="hover:text-gray-900 transition">
          About Us
        </Link>
        <Link href="/" className="hover:text-gray-900 transition">
          Contact
        </Link>

        {isSeller && <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full">Seller Dashboard</button>}
        {user && !isSeller && <button onClick={becomeSellerUser} className="text-xs border px-4 py-1.5 rounded-full bg-orange-600 text-white">Action to Sale</button>}

      </div>

      <ul className="hidden md:flex items-center gap-4 ">
        <div className="flex items-center gap-2 border px-4 py-1.5 rounded-full bg-gray-50">
          <Image className="w-4 h-4" src={assets.search_icon} alt="search icon" />
          <input
            type="text"
            placeholder="Search products..."
            className="outline-none bg-transparent text-sm w-32 focus:w-48 transition-all duration-300"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value && window.location.pathname !== '/all-products') {
                router.push('/all-products');
              }
            }}
          />
        </div>
        { user
         ? (
            <div className="relative">
              <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center gap-2 hover:text-gray-900 transition">
                <Image src={assets.user_icon} alt="user icon" />
                {userData?.name ? <span className="font-medium text-sm">{userData.name}</span> : "Account"}
              </button>
              {isProfileDropdownOpen && (
                <ul className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md z-10 overflow-hidden">
                  <li onClick={() => { setIsProfileDropdownOpen(false); router.push('/profile'); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">My Profile</li>
                  <li onClick={handleLogout} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600 text-sm">Logout</li>
                </ul>
              )}
            </div>
           )
         : <button onClick={() => router.push('/login')} className="flex items-center gap-2 hover:text-gray-900 transition">
          <Image src={assets.user_icon} alt="user icon" />
          Account
        </button>}

        {/* Desktop Cart Icon */}
        <button onClick={() => router.push('/cart')} className="relative flex items-center gap-2 hover:text-gray-900 transition ml-2">
          <Image src={assets.cart_icon} alt="cart icon" className="w-5 h-5" />
          {getCartCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {getCartCount()}
            </span>
          )}
        </button>
      </ul>

      <div className="flex items-center md:hidden gap-3">
        {isSeller && <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full">Seller Dashboard</button>}
        {user && !isSeller && <button onClick={becomeSellerUser} className="text-xs border px-4 py-1.5 rounded-full bg-orange-600 text-white">Action to Sale</button>}
        { user
         ? (
            <div className="relative">
              <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center gap-2 hover:text-gray-900 transition">
                <Image src={assets.user_icon} alt="user icon" />
              </button>
              {isProfileDropdownOpen && (
                <ul className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md z-10 overflow-hidden">
                  <li onClick={() => { setIsProfileDropdownOpen(false); router.push('/profile'); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">My Profile</li>
                  <li onClick={handleLogout} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600 text-sm">Logout</li>
                </ul>
              )}
            </div>
           )
         : <button onClick={() => router.push('/login')} className="flex items-center gap-2 hover:text-gray-900 transition">
          <Image src={assets.user_icon} alt="user icon" />
        </button>}

        {/* Mobile Cart Icon */}
        <button onClick={() => router.push('/cart')} className="relative flex items-center gap-2 hover:text-gray-900 transition">
          <Image src={assets.cart_icon} alt="cart icon" className="w-5 h-5" />
          {getCartCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {getCartCount()}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;