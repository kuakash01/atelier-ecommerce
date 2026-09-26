const User = require("../../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// const signin = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const FindUser = await User.findOne({ email });
//         if (!FindUser) return res.status(404).json({ error: "User not found" });
//         const isMatch = await FindUser.comparePassword(password);
//         if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

//         // Generate JWT or session token here
//         const token = jwt.sign(
//             { id: FindUser._id, role: FindUser.role, email: FindUser.email },
//             process.env.JWT_SECRET,
//             { expiresIn: '1d' }
//         );
//         FindUser.tokens.push({ token });
//         await FindUser.save();



//         // res.cookie('token', token, {
//         //     httpOnly: true,
//         //     secure: process.env.NODE_ENV === 'production', // Set to true in production
//         //     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // for cross-site
//         //     maxAge: 24 * 60 * 60 * 1000, // 1 days
//         //     path: '/',
//         // });

//         res.status(200).json({
//             status:"success",
//             message: "Login successful",
//             user: FindUser.email,
//             token: token
//         });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });

//     }
// }

const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, role: "admin" }); // Only allow admin login

        if (!user) {
            return res.status(404).json({ error: "Admin user not found" });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        /* ===============================
           🔒 REMOVE ALL OLD TOKENS
           =============================== */
        user.tokens = [];

        /* ===============================
           🔐 CREATE NEW ADMIN TOKEN
           =============================== */
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        user.tokens.push(token);
        await user.save();

        const isProduction = process.env.NODE_ENV === "production";
        
        // Set dedicated admin_token cookie (isolated from storefront user auth)
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            path: '/',
        });
        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
        });

        res.status(200).json({
            status: "success",
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                name: user.name || "Administrator",
                role: user.role,
            },
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
};

const signup = async (req, res) => {
    const { name, email, password, cnfPassword, role } = req.body;
    try {
        if (password !== cnfPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS || "10"));
        const newUser = new User({ name, email, role: role || "admin", password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Admin registered successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const signout = async (req, res) => {
    const token = req.token || req.cookies?.admin_token || req.cookies?.adminToken;
    const userEmail = req.user?.email;

    try {
        if (userEmail) {
            const FindUser = await User.findOne({ email: userEmail });
            if (FindUser && token) {
                FindUser.tokens = FindUser.tokens.filter(t => t !== token && t?.token !== token);
                await FindUser.save();
            }
        }
    } catch (error) {
        console.error("Error during admin signout:", error);
    }

    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie('admin_token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
    });
    res.clearCookie('adminToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
    });

    res.status(200).json({ status: "success", response: "success", type: "signout" });
};

const checkAuth = async (req, res) => {
    const { email } = req.user;
    try {
        const FindUser = await User.findOne({ email, role: "admin" });
        if (!FindUser) return res.status(404).json({ error: "Admin not found" });

        res.status(200).json({
            status: "success",
            message: "Authenticated",
            isAuthenticated: true,
            user: {
                id: FindUser._id,
                email: FindUser.email,
                name: FindUser.name || "Administrator",
                role: FindUser.role,
            }
        });
    } catch (error) {
        res.status(500).json({ status: "failed", message: "error in admin authentication" });
    }
};

module.exports = { signin, signup, checkAuth, signout };