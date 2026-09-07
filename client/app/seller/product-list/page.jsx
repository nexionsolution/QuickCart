'use client'
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";

const ProductList = () => {
    const { currency, router, backendUrl, token, fetchProductData } = useAppContext();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Editing State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // Quick Price Editing
    const [quickEditId, setQuickEditId] = useState(null);
    const [quickEditPrice, setQuickEditPrice] = useState("");

    const fetchSellerProduct = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/product/seller-list', { headers: { token } });
            if (data.success) {
                setProducts(data.products.reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
        setLoading(false);
    };

    const removeProduct = async (id) => {
        if (!confirm("Are you sure you want to remove this product?")) return;
        try {
            const { data } = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } });
            if (data.success) {
                toast.success(data.message);
                fetchSellerProduct();
                fetchProductData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const toggleVisibility = async (product) => {
        try {
            const newVisibility = product.isVisible === false ? true : false;
            const { data } = await axios.post(backendUrl + '/api/product/update', { id: product._id, isVisible: newVisibility }, { headers: { token } });
            if (data.success) {
                toast.success(`Product is now ${newVisibility ? 'Visible' : 'Hidden'}`);
                fetchSellerProduct();
                fetchProductData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleQuickPriceSave = async (id) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/product/update', { id, offerPrice: Number(quickEditPrice) }, { headers: { token } });
            if (data.success) {
                toast.success("Discount applied successfully");
                setQuickEditId(null);
                fetchSellerProduct();
                fetchProductData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEditFormChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(backendUrl + '/api/product/update', { id: editingProduct._id, ...editFormData }, { headers: { token } });
            if (data.success) {
                toast.success("Product Details Updated");
                setEditModalOpen(false);
                fetchSellerProduct();
                fetchProductData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setEditFormData({
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            offerPrice: product.offerPrice,
            brand: product.brand || "",
            color: product.color || "",
            madeIn: product.madeIn || "",
            weight: product.weight || "",
            warranty: product.warranty || ""
        });
        setEditModalOpen(true);
    };

    useEffect(() => {
        if (token) {
            fetchSellerProduct();
        }
    }, [token]);

    if (loading) return <div className="flex-1 h-screen flex items-center justify-center"><Loading /></div>;

    return (
        <div className="flex-1 p-6 md:p-10 bg-gray-50/50 min-h-screen overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Inventory Management</h2>

            {products.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-500 border border-gray-100">
                    No products found in inventory.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 max-w-5xl">
                    {products.map((product) => (
                        <div key={product._id} className={`bg-white rounded-xl shadow-sm border ${product.isVisible === false ? 'border-gray-300 opacity-80' : 'border-gray-100'} overflow-hidden transition-all flex flex-col md:flex-row gap-6 p-6`}>
                            
                            {/* Product Image */}
                            <div className="w-full md:w-40 h-40 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 relative">
                                {product.image && product.image.length > 0 ? (
                                    <Image src={product.image[0]} alt={product.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                                {product.isVisible === false && (
                                    <div className="absolute top-2 left-2 bg-gray-800/80 text-white text-xs px-2 py-1 rounded">Hidden</div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs text-orange-600 font-medium uppercase tracking-wider mb-1">{product.category}</p>
                                            <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
                                        </div>
                                        {/* Visibility Toggle */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500 font-medium">{product.isVisible !== false ? 'Live' : 'Hidden'}</span>
                                            <button 
                                                onClick={() => toggleVisibility(product)}
                                                className={`w-11 h-6 rounded-full relative transition-colors ${product.isVisible !== false ? 'bg-orange-500' : 'bg-gray-300'}`}
                                            >
                                                <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${product.isVisible !== false ? 'left-6' : 'left-1'}`}></span>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description}</p>
                                    {product.brand && <p className="text-sm text-gray-600 mt-1">Brand: {product.brand}</p>}
                                </div>

                                {/* Pricing & Actions */}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 line-through">{currency}{product.price}</span>
                                            
                                            {quickEditId === product._id ? (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm font-medium">{currency}</span>
                                                    <input 
                                                        type="number" 
                                                        value={quickEditPrice}
                                                        onChange={(e) => setQuickEditPrice(e.target.value)}
                                                        className="w-20 border rounded px-2 py-1 text-sm outline-none focus:border-orange-500"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => handleQuickPriceSave(product._id)} className="text-xs bg-green-600 text-white px-2 py-1.5 rounded">Save</button>
                                                    <button onClick={() => setQuickEditId(null)} className="text-xs bg-gray-200 text-gray-700 px-2 py-1.5 rounded">Cancel</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-gray-800">{currency}{product.offerPrice}</span>
                                                    <button 
                                                        onClick={() => { setQuickEditId(product._id); setQuickEditPrice(product.offerPrice); }}
                                                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                                                    >
                                                        Add Discount
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEditModal(product)} className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition">
                                            Edit Details
                                        </button>
                                        <button onClick={() => removeProduct(product._id)} className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Edit Product Details</h2>
                            <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="editProductForm" onSubmit={handleEditSave} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700">Product Name</label>
                                        <input required name="name" value={editFormData.name} onChange={handleEditFormChange} className="border rounded p-2 outline-none focus:border-orange-500" />
                                    </div>
                                    
                                    <div className="flex flex-col gap-1 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700">Description</label>
                                        <textarea required name="description" value={editFormData.description} onChange={handleEditFormChange} rows="3" className="border rounded p-2 outline-none focus:border-orange-500"></textarea>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Original Price</label>
                                        <input required type="number" name="price" value={editFormData.price} onChange={handleEditFormChange} className="border rounded p-2 outline-none focus:border-orange-500" />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Offer Price</label>
                                        <input required type="number" name="offerPrice" value={editFormData.offerPrice} onChange={handleEditFormChange} className="border rounded p-2 outline-none focus:border-orange-500" />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Category</label>
                                        <select required name="category" value={editFormData.category} onChange={handleEditFormChange} className="border rounded p-2 outline-none focus:border-orange-500 bg-white">
                                            <option value="Earphone">Earphone</option>
                                            <option value="Headphone">Headphone</option>
                                            <option value="Watch">Watch</option>
                                            <option value="Smartphone">Smartphone</option>
                                            <option value="Laptop">Laptop</option>
                                            <option value="Camera">Camera</option>
                                            <option value="Accessories">Accessories</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Brand</label>
                                        <input name="brand" value={editFormData.brand} onChange={handleEditFormChange} className="border rounded p-2 outline-none focus:border-orange-500" />
                                    </div>
                                    
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Color</label>
                                        <input name="color" value={editFormData.color} onChange={handleEditFormChange} className="border rounded p-2 outline-none focus:border-orange-500" />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Weight</label>
                                        <input name="weight" value={editFormData.weight} onChange={handleEditFormChange} className="border rounded p-2 outline-none focus:border-orange-500" />
                                    </div>

                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button type="button" onClick={() => setEditModalOpen(false)} className="px-5 py-2 border border-gray-300 rounded text-gray-700 hover:bg-white font-medium">Cancel</button>
                            <button type="submit" form="editProductForm" className="px-5 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-medium">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProductList;