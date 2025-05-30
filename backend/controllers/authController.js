// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';
// import nodemailer from 'nodemailer';
// import { sendOtpEmail } from '../utils/mailer.js';
// import { sendResetEmail } from '../utils/mailer.js';


// // Register User and send OTP
// export const registerAuth = async (req, res) => {
//   const { name, email, password } = req.body;
//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(409).json({ message: 'User already exists. Please try login!' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     const newUser = new User({ name, email, password: hashedPassword });
//     await newUser.save();

//     const otp = Math.floor(100000 + Math.random() * 900000);
//     const otpExpires = Date.now() + 10 * 60 * 1000;

//     newUser.otp = otp;
//     newUser.otpExpires = otpExpires;
//     await newUser.save();

//     await sendOtpEmail(email, otp);
//     res.status(200).json({ message: 'Registration successful. Please check your email for the OTP.' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error. Please try again.' });
//   }
// };

// // Login User
// export const loginAuth = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.status(200).json({ token });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error. Please try again.' });
//   }
// };


// export const forgotPassword = async (req, res) => {
//   const { email } = req.body;
//   try {
//       const user = await User.findOne({ email });
//       if (!user) {
//           return res.status(404).json({ message: 'User not found' });
//       }

//       const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
//           expiresIn: '1h' 
//       });

//       user.resetPasswordToken = resetToken;
//       user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
//       await user.save();

//       await sendResetEmail(email, resetToken);
//       res.status(200).json({ message: 'Reset link sent successfully' });
      
//   } catch (error) {
//       res.status(500).json({ message: 'Failed to send reset link' });
//   }
// };

// export const resetPassword = async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;
  
//   try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findOne({
//           _id: decoded.id,
//           resetPasswordToken: token,
//           resetPasswordExpires: { $gt: Date.now() }
//       });

//       if (!user) {
//           return res.status(400).json({ message: 'Invalid or expired token' });
//       }

//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(password, salt);
//       user.resetPasswordToken = undefined;
//       user.resetPasswordExpires = undefined;
//       await user.save();

//       res.status(200).json({ message: 'Password reset successful' });
//   } catch (error) {
//       res.status(400).json({ message: 'Invalid or expired token' });
//   }
// };

// // Add this export function for OTP verification
// export const verifyOtp = async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'User not found' });
//     }

//     // Check if OTP is valid and not expired
//     if (user.otp !== otp || user.otpExpires < Date.now()) {
//       return res.status(400).json({ message: 'Invalid or expired OTP' });
//     }

//     // OTP verified successfully, clear OTP and expiration time
//     user.otp = undefined;
//     user.otpExpires = undefined;
//     user.isVerified = true;
//     await user.save();

//     res.status(200).json({ message: 'OTP verified successfully. Registration completed.' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error. Please try again.' });
//   }
// };

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendOtpEmail, sendResetEmail } from '../utils/mailer.js';

// // Register User and send OTP
// export const registerAuth = async (req, res) => {
//   try {
//     const { firstName, middleName, lastName, name, email, password } = req.body;
    
//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(409).json({ message: 'User already exists. Please try login!' });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
    
//     // Create new user with all fields
//     const newUser = new User({
//       firstName,
//       middleName,
//       lastName,
//       name,
//       email,
//       password: hashedPassword
//     });

//     // Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000);
//     const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

//     newUser.otp = otp.toString();
//     newUser.otpExpires = otpExpires;
    
//     // Save user to database
//     await newUser.save();

//     // Send OTP email
//     await sendOtpEmail(email, otp);
    
//     res.status(200).json({ 
//       message: 'Registration successful. Please check your email for the OTP.',
//       userId: newUser.userId
//     });
//   } catch (err) {
//     console.error('Registration error:', err);
    
//     // Handle duplicate key error (usually email)
//     if (err.code === 11000) {
//       return res.status(409).json({ message: 'User already exists. Please try login!' });
//     }
    
//     // Handle validation errors
//     if (err.name === 'ValidationError') {
//       const messages = Object.values(err.errors).map(val => val.message);
//       return res.status(400).json({ message: messages.join(', ') });
//     }
    
//     res.status(500).json({ message: 'Server error. Please try again.', error: err.message });
//   }
// };

// Register User and send OTP
export const registerAuth = async (req, res) => {
  try {
    const { firstName, middleName, lastName, name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists. Please try login!' });
    }

    // Generate userId
    const emailParts = email.split('@');
    const domain = emailParts[1].split('.')[0];
    const baseId = `${firstName.charAt(0)}${lastName.charAt(0)}-${domain}`.toUpperCase();
    
    // Find the count of existing users with similar userId pattern
    const count = await User.countDocuments({
      userId: new RegExp(`^${baseId}`)
    });
    
    // Create userId with sequential number
    const userId = `${baseId}-${(count + 1).toString().padStart(4, '0')}`;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user with all fields including userId
    const newUser = new User({
      userId,
      firstName,
      middleName,
      lastName,
      name,
      email,
      password: hashedPassword
    });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    newUser.otp = otp.toString();
    newUser.otpExpires = otpExpires;
    
    // Save user to database
    await newUser.save();

    // Send OTP email
    await sendOtpEmail(email, otp);
    
    res.status(200).json({ 
      message: 'Registration successful. Please check your email for the OTP.',
      userId: newUser.userId
    });
  } catch (err) {
    console.error('Registration error:', err);
    
    // Handle duplicate key error (usually email)
    if (err.code === 11000) {
      return res.status(409).json({ message: 'User already exists. Please try login!' });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error. Please try again.', error: err.message });
  }
};

// Login User
export const loginAuth = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new OTP for unverified users
      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      user.otp = otp.toString();
      user.otpExpires = otpExpires;
      await user.save();

      // Send new OTP
      await sendOtpEmail(email, otp);
      
      return res.status(403).json({ 
        message: 'Account not verified. A new OTP has been sent to your email.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
      expiresIn: '1h' 
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendResetEmail(email, resetToken);
    res.status(200).json({ message: 'Reset link sent successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send reset link' });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if OTP is valid and not expired
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP verified successfully, clear OTP and expiration time
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    // Generate JWT token for auto-login after verification
    const token = jwt.sign(
      { 
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      message: 'OTP verified successfully. Registration completed.',
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otp = otp.toString();
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    await sendOtpEmail(email, otp);
    
    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};







