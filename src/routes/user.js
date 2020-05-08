const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const auth = require("../middlewares/auth");

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredentials({
      email: req.body.email,
      password: req.body.password,
    });
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.send(500).send();
  }
});

router.post("/user/logout-all", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.send(500).send();
  }
});

router.post("/user", async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken();
    await user.save(user);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/user-profile", auth, async (req, res) => {
  res.send(req.user);
});

router.patch("/user", auth, async (req, res) => {
  const userKeys = Object.keys(req.body);
  const allowedUpdates = ["name", "password", "email", "age"];
  const isValidUpdate = userKeys.every((key) => {
    return allowedUpdates.includes(key);
  });
  if (!isValidUpdate)
    return res.status(400).send({ error: "Invalid user data" });

  try {
    userKeys.forEach((key) => (req.user[key] = req.body[key]));
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/user", auth, async (req, res) => {
  await req.user.remove();
  res.send(req.user);
});

module.exports = router;
