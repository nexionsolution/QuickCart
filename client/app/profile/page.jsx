'use client'
import React, { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { assets } from '@/assets/assets';
import Image from 'next/image';
import Loading from '@/components/Loading';

const Profile = () => {
    const { backendUrl, token, router, isSeller, userOrders, currency } = useAppContext();
    const [profileData, setProfileData] = useState(null);
    const [userAddresses, setUserAddresses] = useState([]);
    const [userReviews, setUserReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);

    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewTarget, setReviewTarget] = useState(null); // { productId, orderId, productName }
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState("");

    const fetchProfileAndAddresses = async () => {
        try {
            if (!token) {
                router.push('/login');
                return;
            }

            // Fetch User Profile
            const profileRes = await axios.get(backendUrl + '/api/auth/profile', { headers: { token } });
            if (profileRes.data.success) {
                setProfileData(profileRes.data.user);
            } else {
                toast.error(profileRes.data.message);
            }

            // Fetch User Addresses
            const addressRes = await axios.get(backendUrl + '/api/user/list', { headers: { token } });
            if (addressRes.data.success) {
                setUserAddresses(addressRes.data.addresses);
            }

            // Fetch User Reviews
            const reviewsRes = await axios.get(backendUrl + '/api/review/user', { headers: { token } });
            if (reviewsRes.data.success) {
                setUserReviews(reviewsRes.data.reviews);
            }

            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load profile data");
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);

        try {
            toast.loading("Uploading photo...", { id: "photo-upload" });
            const { data } = await axios.post(backendUrl + '/api/auth/update-photo', formData, { headers: { token } });
            if (data.success) {
                toast.success("Profile photo updated!", { id: "photo-upload" });
                setProfileData({ ...profileData, photo: data.photoUrl });
            } else {
                toast.error(data.message, { id: "photo-upload" });
            }
        } catch (error) {
            toast.error(error.message, { id: "photo-upload" });
        }
    };

    useEffect(() => {
        fetchProfileAndAddresses();
    }, [token]);

    const submitReview = async (e) => {
        e.preventDefault();
        if (!reviewText.trim()) return toast.error("Please write a review");
        try {
            const { data } = await axios.post(`${backendUrl}/api/review/add`, {
                productId: reviewTarget.productId,
                orderId: reviewTarget.orderId,
                rating: reviewRating,
                text: reviewText
            }, { headers: { token } });

            if (data.success) {
                toast.success(data.message);
                setShowReviewModal(false);
                fetchProfileAndAddresses(); // refresh reviews list
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to submit review");
        }
    };

    if (loading) return <Loading />;

    // Calculate Order Metrics
    const totalOrders = userOrders.length;
    const successfulOrders = userOrders.filter(o => o.status === 'Delivered').length;
    const processingOrders = totalOrders - successfulOrders;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            <Navbar />
            
            <div className="flex-grow px-6 md:px-16 lg:px-32 py-10">
                <div className="max-w-6xl mx-auto space-y-8">
                    
                    {/* Header Section */}
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-800">My Dashboard</h1>
                        <p className="text-gray-500 mt-2">Manage your account details, addresses, and track your orders.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Profile Info Card */}
                        <div className="lg:col-span-1 flex flex-col gap-8">
                            {/* User Details */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                                <div 
                                    className="relative w-32 h-32 rounded-full mb-4 cursor-pointer group border-4 border-orange-50 overflow-hidden"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    {profileData?.photo ? (
                                        <Image src={profileData.photo} alt="Profile" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                                            <Image src={assets.user_icon} alt="user" className="w-16 h-16 opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">Change</span>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        hidden 
                                        ref={fileInputRef} 
                                        onChange={handlePhotoUpload} 
                                    />
                                </div>

                                <h2 className="text-2xl font-bold text-gray-800 text-center">{profileData?.name}</h2>
                                <p className="text-gray-500 mb-3">{profileData?.email}</p>
                                
                                <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full ${isSeller ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                    {isSeller ? 'Seller Account' : 'Customer'}
                                </span>
                                
                                <hr className="w-full my-6 border-gray-100" />
                                
                                <div className="w-full space-y-3 text-sm">
                                    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                                        <span className="text-gray-500">Account ID</span>
                                        <span className="font-mono text-gray-700 text-xs">{profileData?._id?.substring(0,10)}...</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                                        <span className="text-gray-500">Registered</span>
                                        <span className="font-medium text-gray-700">
                                            {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Addresses Section */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Saved Addresses</h3>
                                    <button onClick={() => router.push('/add-address')} className="text-sm text-orange-600 hover:text-orange-700 font-medium bg-orange-50 px-3 py-1 rounded-md">
                                        + Add New
                                    </button>
                                </div>
                                
                                {userAddresses.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-gray-500 mb-2">No addresses saved</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                        {userAddresses.map((address, index) => (
                                            <div key={index} className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
                                                <p className="font-semibold text-gray-800">{address.fullName}</p>
                                                <p className="text-xs text-gray-600 mt-0.5">{address.phoneNumber}</p>
                                                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                                    {address.area}, {address.city}, {address.state}, {address.pincode}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order History Dashboard */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Order Metrics */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                                    <span className="text-3xl font-bold text-gray-800 mb-1">{totalOrders}</span>
                                    <span className="text-sm text-gray-500 font-medium">Total Orders</span>
                                </div>
                                <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col items-center justify-center text-center">
                                    <span className="text-3xl font-bold text-blue-700 mb-1">{processingOrders}</span>
                                    <span className="text-sm text-blue-600 font-medium">Processing</span>
                                </div>
                                <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100 flex flex-col items-center justify-center text-center">
                                    <span className="text-3xl font-bold text-green-700 mb-1">{successfulOrders}</span>
                                    <span className="text-sm text-green-600 font-medium">Delivered</span>
                                </div>
                            </div>

                            {/* Orders List */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-gray-800">Order History</h3>
                                    <button onClick={() => router.push('/my-orders')} className="text-sm text-blue-600 hover:underline">View All &rarr;</button>
                                </div>

                                {userOrders.length === 0 ? (
                                    <div className="p-10 text-center text-gray-500">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Image src={assets.box_icon} alt="No orders" className="w-8 h-8 opacity-40" />
                                        </div>
                                        <p className="text-lg font-medium text-gray-800">No orders yet</p>
                                        <p className="mt-1">Looks like you haven&apos;t made your choice yet...</p>
                                        <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700">Start Shopping</button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {userOrders.slice(0, 5).map((order, index) => (
                                            <div key={index} className="p-6 hover:bg-gray-50/50 transition flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                                
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                                                        <Image src={order.items[0]?.product?.image[0] || assets.box_icon} alt="product" width={40} height={40} className="rounded object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="flex flex-col gap-2">
                                                            {order.items.map((item, idx) => {
                                                                const isReviewed = userReviews.some(r => r.productId === item.product._id && r.orderId === order._id);
                                                                return (
                                                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                                                        <p className="font-semibold text-gray-800 line-clamp-1">{item.product.name} (x{item.quantity})</p>
                                                                        {order.status === 'Delivered' && !isReviewed && (
                                                                            <button 
                                                                                onClick={() => {
                                                                                    setReviewTarget({ productId: item.product._id, orderId: order._id, productName: item.product.name });
                                                                                    setReviewRating(5);
                                                                                    setReviewText("");
                                                                                    setShowReviewModal(true);
                                                                                }}
                                                                                className="text-xs text-orange-600 hover:text-white hover:bg-orange-600 border border-orange-600 px-2 py-0.5 rounded transition w-fit"
                                                                            >
                                                                                Leave Review
                                                                            </button>
                                                                        )}
                                                                        {isReviewed && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200 w-fit">Reviewed ✓</span>}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-2">Order #{order._id.substring(0,8).toUpperCase()}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{new Date(order.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-start md:items-end gap-2 min-w-[120px]">
                                                    <span className="font-bold text-gray-800">{currency}{order.amount}</span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                                          order.status === 'Order Placed' ? 'bg-blue-100 text-blue-700' : 
                                                          'bg-orange-100 text-orange-700'}`}>
                                                        {order.status}
                                                    </span>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                    
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && reviewTarget && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-fade-in-up">
                        <button onClick={() => setShowReviewModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">Rate your experience</h3>
                        <p className="text-gray-500 text-sm mb-6">Reviewing: <span className="font-medium text-gray-700">{reviewTarget.productName}</span></p>

                        <form onSubmit={submitReview} className="flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star} 
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <svg className={`w-8 h-8 ${reviewRating >= star ? 'text-orange-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Write a review</label>
                                <textarea 
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    placeholder="What did you like or dislike about this product?"
                                    className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none h-32"
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-xl transition">
                                Submit Review
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Profile;
