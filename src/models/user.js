const mongoose = require("mongoose");
const validate = require("validator");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

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
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// virtual properties, relationship between user & tasks
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

/* NOTE: no arrow functions here because we need to access this on user object */
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bycrypt.hash(user.password, hashRounds);
  }
  next();
});

// Delete user tasks when user is deleted
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user.id });
  next();
});

// model methods
userSchema.statics.findByCredentials = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Unable to login");

  const isPasswordMatch = await bycrypt.compare(password, user.password);
  if (!isPasswordMatch) throw new Error("Unable to login");

  return user;
};

// instance methods
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "secret");
  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// toJSON special method to returns filtered properties from object
userSchema.methods.toJSON = function () {
  const user = this;
  const publicUser = user.toObject();
  delete publicUser.password;
  delete publicUser.tokens;
  return publicUser;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
