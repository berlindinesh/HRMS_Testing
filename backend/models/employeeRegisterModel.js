import mongoose from 'mongoose';

const onboardingFormSchema = new mongoose.Schema({
    Emp_ID: { 
    type: String,
    unique: true,
    // required: true,
    // default: function() {
    //   return this.constructor.generateEmployeeNumber();
    // }
    },
  registrationComplete: { type: Boolean, default: false },
  personalInfo: {
    prefix: String,
    firstName: String,
    lastName: String,
    dob: Date,
    gender: String,
    maritalStatus: String,
    bloodGroup: String,
    nationality: String,
    aadharNumber: { type: String, unique: true, spares:true },
    panNumber: { type: String, unique: true, spares:true },
    mobileNumber: { type: String, unique: true, spares:true },
    email: { type: String, unique: true , spares:true },
    employeeImage: String
  },
  addressDetails: {
    presentAddress: {
      address: String,
      city: String,
      district: String,
      state: String,
      pinCode: String,
      country: String
    },
    permanentAddress: {
      address: String,
      city: String,
      district: String,
      state: String,
      pinCode: String,
      country: String
    }
  },
  joiningDetails: {
    dateOfAppointment: Date,
    dateOfJoining: Date,
    department: String,
    initialDesignation: String,
    modeOfRecruitment: String,
    employeeType: String
  },
  educationDetails: {
    basic: [{
      education: {
        type: String,
        enum: ['10th', '12th']
      },
      institute: String,
      board: String,
      marks: Number,
      year: Number,
      grade: String,
      stream: String
    }],
    professional: [{
      education: {
        type: String,
        enum: ['UG', 'PG', 'Doctorate']
      },
      institute: String,
      board: String,
      marks: Number,
      year: Number,
      grade: String,
      stream: String
    }]
  },
  trainingStatus: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  trainingDetails: {
    trainingInIndia: [{
      type: {
        type: String,
        required: true
      },
      topic: {
        type: String,
        required: true
      },
      institute: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      },
      sponsor: {
        type: String,
        required: true
      },
      from: {
        type: Date,
        required: true
      },
      to: {
        type: Date,
        required: true
      }
    }]
  }
,  
  familyDetails: [{
    name: {
      type: String,
      required: true
    },
    relation: {
      type: String,
      required: true
    },
    dob: {
      type: Date,
      required: true
    },
    dependent: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No'
    },
    employed: {
      type: String,
      enum: ['employed', 'unemployed'],
      default: 'unemployed'
    },
    sameCompany: {
      type: Boolean,
      default: false
    },
    empCode: String,
    department: String
  }],
  
  serviceHistory: [{
    organization: String,
    dateOfJoining: Date,
    lastWorkingDay: Date,
    totalExperience: String,
    department: String
  }],
  nominationDetails: [{
    name: String,
    relation: String,
    nominationPercentage: Number,
    presentAddress: String,
    city: String,
    district: String,
    state: String,
    pinCode: String,
    phoneNumber: String
  }],

  bankInfo: ({
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    branchName: String,
    accountType: String
  }),
}, { timestamps: true });

// Define the static method
onboardingFormSchema.statics.generateEmployeeNumber = async function() {
  const latestEmployee = await this.findOne().sort({ Emp_ID: -1 });
  
  if (!latestEmployee) {
    return 'DB-0001';
  }

  const currentNumber = parseInt(latestEmployee.Emp_ID.split('-')[1]);
  const nextNumber = (currentNumber + 1).toString().padStart(4, '0');
  return `DB-${nextNumber}`;
};

// Make sure the pre-save middleware is properly defined
onboardingFormSchema.pre('save', async function(next) {
  try {
    if (!this.Emp_ID) {
      this.Emp_ID = await this.constructor.generateEmployeeNumber();
      console.log('Generated Emp_ID:', this.Emp_ID); // Add logging
    }
    next();
  } catch (error) {
    console.error('Error in pre-save middleware:', error);
    next(error);
  }
});
// Add a pre-save middleware to set the Emp_ID
onboardingFormSchema.pre('save', async function(next) {
  if (!this.Emp_ID) {
    // Use await to resolve the promise
    this.Emp_ID = await this.constructor.generateEmployeeNumber();
  }
  next();
});





const onboardingForm = mongoose.model('OnboardingForm', onboardingFormSchema);
export default onboardingForm;


// import mongoose from 'mongoose';

