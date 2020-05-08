const mongoose = require("mongoose");
const validate = require("validator");
const bycrypt = require("bcryptjs");

const hashRounds = 8;
const userSchema = new mongoose.Schema({
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
    unique: true,
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

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bycrypt.hash(user.password, hashRounds);
  }
  next();
});

userSchema.statics.findByCredentials = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Unable to login");

  const isPasswordMatch = await bycrypt.compare(password, user.password);
  if (!isPasswordMatch) throw new Error("Unable to login");

  return user;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
