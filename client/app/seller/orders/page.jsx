'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import Link from "next/link";

const Orders = () => {
    const { currency, backendUrl, token, router } = useAppContext();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSellerOrders = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } });
            if (data.success) {
                setOrders(data.orders.reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
        setLoading(false);
    }

    const updateOrderStatus = async (orderId, status) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/order/status', { orderId, status }, { headers: { token } });
            if (data.success) {
                toast.success(data.message);
                fetchSellerOrders();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        fetchSellerOrders();
    }, []);

    if (loading) return <div className="flex-1 h-screen flex items-center justify-center"><Loading /></div>;

    return (
        <div className="flex-1 p-6 md:p-10 bg-gray-50/50 min-h-screen overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Management</h2>
            
            {orders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-500 border border-gray-100">
                    No orders found.
                </div>
            ) : (
                <div className="space-y-6 max-w-5xl">
                    {orders.map((order, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Order ID</p>
                                        <p className="text-sm font-medium text-gray-800">#{order._id.substring(0,8).toUpperCase()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Date Placed</p>
                                        <p className="text-sm font-medium text-gray-800">{new Date(order.date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Amount</p>
                                        <p className="text-sm font-medium text-gray-800">{currency}{order.amount}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => router.push(`/seller/invoice/${order._id}`)}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded transition"
                                    >
                                        View Invoice
                                    </button>
                                </div>
                            </div>

                            {/* Order Body */}
                            <div className="p-6 flex flex-col lg:flex-row gap-8 justify-between">
                                {/* Items */}
                                <div className="flex-1 flex gap-5">
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 flex-shrink-0">
                                        <Image src={assets.box_icon} alt="box_icon" className="w-8 h-8 opacity-70" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Items Ordered ({order.items.length})</h4>
                                        <ul className="space-y-1">
                                            {order.items.map((item, i) => (
                                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                                    <span>{item.product.name} <span className="font-medium text-gray-800">x {item.quantity}</span></span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Customer Address */}
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Delivery Details</h4>
                                    <div className="text-sm text-gray-600 space-y-0.5">
                                        <p className="font-medium text-gray-800">{order.address.fullName}</p>
                                        <p>{order.address.area}</p>
                                        <p>{order.address.city}, {order.address.state} {order.address.pincode}</p>
                                        <p className="pt-1 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                            {order.address.phoneNumber}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Controls */}
                                <div className="flex-1 flex flex-col gap-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Payment Status</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded font-medium">{order.paymentMethod}</span>
                                            {order.payment ? (
                                                <span className="text-sm text-green-700 bg-green-100 px-2.5 py-1 rounded font-medium flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Paid
                                                </span>
                                            ) : (
                                                <span className="text-sm text-orange-700 bg-orange-100 px-2.5 py-1 rounded font-medium flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Order Status</h4>
                                        <select 
                                            onChange={(e) => updateOrderStatus(order._id, e.target.value)} 
                                            value={order.status} 
                                            className={`text-sm font-medium px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500/50 transition w-full max-w-[200px] cursor-pointer
                                                ${order.status === 'Delivered' ? 'bg-green-50 border-green-200 text-green-800' : 
                                                  order.status === 'Shipped' || order.status === 'Out for delivery' ? 'bg-blue-50 border-blue-200 text-blue-800' : 
                                                  'bg-orange-50 border-orange-200 text-orange-800'}`
                                            }
                                        >
                                            <option value="Order Placed">Order Placed</option>
                                            <option value="Packing">Packing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Out for delivery">Out for delivery</option>
                                            <option value="Delivered">Delivered</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;