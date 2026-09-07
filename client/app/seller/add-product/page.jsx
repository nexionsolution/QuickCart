'use client'
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const AddProduct = () => {

    const [files, setFiles] = useState([]);
    const [imageUrls, setImageUrls] = useState(['']); // Allow multiple URLs

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Earphone');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [brand, setBrand] = useState('');
    const [color, setColor] = useState('');
    const [madeIn, setMadeIn] = useState('');
    const [manufactureDate, setManufactureDate] = useState('');
    const [weight, setWeight] = useState('');
    const [warranty, setWarranty] = useState('');

    const { backendUrl, token, fetchProductData } = useAppContext();

    const handleImageUrlChange = (index, value) => {
        const newUrls = [...imageUrls];
        newUrls[index] = value;
        setImageUrls(newUrls);
    };

    const addImageUrlField = () => {
        if (imageUrls.length < 4) {
            setImageUrls([...imageUrls, '']);
        } else {
            toast.error("Maximum 4 image URLs allowed");
        }
    };

    const removeImageUrlField = (index) => {
        const newUrls = imageUrls.filter((_, i) => i !== index);
        setImageUrls(newUrls);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            toast.loading("Adding product...", { id: "add-product" });
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("category", category);
            formData.append("price", price);
            formData.append("offerPrice", offerPrice);
            formData.append("brand", brand);
            formData.append("color", color);
            formData.append("madeIn", madeIn);
            formData.append("manufactureDate", manufactureDate);
            formData.append("weight", weight);
            formData.append("warranty", warranty);

            // Filter out empty URLs
            const validUrls = imageUrls.filter(url => url.trim() !== '');
            if (validUrls.length > 0) {
                formData.append("imageUrls", JSON.stringify(validUrls));
            }

            let hasFiles = false;
            files.forEach((file, index) => {
                if (file) {
                    formData.append(`image${index}`, file);
                    hasFiles = true;
                }
            });

            if (!hasFiles && validUrls.length === 0) {
                return toast.error("Please add at least one image file or URL", { id: "add-product" });
            }

            const { data } = await axios.post(backendUrl + '/api/product/add', formData, { headers: { token } });
            
            if (data.success) {
                toast.success(data.message, { id: "add-product" });
                // Reset form
                setName(''); setDescription(''); setFiles([]); setImageUrls(['']);
                setPrice(''); setOfferPrice(''); setBrand(''); setColor('');
                setMadeIn(''); setManufactureDate(''); setWeight(''); setWarranty('');
                fetchProductData();
            } else {
                toast.error(data.message, { id: "add-product" });
            }
        } catch (error) {
            toast.error(error.message, { id: "add-product" });
        }
    };

    return (
        <div className="flex-1 p-6 md:p-10 bg-gray-50/50 min-h-screen overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New Product</h2>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Basic Info Section */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-medium text-gray-800 mb-5 border-b pb-2">Basic Information</h3>
                        <div className="space-y-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Product Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                                    className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-orange-500 transition"
                                    onChange={(e) => setName(e.target.value)}
                                    value={name}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Product Description <span className="text-red-500">*</span></label>
                                <textarea
                                    rows={4}
                                    className="outline-none py-3 px-4 rounded-lg border border-gray-300 focus:border-orange-500 transition resize-none"
                                    placeholder="Write a detailed description of the product..."
                                    onChange={(e) => setDescription(e.target.value)}
                                    value={description}
                                    required
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Media Section */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-medium text-gray-800 mb-5 border-b pb-2">Product Images</h3>
                        
                        <div className="space-y-6">
                            {/* File Uploads */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-3">Upload from Device</p>
                                <div className="flex flex-wrap items-center gap-4">
                                    {[...Array(4)].map((_, index) => (
                                        <label key={index} htmlFor={`image${index}`} className="relative group cursor-pointer block">
                                            <input onChange={(e) => {
                                                const updatedFiles = [...files];
                                                updatedFiles[index] = e.target.files[0];
                                                setFiles(updatedFiles);
                                            }} type="file" id={`image${index}`} hidden accept="image/*" />
                                            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 group-hover:border-orange-500 transition">
                                                {files[index] ? (
                                                    <Image
                                                        src={URL.createObjectURL(files[index])}
                                                        alt="preview"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <Image src={assets.upload_area} alt="upload" className="w-8 opacity-50" />
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* URL Uploads */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-3">Or Add Image URLs (Links)</p>
                                <div className="space-y-3">
                                    {imageUrls.map((url, index) => (
                                        <div key={index} className="flex gap-3">
                                            <input
                                                type="url"
                                                placeholder="https://example.com/image.jpg"
                                                className="flex-1 outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-orange-500 transition text-sm"
                                                value={url}
                                                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                            />
                                            {imageUrls.length > 1 && (
                                                <button type="button" onClick={() => removeImageUrlField(index)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {imageUrls.length < 4 && (
                                        <button type="button" onClick={addImageUrlField} className="text-sm text-orange-600 font-medium hover:text-orange-700 flex items-center gap-1">
                                            + Add another link
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Category */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-medium text-gray-800 mb-5 border-b pb-2">Pricing & Classification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                                <select
                                    className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-orange-500 transition bg-white"
                                    onChange={(e) => setCategory(e.target.value)}
                                    value={category}
                                >
                                    <option value="Earphone">Earphone</option>
                                    <option value="Headphone">Headphone</option>
                                    <option value="Watch">Watch</option>
                                    <option value="Smartphone">Smartphone</option>
                                    <option value="Laptop">Laptop</option>
                                    <option value="Camera">Camera</option>
                                    <option value="Accessories">Accessories</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Original Price <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-4 top-2.5 text-gray-500 font-medium">$</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full outline-none py-2.5 pl-8 pr-4 rounded-lg border border-gray-300 focus:border-orange-500 transition"
                                        onChange={(e) => setPrice(e.target.value)}
                                        value={price}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Discounted Price <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-4 top-2.5 text-gray-500 font-medium">$</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full outline-none py-2.5 pl-8 pr-4 rounded-lg border border-gray-300 focus:border-orange-500 transition"
                                        onChange={(e) => setOfferPrice(e.target.value)}
                                        value={offerPrice}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Specific Details */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-medium text-gray-800 mb-5 border-b pb-2">Specific Details (Optional)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Brand</label>
                                <input type="text" placeholder="e.g. Apple" className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-orange-500 transition" onChange={(e) => setBrand(e.target.value)} value={brand} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Color</label>
                                <input type="text" placeholder="e.g. Midnight Black" className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-orange-500 transition" onChange={(e) => setColor(e.target.value)} value={color} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Made In</label>
                                <input type="text" placeholder="e.g. USA" className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-orange-500 transition" onChange={(e) => setMadeIn(e.target.value)} value={madeIn} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Mfg Date</label>
                                <input type="text" placeholder="e.g. Oct 2024" className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-orange-500 transition" onChange={(e) => setManufactureDate(e.target.value)} value={manufactureDate} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Weight</label>
                                <input type="text" placeholder="e.g. 250g" className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-orange-500 transition" onChange={(e) => setWeight(e.target.value)} value={weight} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Warranty</label>
                                <input type="text" placeholder="e.g. 1 Year Limited" className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-orange-500 transition" onChange={(e) => setWarranty(e.target.value)} value={warranty} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-10 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg shadow-sm transition transform hover:-translate-y-0.5">
                            Publish Product
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddProduct;