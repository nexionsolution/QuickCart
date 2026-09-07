'use client'
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY;
    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://quick-cart-backend-sage.vercel.app').replace(/\/+$/, '');
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [token, setToken] = useState("");

    const [products, setProducts] = useState([]);
    const [userData, setUserData] = useState(false);
    const [isSeller, setIsSeller] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [userOrders, setUserOrders] = useState([]);

    const fetchProductData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/product/list');
            if (data.success) {
                setProducts(data.products);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const getUserCart = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token } });
            if (data.success) {
                setCartItems(data.cartData);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const addToCart = async (itemId) => {
        if (!token) {
            return toast.error("Please log in to add items to cart");
        }

        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        } else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);

        try {
            const { data } = await axios.post(backendUrl + '/api/cart/add', { itemId }, { headers: { token } });
            if (data.success) {
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const updateCartQuantity = async (itemId, quantity) => {
        if (!token) {
            return toast.error("Please log in to update cart");
        }

        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData);

        try {
            const { data } = await axios.post(backendUrl + '/api/cart/update', { itemId, quantity }, { headers: { token } });
            if (!data.success) {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchProductData();
        if (!token && localStorage.getItem("token")) {
            setToken(localStorage.getItem("token"));
            setUser({ loggedIn: true }); // Mock user object for UI
            setIsSeller(localStorage.getItem("isSeller") === "true");
        }
    }, [])

    const becomeSellerUser = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/become-seller', {}, { headers: { token } });
            if (data.success) {
                setIsSeller(true);
                localStorage.setItem('isSeller', 'true');
                toast.success(data.message);
                router.push('/seller');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const fetchUserOrders = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } });
            if (data.success) {
                setUserOrders(data.orders);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const fetchUserData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/auth/profile', { headers: { token } });
            if (data.success) {
                setUserData(data.user);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (token) {
            getUserCart();
            fetchUserOrders();
            fetchUserData();
        }
    }, [token])

    const value = {
        user, setUser,
        token, setToken,
        backendUrl,
        currency, router,
        isSeller, setIsSeller,
        userData, setUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        getUserCart, becomeSellerUser,
        searchQuery, setSearchQuery,
        userOrders, fetchUserOrders
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}