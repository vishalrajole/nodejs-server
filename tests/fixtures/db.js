const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../src/models/user");
const Task = require("../../src/models/task");

const mockedUserId = new mongoose.Types.ObjectId();
const mockedUserTwoId = new mongoose.Types.ObjectId();

const mockedUser = {
  _id: mockedUserId,
  name: "mockedTest",
  email: "mockedTest@test.com",
  password: "test@123",
  tokens: [
    {
      token: jwt.sign({ _id: mockedUserId }, process.env.JWT_SECRET),
    },
  ],
};

const mockedUserTwo = {
  _id: mockedUserTwoId,
  name: "mockedUser2",
  email: "mockedUser2@test.com",
  password: "test@123",
  tokens: [
    {
      token: jwt.sign({ _id: mockedUserTwoId }, process.env.JWT_SECRET),
    },
  ],
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "Task one",
  completed: false,
  owner: mockedUserId,
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "Task two",
  completed: true,
  owner: mockedUserTwoId,
};

const configureDB = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(mockedUser).save();
  await new User(mockedUserTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
};

module.exports = {
  configureDB,
  mockedUser,
  mockedUserId,
  mockedUserTwo,
  mockedUserTwoId,
  taskOne,
  taskTwo,
};
