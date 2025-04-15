

// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   otp: String,             // OTP stored temporarily
//   otpExpires: Date,        // Expiration time for OTP
//   isVerified: { type: Boolean, default: false },
//   resetPasswordToken: { type: String },
//   resetPasswordExpires: { type: Date },  
// });

// const User = mongoose.model('User', userSchema);

// export default User;

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  otp: String,             // OTP stored temporarily
  otpExpires: Date,        // Expiration time for OTP
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  resetPasswordToken: { 
    type: String 
  },
  resetPasswordExpires: { 
    type: Date 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate userId
userSchema.pre('save', async function(next) {
  // Only generate userId if it's a new user
  if (this.isNew) {
    // Extract domain from email
    const emailParts = this.email.split('@');
    const domain = emailParts[1].split('.')[0];
    
    // Generate base for userId using first letter of first name, first letter of last name, and domain
    const baseId = `${this.firstName.charAt(0)}${this.lastName.charAt(0)}-${domain}`.toUpperCase();
    
    // Find the count of existing users with similar userId pattern
    const count = await mongoose.models.User.countDocuments({
      userId: new RegExp(`^${baseId}`)
    });
    
    // Create userId with sequential number
    this.userId = `${baseId}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;




