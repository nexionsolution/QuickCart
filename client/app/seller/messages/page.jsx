'use client';
import React, { useEffect, useState, useRef } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { assets } from "@/assets/assets";

const Messages = () => {
    const { backendUrl, token, user } = useAppContext();
    const [inbox, setInbox] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const fetchInbox = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get(backendUrl + '/api/chat/inbox', { headers: { token } });
            if (data.success) {
                setInbox(data.inbox);
            }
        } catch (error) {
            console.error("Failed to fetch inbox", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChatHistory = async (otherUserId) => {
        if (!token || !otherUserId) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/chat/history/${otherUserId}`, { headers: { token } });
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    // Initial Inbox Load & Polling
    useEffect(() => {
        fetchInbox();
        const interval = setInterval(fetchInbox, 5000); // Poll inbox
        return () => clearInterval(interval);
    }, [token]);

    // Polling for selected chat
    useEffect(() => {
        if (selectedUser) {
            fetchChatHistory(selectedUser._id);
            const interval = setInterval(() => {
                fetchChatHistory(selectedUser._id);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [selectedUser, token]);

    // Scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !token || !selectedUser) return;

        const text = newMessage;
        setNewMessage('');
        
        // Optimistic UI update
        const optimisticMsg = {
            senderId: "me", 
            receiverId: selectedUser._id,
            text,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const { data } = await axios.post(`${backendUrl}/api/chat/send`, {
                receiverId: selectedUser._id,
                text
            }, { headers: { token } });

            if (!data.success) {
                setMessages(prev => prev.filter(m => m !== optimisticMsg));
                toast.error(data.message);
            } else {
                fetchInbox(); // Refresh inbox list ordering
            }
        } catch (error) {
            setMessages(prev => prev.filter(m => m !== optimisticMsg));
            toast.error(error.message);
        }
    };

    if (loading) return <div className="p-10">Loading messages...</div>;

    return (
        <div className="flex-1 p-6 md:p-10 bg-gray-50/50 min-h-[calc(100vh-64px)] flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Messages Inbox</h2>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden max-h-[80vh]">
                
                {/* Inbox List Sidebar */}
                <div className="w-1/3 min-w-[250px] border-r border-gray-100 flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-semibold text-gray-700">Conversations</h3>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {inbox.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">No messages yet.</div>
                        ) : (
                            inbox.map((chat, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => setSelectedUser(chat.user)}
                                    className={`p-4 border-b border-gray-50 cursor-pointer transition hover:bg-gray-50 flex items-center gap-3 ${selectedUser?._id === chat.user._id ? 'bg-orange-50/50 border-l-4 border-l-orange-500' : ''}`}
                                >
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {chat.user.photo ? (
                                            <Image src={chat.user.photo} alt="user" width={40} height={40} className="object-cover" />
                                        ) : (
                                            <Image src={assets.user_icon} alt="user" className="w-5 h-5 opacity-50" />
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-semibold text-gray-800 truncate text-sm">{chat.user.name}</h4>
                                            <span className="text-[10px] text-gray-400">{new Date(chat.latestMessage.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{chat.latestMessage.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-gray-50/30 relative">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-3 shadow-sm z-10">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                    {selectedUser.photo ? (
                                        <Image src={selectedUser.photo} alt="user" width={40} height={40} className="object-cover" />
                                    ) : (
                                        <Image src={assets.user_icon} alt="user" className="w-5 h-5 opacity-50" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{selectedUser.name}</h3>
                                    <p className="text-xs text-gray-500">{selectedUser.email}</p>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                                {messages.length === 0 ? (
                                    <div className="m-auto text-gray-400 text-sm">No messages yet. Say hello!</div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.senderId === "me" || msg.receiverId === selectedUser._id; 
                                        const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] rounded-2xl px-5 py-2.5 text-sm shadow-sm flex flex-col ${isMe ? 'bg-orange-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'}`}>
                                                    <span>{msg.text}</span>
                                                    <span className={`text-[10px] mt-1 text-right ${isMe ? 'text-orange-200' : 'text-gray-400'}`}>
                                                        {timeStr}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Form */}
                            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-3 items-center">
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!newMessage.trim()}
                                    className="w-12 h-12 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white rounded-full flex items-center justify-center transition shadow-sm"
                                >
                                    <svg className="w-5 h-5 ml-[-2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 h-full">
                            <Image src={assets.order_icon} alt="inbox" className="w-16 h-16 opacity-20 mb-4 grayscale" />
                            <p className="text-lg font-medium text-gray-500">Your Inbox</p>
                            <p className="text-sm">Select a conversation from the left to start chatting.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Messages;
