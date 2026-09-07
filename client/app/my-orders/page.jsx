'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";

const MyOrders = () => {
    const { currency, backendUrl, token, router } = useAppContext();

    const [orders, setOrders] = useState([]);
    const [userReviews, setUserReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewTarget, setReviewTarget] = useState(null); // { productId, orderId, productName }
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState("");

    const fetchOrdersAndReviews = async () => {
        if (!token) return;
        try {
            // Fetch Orders
            const orderRes = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } });
            if (orderRes.data.success) {
                setOrders(orderRes.data.orders);
            } else {
                toast.error(orderRes.data.message);
            }

            // Fetch User Reviews
            const reviewsRes = await axios.get(backendUrl + '/api/review/user', { headers: { token } });
            if (reviewsRes.data.success) {
                setUserReviews(reviewsRes.data.reviews);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchOrdersAndReviews();
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
                fetchOrdersAndReviews(); // refresh reviews list
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to submit review");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            <Navbar />
            
            <div className="flex-grow px-6 md:px-16 lg:px-32 py-10">
                <div className="max-w-5xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-800">My Orders</h1>
                        <p className="text-gray-500 mt-2">Track, manage, and review your recent purchases.</p>
                    </div>

                    {loading ? <Loading /> : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {orders.length === 0 ? (
                                <div className="p-10 text-center text-gray-500">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Image src={assets.box_icon} alt="No orders" className="w-8 h-8 opacity-40" />
                                    </div>
                                    <p className="text-lg font-medium text-gray-800">No orders yet</p>
                                    <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700">Start Shopping</button>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {orders.map((order, index) => (
                                        <div key={index} className="p-6 md:p-8 hover:bg-gray-50/30 transition flex flex-col md:flex-row gap-6 md:gap-10 justify-between items-start">
                                            
                                            {/* Order Info & Items */}
                                            <div className="flex-1 flex gap-6 w-full">
                                                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 flex-shrink-0">
                                                    <Image src={order.items[0]?.product?.image[0] || assets.box_icon} alt="product" width={60} height={60} className="rounded object-cover" />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-center">
                                                    <div className="flex flex-col gap-3">
                                                        {order.items.map((item, idx) => {
                                                            const isReviewed = userReviews.some(r => r.productId === item.product._id && r.orderId === order._id);
                                                            return (
                                                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                                                    <p className="font-semibold text-gray-800 flex-1">{item.product.name} <span className="text-gray-500 font-normal">x {item.quantity}</span></p>
                                                                    {order.status === 'Delivered' && !isReviewed && (
                                                                        <button 
                                                                            onClick={() => {
                                                                                setReviewTarget({ productId: item.product._id, orderId: order._id, productName: item.product.name });
                                                                                setReviewRating(5);
                                                                                setReviewText("");
                                                                                setShowReviewModal(true);
                                                                            }}
                                                                            className="text-xs text-orange-600 hover:text-white hover:bg-orange-600 border border-orange-600 px-3 py-1 rounded transition w-fit whitespace-nowrap"
                                                                        >
                                                                            Leave Review
                                                                        </button>
                                                                    )}
                                                                    {isReviewed && <span className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded border border-green-200 w-fit whitespace-nowrap">Reviewed ✓</span>}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                                                        <span className="bg-gray-100 px-2 py-1 rounded">Order #{order._id.substring(0,8).toUpperCase()}</span>
                                                        <span>{new Date(order.date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Shipping Info */}
                                            <div className="w-full md:w-auto text-sm text-gray-600 border-l-0 md:border-l border-gray-100 pl-0 md:pl-6 min-w-[200px]">
                                                <p className="font-medium text-gray-800 mb-1">Shipping To:</p>
                                                <p>{order.address.fullName}</p>
                                                <p className="line-clamp-1">{order.address.area}</p>
                                                <p>{`${order.address.city}, ${order.address.state}`}</p>
                                                <p className="mt-1 font-mono text-xs">{order.address.phoneNumber}</p>
                                            </div>

                                            {/* Status & Amount */}
                                            <div className="w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 min-w-[140px]">
                                                <div className="text-left md:text-right">
                                                    <p className="text-xl font-bold text-gray-800">{currency}{order.amount}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{order.payment ? "Paid (Stripe)" : "Cash on Delivery"}</p>
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide
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
                    )}
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

            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.2s ease-out forwards;
                }
            `}</style>
            
            <Footer />
        </div>
    );
};

export default MyOrders;