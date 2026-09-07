import addressModel from "../models/addressModel.js";

// Add User Address
const addAddress = async (req, res) => {
    try {
        const { userId, fullName, phoneNumber, pincode, area, city, state } = req.body;

        const newAddress = new addressModel({
            userId,
            fullName,
            phoneNumber,
            pincode,
            area,
            city,
            state
        });

        await newAddress.save();
        res.json({ success: true, message: "Address Added Successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get User Addresses
const getUserAddresses = async (req, res) => {
    try {
        const { userId } = req.body;
        const addresses = await addressModel.find({ userId });
        res.json({ success: true, addresses });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addAddress, getUserAddresses }
