const express = require("express");
const User = require("../models/user");
const router = new express.Router();

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save(user);
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.stutus(500).send();
  }
});

router.get("/users/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findById(_id);
    if (!user) return res.status(404).send();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/users/:id", async (req, res) => {
  const userKeys = Object.keys(req.body);
  const allowedUpdates = ["name", "password", "email", "age"];
  const isValidUpdate = userKeys.every((key) => {
    return allowedUpdates.includes(key);
  });
  if (!isValidUpdate)
    return res.status(400).send({ error: "Invalid user data" });

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send();

    userKeys.forEach((key) => (user[key] = req.body[key]));
    await user.save();
    /* direct updates bypass middlewares
     const user = await User.findByIdAndUpdate(req.params.id, req.body, {
       new: true,
       runValidators: true,
     });
    */
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/users/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findByIdAndDelete(_id);
    if (!user) return res.status(404).send();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredentials({
      email: req.body.email,
      password: req.body.password,
    });
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
