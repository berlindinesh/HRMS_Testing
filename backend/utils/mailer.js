import nodemailer from "nodemailer";
import dns from "dns";
import dotenv from "dotenv";
dotenv.config();
 
// Force DNS to resolve to IPv4 addresses only
dns.setDefaultResultOrder("ipv4first");
 
console.log("User:", process.env.USER);
console.log("Pass:", process.env.PASS);
 
 
 
export const sendOnboardingEmail = async (
  email,
  { name, jobPosition, joiningDate }
) => {
  const mailOptions = {
    from: process.env.USER,
    to: email,
    subject: "Welcome to DB4Cloud Technologies!",
    html: `
      <h2>Welcome ${name}!</h2>
      <p>We're excited to have you join our team as ${jobPosition}.</p>
      <p>Your joining date is confirmed for ${joiningDate}.</p>
      <p>Please complete your onboarding tasks and documentation before the joining date.</p>
      <br>
      <p>Best regards,</p>
      <p>HR Team</p>
    `,
  };
 
  return await transporter.sendMail(mailOptions);
};
 
 
    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: process.env.USER,
    //         pass: process.env.PASS
    //     }
    // });
 
    // export const sendResetEmail = async (email) => {
    //     const mailOptions = {
    //         from: process.env.USER,
    //         to: email,
    //         subject: "Reset Your Password",
    //         html: `
    //             <div style="padding: 20px; background: #f5f5f5;">
    //                 <h2>Password Reset Request</h2>
    //                 <p>Click the link below to reset your password:</p>
    //                 <a href="http://localhost:3000/reset-password"
    //                style="background: #4CAF50;
    //                           color: white;
    //                           padding: 10px 20px;
    //                           text-decoration: none;
    //                           border-radius: 4px;">
    //                     Reset Password
    //                 </a>
    //             </div>
    //         `
    //     };
 
    //     return await transporter.sendMail(mailOptions);
    // };
 
 
// export const sendOtpEmail = async (email, otp) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.USER,
//       pass: process.env.PASS,
//     },
//   });
 
//   const mailOptions = {
//     from: `"Support Team" <${process.env.USER}>`,
//     to: email,
//     subject: "OTP for Registration",
//     html: `<p>Your OTP for registration is <b>${otp}</b>. This OTP is valid for 10 minutes.</p>`,
//   };
 
//   await transporter.sendMail(mailOptions);
// };
 
 
 
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true,
//   auth: {
//       user: process.env.USER,
//       pass: process.env.PASS
//   }
// });
 
// export const sendResetEmail = async (email) => {
//   const mailOptions = {
//       from: process.env.USER,
//       to: email,
//       subject: "Reset Your Password - DB4Cloud",
//       html: `
//           <div style="padding: 20px; background: #f5f5f5;">
//               <h2>Password Reset Request</h2>
//               <p>Click the link below to reset your password:</p>
//               <a href="http://localhost:3000/reset-password"
//                  style="background: #4CAF50;
//                         color: white;
//                         padding: 10px 20px;
//                         text-decoration: none;
//                         display: inline-block;
//                         margin: 20px 0;
//                         border-radius: 4px;">
//                   Reset Password
//               </a>
//               <p>If you didn't request this, please ignore this email.</p>
//           </div>
//       `
//   };
 
//   return await transporter.sendMail(mailOptions);
// };
 
 
 
 
 
 
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service provider
  auth: {
    user: process.env.USER, // Your email
    pass: process.env.PASS // Your email password or app password
  }
});
 
// Function to send OTP email
export const sendOtpEmail = async (email, otp) => {
  const verifyLink = `${process.env.CLIENT_URL}/verify?email=${email}&otp=${otp}`;
 
  const mailOptions = {
    from: '"process.env.USER',
    to: email,
    subject: 'OTP Verification',
    html: `
      <p>Thank you for registering with us. Please use the OTP below to verify your email:</p>
      <h3>${otp}</h3>
      <p>This OTP will expire in 10 minutes.</p>
    `
  };
 
  await transporter.sendMail(mailOptions);
};
// Function to send password reset email
export const sendResetEmail = async (email, resetToken) => {
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
   
    const mailOptions = {
        from: process.env.USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <h2>Password Reset Request</h2>
            <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    };
 
    await transporter.sendMail(mailOptions);
};