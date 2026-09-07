import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { assets } from "@/assets/assets";
import Loading from "@/components/Loading";

const Dashboard = () => {
    const { backendUrl, token, currency } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [sellerName, setSellerName] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());

    // Live clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (!token) return;

                // Fetch User Profile
                try {
                    const profileRes = await axios.get(backendUrl + '/api/auth/profile', { headers: { token } });
                    if (profileRes.data.success) {
                        setSellerName(profileRes.data.user.name);
                    }
                } catch (err) {
                    console.log("Could not fetch user profile", err);
                }

                // Fetch Products
                const productRes = await axios.get(backendUrl + '/api/product/list');
                const products = productRes.data.success ? productRes.data.products : [];

                // Fetch Orders
                const orderRes = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } });
                const orders = orderRes.data.success ? orderRes.data.orders : [];

                // Calculate Stats
                const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
                
                setStats({
                    totalRevenue: totalRevenue.toFixed(2),
                    totalOrders: orders.length,
                    totalProducts: products.length
                });

                // Get 5 most recent orders
                const sortedOrders = orders.sort((a, b) => b.date - a.date).slice(0, 5);
                setRecentOrders(sortedOrders);

                setLoading(false);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load dashboard data");
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    if (loading) return <Loading />;

    return (
        <div className="flex-1 p-6 md:p-10 bg-gray-50/50 min-h-screen overflow-y-auto">
            
            {/* Top Greeting Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-orange-50 to-white">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {getGreeting()}, <span className="text-orange-600">{sellerName || "Seller"}</span>! 👋
                    </h2>
                    <p className="text-gray-500 mt-1">Here is what is happening with your store today.</p>
                </div>
                <div className="flex flex-col items-start md:items-end bg-white/60 px-4 py-2 rounded-lg border border-orange-100/50">
                    <span className="text-lg font-bold text-gray-800">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                        {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-4">Dashboard Overview</h3>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Revenue Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl text-green-600 font-bold">$</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-800">{currency}{stats.totalRevenue}</h3>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Image src={assets.order_icon} alt="Orders" className="w-7 h-7 opacity-70" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Orders</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.totalOrders}</h3>
                    </div>
                </div>

                {/* Products Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Image src={assets.product_list_icon} alt="Products" className="w-7 h-7 opacity-70" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Products</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.totalProducts}</h3>
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-white">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                </div>
                
                {recentOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No orders yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-600 text-sm">
                                    <th className="px-6 py-4 font-medium border-b border-gray-100">Order Items</th>
                                    <th className="px-6 py-4 font-medium border-b border-gray-100">Customer</th>
                                    <th className="px-6 py-4 font-medium border-b border-gray-100">Date</th>
                                    <th className="px-6 py-4 font-medium border-b border-gray-100">Status</th>
                                    <th className="px-6 py-4 font-medium border-b border-gray-100 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {recentOrders.map((order, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 border-b border-gray-50 max-w-[200px] truncate">
                                            {order.items.map(item => `${item.product.name} (x${item.quantity})`).join(', ')}
                                        </td>
                                        <td className="px-6 py-4 border-b border-gray-50">
                                            {order.address.fullName}
                                        </td>
                                        <td className="px-6 py-4 border-b border-gray-50 text-gray-500">
                                            {new Date(order.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 border-b border-gray-50">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                                ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                                  order.status === 'Order Placed' ? 'bg-blue-100 text-blue-700' : 
                                                  'bg-orange-100 text-orange-700'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-gray-50 text-right font-medium text-gray-800">
                                            {currency}{order.amount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
