'use client'
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Loading from '@/components/Loading';
import Image from 'next/image';
import { assets } from '@/assets/assets';

const SellerInvoicePage = () => {
    const { orderId } = useParams();
    const { backendUrl, token, currency, router } = useAppContext();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                if (!token) return;
                // Fetching from seller order list
                const { data } = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } });
                if (data.success) {
                    const currentOrder = data.orders.find(o => o._id === orderId);
                    setOrder(currentOrder);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [token, orderId]);

    const handleDownload = () => {
        window.print();
    };

    if (loading) return <Loading />;

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <p className="text-xl text-gray-500">Order not found.</p>
            </div>
        );
    }

    const subtotal = order.items.reduce((sum, item) => sum + (item.product.offerPrice * item.quantity), 0);
    const tax = Math.floor(subtotal * 0.02);
    const shippingFee = order.amount - subtotal - tax;

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    body {
                        background: white;
                    }
                    .invoice-container {
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                    }
                }
            `}</style>

            <div className="no-print max-w-3xl mx-auto mb-6 flex justify-between items-center">
                <button onClick={() => router.push('/seller/orders')} className="text-gray-500 hover:text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Orders
                </button>
                <button onClick={handleDownload} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    Print / Download PDF
                </button>
            </div>

            {/* INVOICE SECTION */}
            <div className="w-full max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg p-8 md:p-12 shadow-sm invoice-container">
                
                <div className="flex justify-between items-start mb-10 border-b pb-8">
                    <div>
                        <Image src={assets.logo} alt="Logo" className="w-32 mb-4" />
                        <p className="text-gray-500 text-sm">QuickCart Inc.</p>
                        <p className="text-gray-500 text-sm">123 E-Commerce St, Tech City</p>
                        <p className="text-gray-500 text-sm">support@quickcart.com</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2 uppercase">Invoice</h2>
                        <p className="text-sm text-gray-600"><strong>Invoice No:</strong> #{order._id.substring(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-gray-600"><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
                        {order.payment ? (
                            <p className="text-sm text-green-600 font-medium mt-2"><strong>Status:</strong> PAID ({order.paymentMethod})</p>
                        ) : (
                            <p className="text-sm text-orange-600 font-medium mt-2"><strong>Status:</strong> PENDING ({order.paymentMethod})</p>
                        )}
                    </div>
                </div>

                <div className="mb-10">
                    <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Billed To</h3>
                    <p className="text-gray-700 font-medium">{order.address.fullName}</p>
                    <p className="text-gray-600 text-sm">{order.address.area}</p>
                    <p className="text-gray-600 text-sm">{order.address.city}, {order.address.state} {order.address.pincode}</p>
                    <p className="text-gray-600 text-sm">Phone: {order.address.phoneNumber}</p>
                </div>

                <table className="w-full text-left border-collapse mb-10">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                            <th className="px-4 py-3 font-medium border-y">Item</th>
                            <th className="px-4 py-3 font-medium border-y text-center">Qty</th>
                            <th className="px-4 py-3 font-medium border-y text-right">Price</th>
                            <th className="px-4 py-3 font-medium border-y text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                        {order.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-100">
                                <td className="px-4 py-4 max-w-xs">
                                    <p className="font-medium">{item.product.name}</p>
                                </td>
                                <td className="px-4 py-4 text-center">{item.quantity}</td>
                                <td className="px-4 py-4 text-right">{currency}{item.product.offerPrice}</td>
                                <td className="px-4 py-4 text-right">{currency}{(item.product.offerPrice * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end">
                    <div className="w-full max-w-sm space-y-3">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>{currency}{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Tax (2%)</span>
                            <span>{currency}{tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 border-b pb-3">
                            <span>Shipping Fee</span>
                            <span>{shippingFee === 0 ? "Free" : `${currency}${shippingFee}`}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-gray-800 pt-2">
                            <span>Total</span>
                            <span>{currency}{order.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center text-sm text-gray-400 border-t pt-6">
                    Seller Copy - QuickCart Dashboard
                </div>
            </div>
        </div>
    );
};

export default SellerInvoicePage;
