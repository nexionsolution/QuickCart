'use client'
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAppContext } from '@/context/AppContext';
import { assets } from '@/assets/assets';
import Image from 'next/image';

const ChatWidget = ({ sellerId, productId }) => {
    const { backendUrl, token, user } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sellerName, setSellerName] = useState('Seller');
    const messagesEndRef = useRef(null);

    // Scroll to bottom when messages update
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const fetchMessages = async () => {
        if (!isOpen || !token || !sellerId) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/chat/history/${sellerId}`, { headers: { token } });
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    // Poll for new messages while chat is open
    useEffect(() => {
        fetchMessages();
        let interval;
        if (isOpen) {
            interval = setInterval(fetchMessages, 3000);
        }
        return () => clearInterval(interval);
    }, [isOpen, sellerId, token]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !token) return;

        const text = newMessage;
        setNewMessage(''); // optimistic clear
        
        // Optimistic UI update
        const optimisticMsg = {
            senderId: "temp", // will be replaced
            receiverId: sellerId,
            text,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const { data } = await axios.post(`${backendUrl}/api/chat/send`, {
                receiverId: sellerId,
                text,
                productId
            }, { headers: { token } });

            if (!data.success) {
                // Revert optimistic update if failed
                setMessages(prev => prev.filter(m => m !== optimisticMsg));
                console.error(data.message);
            }
        } catch (error) {
            setMessages(prev => prev.filter(m => m !== optimisticMsg));
            console.error("Failed to send message", error);
        }
    };

    if (!sellerId) return null; // Don't show if no seller ID

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            
            {/* Chat Box */}
            {isOpen && (
                <div className="bg-white w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-4 flex flex-col h-[450px] animate-fade-in-up origin-bottom-right transition-all">
                    {/* Header */}
                    <div className="bg-orange-600 p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Image src={assets.user_icon} alt="user" className="w-5 h-5 invert" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm tracking-wide">CHAT WITH SELLER</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-white/80">Active & Online</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 bg-gray-50/50 p-4 overflow-y-auto flex flex-col gap-3">
                        <div className="text-center mb-2">
                            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Secure Chat</span>
                        </div>
                        
                        {messages.length === 0 && (
                            <div className="text-center mt-10">
                                <p className="text-sm text-gray-500">Send a message to ask the seller a question.</p>
                            </div>
                        )}

                        {messages.map((msg, index) => {
                            const isMe = msg.senderId !== sellerId && msg.senderId !== "seller_temp"; 
                            const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                            return (
                                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm flex flex-col ${isMe ? 'bg-orange-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'}`}>
                                        <span>{msg.text}</span>
                                        <span className={`text-[10px] mt-1 text-right ${isMe ? 'text-orange-200' : 'text-gray-400'}`}>
                                            {timeStr}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={token ? "Type your question..." : "Please log in to chat"}
                            disabled={!token}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50"
                        />
                        <button 
                            type="submit" 
                            disabled={!token || !newMessage.trim()}
                            className="w-10 h-10 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white rounded-full flex items-center justify-center transition"
                        >
                            <svg className="w-4 h-4 ml-[-2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center relative group"
            >
                {isOpen ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                )}
                {/* Tooltip */}
                {!isOpen && (
                    <span className="absolute right-20 bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                        Chat with Seller
                        <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 border-[5px] border-transparent border-l-gray-800"></div>
                    </span>
                )}
            </button>

            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: scale(0.9) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ChatWidget;