// const employeeRegisterSchema = new mongoose.Schema({
//   Emp_ID: { type: String, unique: true },
//   formStatus: {
//     type: String,
//     enum: ['draft', 'complete'],
//     default: 'draft'
//   },
//   personalInfo: {
//     prefix: { 
//       type: String,
//       required: true,
//       enum: ['Mr.', 'Ms.', 'Dr.']
//     },
//     firstName: { 
//       type: String, 
//       required: true,
//       trim: true 
//     },
//     middleName: { 
//       type: String,
//       trim: true 
//     },
//     lastName: { 
//       type: String, 
//       required: true,
//       trim: true 
//     },
//     dob: { 
//       type: Date,
//       required: true 
//     },
//     gender: { 
//       type: String,
//       required: true,
//       enum: ['Male', 'Female', 'Other']
//     },
//     maritalStatus: { 
//       type: String,
//       required: true,
//       enum: ['Single', 'Married', 'Divorced', 'Widowed']
//     },
//     bloodGroup: { 
//       type: String,
//       required: true,
//       enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
//     },
//     nationality: { 
//       type: String,
//       required: true,
//       trim: true
//     },
//     aadharNumber: { 
//       type: String,
//       required: true,
//       unique: true,
//       match: /^[0-9]{12}$/
//     },
//     panNumber: { 
//       type: String,
//       required: true,
//       unique: true,
//       match: /^[A-Z0-9]{10}$/
//     },
//     mobileNumber: { 
//       type: String,
//       required: true,
//       unique: true,
//       match: /^[0-9]{10}$/
//     },
//     email: { 
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       lowercase: true,
//       match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     },
//     employeeImage: { 
//       type: String,
//       required: true
//     }
//   },
  
//   addressInfo: {
//     presentAddress: {
//       type: String,
//       required: true
//     },
//     presentCity: {
//       type: String,
//       required: true
//     },
//     presentDistrict: {
//       type: String,
//       required: true
//     },
//     presentState: {
//       type: String,
//       required: true
//     },
//     presentPinCode: {
//       type: String,
//       required: true
//     },
//     presentCountry: {
//       type: String,
//       required: true
//     },
//     permanentAddress: {
//       type: String,
//       required: true
//     },
//     permanentCity: {
//       type: String,
//       required: true
//     },
//     permanentDistrict: {
//       type: String,
//       required: true
//     },
//     permanentState: {
//       type: String,
//       required: true
//     },
//     permanentPinCode: {
//       type: String,
//       required: true
//     },
//     permanentCountry: {
//       type: String,
//       required: true
//     }
//   },
//   joiningDetails: {
//     dateOfAppointment: {
//       day: String,
//       month: String,
//       year: String
//     },
//     department: {
//       type: String,
//       required: true
//     },
//     dateOfJoining: {
//       day: String,
//       month: String,
//       year: String
//     },
//     initialDesignation: {
//       type: String,
//       required: true
//     },
//     modeOfRecruitment: {
//       type: String,
//       required: true
//     },
//     employeeType: {
//       type: String,
//       required: true
//     }
//   },
  
//   educationDetails: {
//     basic: [{
//       education: String,
//       institute: String,
//       stream: String,
//       board: String,
//       marks: Number,
//       year: Number,
//       grade: String
//     }],
//     professional: [{
//       education: String,
//       institute: String,
//       stream: String,
//       board: String,
//       marks: Number,
//       year: Number,
//       grade: String
//     }],
//     trainingDetails: {
//       trainingInIndia: [{
//         type: String,
//         topic: String,
//         institute: String,
//         sponsor: String,
//         from: Date,
//         to: Date
//       }],
//       trainingAbroad: [{
//         type: String,
//         topic: String,
//         institute: String,
//         sponsor: String,
//         from: Date,
//         to: Date
//       }]
//     }
//   },
//   familyDetails: [{
//     name: String,
//     relation: String,
//     dob: Date,
//     dependent: String,
//     employed: String,
//     sameCompany: Boolean,
//     empCode: String,
//     department: String
//   }],
//   serviceHistory: [{
//     organization: String,
//     dateOfJoining: Date,
//     lastWorkingDay: Date,
//     totalExperience: String,
//     department: String
//   }],
//   nominationDetails: {
//     nominees: [{
//       name: String,
//       relation: String,
//       nominationPercentage: Number,
//       presentAddress: String,
//       city: String,
//       district: String,
//       state: String,
//       pinCode: String,
//       phoneNumber: String,
//       sameAsEmployeeAddress: Boolean
//     }]
//   },
//   lastUpdated: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.model('EmployeeRegister', employeeRegisterSchema);
