// import mongoose from 'mongoose';

// const questionSchema = new mongoose.Schema({
//   avatar: {
//     type: String,
//     required: true,
//   },
//   question: {
//     type: String,
//     required: true,
//   },
//   type: {
//     type: String,
//     required: true,
//   },
// });

// const templateSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   questions: [questionSchema],
// });

// const Template = mongoose.model('Template', templateSchema);

// export default Template;

import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  avatar: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  // Employee reference fields
  employeeId: {
    type: String,
  },
  employeeName: {
    type: String,
  },
  employeeDepartment: {
    type: String,
  },
  employeeDesignation: {
    type: String,
  },
});

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  questions: [questionSchema],
});

const Template = mongoose.model('Template', templateSchema);

export default Template;
