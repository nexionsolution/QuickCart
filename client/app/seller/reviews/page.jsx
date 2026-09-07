'use client';
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";

const SellerReviews = () => {
    const { backendUrl, token } = useAppContext();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");

    const fetchReviews = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get(backendUrl + '/api/review/seller', { headers: { token } });
            if (data.success) {
                setReviews(data.reviews);
            }
        } catch (error) {
            console.error("Failed to fetch seller reviews", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [token]);

    const handleReply = async (reviewId) => {
        if (!replyText.trim()) return toast.error("Please write a reply");
        try {
            const { data } = await axios.post(`${backendUrl}/api/review/reply`, {
                reviewId,
                replyText
            }, { headers: { token } });

            if (data.success) {
                toast.success(data.message);
                setReplyingTo(null);
                setReplyText("");
                fetchReviews(); // refresh
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to post reply");
        }
    };

    if (loading) return <div className="p-10 text-gray-500">Loading reviews...</div>;

    return (
        <div className="flex-1 p-6 md:p-10 bg-gray-50/50 min-h-[calc(100vh-64px)]">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Reviews</h2>
            <p className="text-gray-500 mb-8">See what customers are saying about your products and write official replies.</p>

            {reviews.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500 text-lg">No reviews yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                            
                            {/* Product Info */}
                            <div className="w-full md:w-48 flex-shrink-0 border-r border-gray-100 pr-4">
                                <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-3">
                                    <Image src={review.product?.image?.[0]} alt="product" width={200} height={200} className="w-full h-full object-cover" />
                                </div>
                                <p className="font-semibold text-gray-800 text-sm line-clamp-2">{review.product?.name}</p>
                            </div>

                            {/* Review Content */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                            {review.user?.photo && <Image src={review.user.photo} alt="user" width={40} height={40} className="object-cover" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{review.user?.name}</p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-orange-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                                <span className="text-xs text-gray-400 ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-gray-700 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">{review.text}</p>

                                {/* Seller Reply Section */}
                                <div className="mt-6">
                                    {review.sellerReply ? (
                                        <div className="ml-8 border-l-2 border-orange-500 pl-4 py-1">
                                            <p className="text-xs font-bold text-orange-600 mb-1 uppercase tracking-wide">Your Reply</p>
                                            <p className="text-gray-600 text-sm">{review.sellerReply}</p>
                                        </div>
                                    ) : (
                                        <>
                                            {replyingTo === review._id ? (
                                                <div className="ml-8 mt-2 flex flex-col items-end gap-2">
                                                    <textarea 
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Write your official response to this customer..."
                                                        className="w-full border border-gray-200 rounded-lg p-3 focus:ring-1 focus:ring-orange-500 outline-none text-sm h-20"
                                                    ></textarea>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setReplyingTo(null)} className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                                                        <button onClick={() => handleReply(review._id)} className="px-4 py-1.5 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-md transition">Post Reply</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => setReplyingTo(review._id)} className="ml-8 text-sm text-blue-600 hover:underline font-medium">
                                                    ↳ Reply to this review
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SellerReviews;
