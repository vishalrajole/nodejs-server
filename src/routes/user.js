const express = require("express");
const multer = require("multer");
const sharp = require("sharp"); // image processing
const User = require("../models/user");
const { sendWelcomeMail, sendCancelationMail } = require("../utils/sendgrid");

const router = new express.Router();
const auth = require("../middlewares/auth");

const fileTypeSupported = /\.(jpg|jpeg|png)$/;

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
    sendWelcomeMail({ email: user.email, name: user.name });
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
  sendCancelationMail({ email: req.user.email, name: req.user.name });
  res.send(req.user);
});

router.get("/user/:id/avatar", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) throw new Error();

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send(error);
  }
});
const upload = multer({
  // dest: "avatar", if dest present, it will directly store file to give destination, else multer will return buffer to endpoint
  limits: {
    fileSize: 1000000, // file size in bytes
  },
  fileFilter: (req, file, callback) => {
    if (!file.originalname.match(fileTypeSupported)) {
      return callback(new Error("file type not suported"));
    }
    callback(undefined, true);
  },
});

// upload avatar image with 2 middlewares auth & upload.single
router.post(
  "/user/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const modifiedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = modifiedImageBuffer; // buffer contains file buffer data
    await req.user.save();
    res.send();
  },
  // express error handling
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/user/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

module.exports = router;
