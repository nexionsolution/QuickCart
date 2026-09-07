import { NextResponse } from 'next/server';

const authSeller = async (userId) => {
    try {
        // Temporary logic since Clerk is removed
        // We will implement actual backend validation later
        return true;
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}

export default authSeller;