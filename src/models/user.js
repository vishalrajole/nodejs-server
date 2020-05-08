const mongoose = require("mongoose");
const validate = require("validator");

const User = mongoose.model("User", {
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    default: 0,
    validate: (value) => {
      if (value < 0) throw new Error("Age must be a positive number");
    },
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: (value) => {
      if (!validate.isEmail(value)) throw new Error("Email is not valid");
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate: (value) => {
      if (value.toLowerCase().includes("password"))
        throw new Error("password should not contain 'password'");
    },
  },
});

module.exports = User;
