const db = require('../database/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { addMinutes, generateOTP } = require('../utils/otp');
const { success, error } = require('../utils/response');
const sendMail = require('../utils/mailer');
const { generateToken } = require('../utils/jwt');

/* ========================= SIGNUP ========================= */
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return error(res, 400, 'All fields are required');

        const [existing] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length)
            return error(res, 409, 'Email already registered');

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();

        await db.query(
            `INSERT INTO users 
       (name, email, password, verification_otp, otp_expires_at)
       VALUES (?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, otp, addMinutes(10)]
        );

        // Send OTP email
        const mailSent = await sendMail({
            to: email,
            subject: 'Verify Your Email - BalanceFlow',
            html: `<p>Hello ${name},</p>
             <p>Your OTP for email verification is: <b>${otp}</b></p>
             <p>This OTP will expire in 10 minutes.</p>`,
        });

        if (!mailSent) {
            return error(res, 500, 'Failed to send verification email. Check is email valid');
        }

        return success(res, 200, 'Signup successful. OTP sent.');
    } catch (err) {
        console.error('Signup Error:', err);
        return error(res, 500, 'Internal server error');
    }
};


/* ========================= VERIFY OTP ========================= */
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp)
            return error(res, 400, "Email and OTP are required");

        const [users] = await db.query(
            `SELECT id, email, name 
       FROM users
       WHERE email = ?
         AND verification_otp = ?
         AND otp_expires_at > NOW()`,
            [email, otp]
        );

        if (!users.length)
            return error(res, 400, "Invalid or expired OTP");

        const user = users[0];

        // ✅ Mark verified + clear OTP
        await db.query(
            `UPDATE users
       SET is_verified = 1,
           verification_otp = NULL,
           otp_expires_at = NULL
       WHERE email = ?`,
            [email]
        );

        // 🔑 Generate JWT token
        const token = generateToken({
            id: user.id,
            email: user.email,
            name: user.name,
        });

        // ✅ Send user + token
        return success(res, 200, "Account verified successfully", {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (err) {
        console.error("Verify OTP Error:", err);
        return error(res, 500, "Internal server error");
    }
};

/* ========================= RESEND OTP ========================= */
exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email)
            return error(res, 400, 'Email is required');

        const otp = generateOTP();
        const expiry = addMinutes(10);

        // Update OTP in database
        const [result] = await db.query(
            `UPDATE users 
             SET verification_otp = ?, otp_expires_at = ?
             WHERE email = ?`,
            [otp, expiry, email]
        );

        if (!result.affectedRows)
            return error(res, 404, 'User not found');

        // Send OTP email
        const mailSent = await sendMail({
            to: email,
            subject: 'Your OTP Code - BalanceFlow',
            html: `<p>Hello,</p>
                   <p>Your OTP for email verification is: <b>${otp}</b></p>
                   <p>This OTP will expire in 10 minutes.</p>`,
        });

        if (!mailSent) {
            return error(res, 500, 'Failed to send OTP email. Check if the email is valid.');
        }

        return success(res, 200, 'OTP resent successfully. Check your email.');
    } catch (err) {
        console.error('Resend OTP Error:', err);
        return error(res, 500, 'Internal server error');
    }
};

/* ========================= LOGIN ========================= */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);

        if (!email || !password)
            return error(res, 400, 'Email and password required');

        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (!users.length)
            return error(res, 401, 'Invalid credentials');

        const user = users[0];

        if (!user.password)
            return error(res, 400, 'Use Google login');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return error(res, 401, 'Invalid credentials');

        if (!user.is_verified) {
            // Generate OTP
            const otp = generateOTP();
            const otpExpiry = addMinutes(10);

            // Save OTP to database
            await db.query(
                `UPDATE users SET verification_otp = ?, otp_expires_at = ? WHERE email = ?`,
                [otp, otpExpiry, email]
            );

            // Send OTP email
            await sendMail(
                {
                    to: email,
                    subject: 'Verify your account',
                    html: `Your verification code is: ${otp}`
                }
            );

            return error(res, 403, 'Account not verified. OTP sent to your email.');
        }

        // ✅ Generate JWT
        const token = generateToken({
            id: user.id,
            email: user.email,
            name: user.name, // if you have roles
        });

        // Successful login
        return success(res, 200, 'Login successful', {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        return error(res, 500, 'Internal server error');
    }
};

/* ========================= GET LOGGED-IN USER ========================= */
exports.getMe = async (req, res) => {
    try {
        const userId = req.user.id;

        const [users] = await db.query(
            `SELECT id, name, email, is_verified, created_at, updated_at
             FROM users
             WHERE id = ?`,
            [userId]
        );

        if (!users.length)
            return error(res, 404, 'User not found');

        const user = users[0];

        return success(res, 200, 'User details fetched successfully', user);
    } catch (err) {
        console.error('Get Logged-In User Error:', err);
        return error(res, 500, 'Internal server error');
    }
}

/* ========================= GOOGLE LOGIN ========================= */
exports.googleLogin = async (req, res) => {
    try {
        const { googleId, email, name } = req.body;

        if (!googleId || !email)
            return error(res, 400, 'Invalid Google data');

        const [users] = await db.query(
            'SELECT id FROM users WHERE google_id = ?',
            [googleId]
        );

        if (!users.length) {
            await db.query(
                `INSERT INTO users (name, email, google_id, is_verified)
         VALUES (?, ?, ?, 1)`,
                [name, email, googleId]
            );
        }

        return success(res, 'Google login successful');
    } catch (err) {
        console.error('Google Login Error:', err);
        return error(res, 500, 'Internal server error');
    }
};

/* ========================= FORGOT PASSWORD ========================= */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email)
            return error(res, 400, 'Email is required');

        const token = crypto.randomBytes(32).toString('hex');

        const [result] = await db.query(
            `UPDATE users 
       SET reset_token = ?, reset_expires_at = ?
       WHERE email = ?`,
            [token, addMinutes(15), email]
        );

        if (!result.affectedRows)
            return error(res, 404, 'User not found');

        return success(res, 'Reset link sent', { token });
    } catch (err) {
        console.error('Forgot Password Error:', err);
        return error(res, 500, 'Internal server error');
    }
};

/* ========================= RESET PASSWORD ========================= */
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword)
            return error(res, 400, 'Invalid request');

        const [users] = await db.query(
            `SELECT id FROM users 
       WHERE reset_token = ? AND reset_expires_at > NOW()`,
            [token]
        );

        if (!users.length)
            return error(res, 400, 'Invalid or expired token');

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query(
            `UPDATE users 
       SET password = ?, reset_token = NULL, reset_expires_at = NULL
       WHERE reset_token = ?`,
            [hashedPassword, token]
        );

        return success(res, 'Password updated successfully');
    } catch (err) {
        console.error('Reset Password Error:', err);
        return error(res, 500, 'Internal server error');
    }
};

/* ========================= CHANGE PASSWORD ========================= */
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            current_password,
            new_password,
            new_password_confirmation
        } = req.body;

        // Validation
        if (!current_password || !new_password || !new_password_confirmation)
            return error(res, 400, 'All fields are required');

        if (new_password !== new_password_confirmation)
            return error(res, 400, 'New password confirmation does not match');

        if (current_password === new_password)
            return error(res, 400, 'New password must be different from current password');

        // Fetch current password hash
        const [users] = await db.query(
            `SELECT password FROM users WHERE id = ?`,
            [userId]
        );

        if (!users.length)
            return error(res, 404, 'User not found');

        // Verify current password
        const isMatch = await bcrypt.compare(
            current_password,
            users[0].password
        );

        if (!isMatch)
            return error(res, 400, 'Current password is incorrect');

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password
        await db.query(
            `UPDATE users SET password = ? WHERE id = ?`,
            [hashedPassword, userId]
        );

        return success(res, 'Password changed successfully');
    } catch (err) {
        console.error('Change Password Error:', err);
        return error(res, 500, 'Internal server error');
    }
};
