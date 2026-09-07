'use client'
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrderSummary from '@/components/OrderSummary';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
    const { backendUrl, token, router, setCartItems } = useAppContext();
    const [cardDetails, setCardDetails] = useState({
        name: '',
        number: '',
        expiry: '',
        cvv: ''
    });

    const handleInputChange = (e) => {
        setCardDetails({
            ...cardDetails,
            [e.target.name]: e.target.value
        });
    };

    const handlePlaceOrder = async (orderData) => {
        // Validate Fake Payment Details
        if (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
            return toast.error("Please fill in all payment details");
        }
        if (cardDetails.number.length < 15) {
            return toast.error("Please enter a valid card number");
        }

        try {
            toast.loading("Processing Payment...", { id: 'payment' });
            
            // Simulating network delay for fake payment
            await new Promise(resolve => setTimeout(resolve, 1500));

            const { data } = await axios.post(
                backendUrl + "/api/order/place",
                {
                    ...orderData,
                    paymentMethod: "Card",
                    payment: true
                },
                { headers: { token } }
            );

            if (data.success) {
                toast.success("Payment Successful!", { id: 'payment' });
                setCartItems({});
                router.push(`/order-success/${data.orderId}`);
            } else {
                toast.error(data.message, { id: 'payment' });
            }
        } catch (error) {
            toast.error(error.message, { id: 'payment' });
        }
    };

    return (
        <>
            <Navbar />
            <div className="pt-14 px-6 md:px-16 lg:px-32 mb-32">
                <div className="bg-white max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
                    
                    {/* Left: Payment Form */}
                    <div className="flex-1 w-full border border-gray-200 rounded-lg p-6 md:p-10 shadow-sm">
                        <h2 className="text-2xl font-medium text-gray-800 mb-6">Payment Details</h2>
                        <p className="text-gray-500 mb-8 text-sm">Please enter your payment information below. This is a secure, encrypted connection.</p>
                        
                        <div className="space-y-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Name on Card</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={cardDetails.name}
                                    onChange={handleInputChange}
                                    placeholder="John Doe" 
                                    className="outline-none py-3 px-4 rounded border border-gray-300 focus:border-orange-500 transition"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Card Number</label>
                                <input 
                                    type="text" 
                                    name="number"
                                    value={cardDetails.number}
                                    onChange={handleInputChange}
                                    placeholder="0000 0000 0000 0000" 
                                    maxLength="19"
                                    className="outline-none py-3 px-4 rounded border border-gray-300 focus:border-orange-500 transition"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                                    <input 
                                        type="text" 
                                        name="expiry"
                                        value={cardDetails.expiry}
                                        onChange={handleInputChange}
                                        placeholder="MM/YY" 
                                        maxLength="5"
                                        className="outline-none py-3 px-4 rounded border border-gray-300 focus:border-orange-500 transition"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">CVV</label>
                                    <input 
                                        type="text" 
                                        name="cvv"
                                        value={cardDetails.cvv}
                                        onChange={handleInputChange}
                                        placeholder="123" 
                                        maxLength="4"
                                        className="outline-none py-3 px-4 rounded border border-gray-300 focus:border-orange-500 transition"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                Payments are 100% secure and encrypted.
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="w-full md:w-auto">
                        <OrderSummary isCheckout={true} onPlaceOrderSubmit={handlePlaceOrder} />
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CheckoutPage;
