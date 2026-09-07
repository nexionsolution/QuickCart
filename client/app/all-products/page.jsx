'use client'
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import { useState } from "react";

const AllProducts = () => {

    const { products, searchQuery } = useAppContext();
    const [selectedCategories, setSelectedCategories] = useState([]);

    const toggleCategory = (category) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const categories = ["Earphone", "Headphone", "Watch", "Smartphone", "Laptop", "Camera", "Accessories"];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes((searchQuery || '').toLowerCase());
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/30">
            <Navbar />
            <div className="flex-grow px-6 md:px-16 lg:px-32 py-10">
                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                    
                    {/* Filter Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:sticky md:top-24">
                            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800">Filters</h3>
                                {selectedCategories.length > 0 && (
                                    <button 
                                        onClick={() => setSelectedCategories([])}
                                        className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wider">Categories</h4>
                                <div className="space-y-3">
                                    {categories.map((category) => (
                                        <label key={category} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer transition-colors"
                                                    checked={selectedCategories.includes(category)}
                                                    onChange={() => toggleCategory(category)}
                                                />
                                            </div>
                                            <span className="text-gray-600 group-hover:text-gray-900 transition-colors font-medium select-none">{category}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        <div className="flex flex-col items-start mb-8">
                            <p className="text-3xl font-semibold text-gray-800">All products</p>
                            <div className="w-16 h-1 bg-orange-600 rounded-full mt-2"></div>
                            
                            {searchQuery && (
                                <p className="text-gray-500 mt-3">
                                    Showing results for <span className="font-semibold text-gray-800">&quot;{searchQuery}&quot;</span>
                                </p>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                            {filteredProducts.map((product, index) => <ProductCard key={index} product={product} />)}
                        </div>
                        
                        {filteredProducts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 w-full mt-8 shadow-sm">
                                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <p className="text-gray-600 text-lg font-medium">No products found</p>
                                <p className="text-gray-500 text-sm mt-1 mb-4">Try adjusting your category filters or search query.</p>
                                <button 
                                    onClick={() => setSelectedCategories([])} 
                                    className="px-6 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 font-medium transition"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AllProducts;
