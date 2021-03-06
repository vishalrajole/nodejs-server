const express = require("express");
const Task = require("../models/task");
const router = new express.Router();
const auth = require("../middlewares/auth");

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

/* GET /tasks?completed=true&limit=10&skip=10&sort=createdAt:desc */
router.get("/tasks", auth, async (req, res) => {
  const queryParams = {};
  if (req.query.completed) {
    queryParams.completed = req.query.completed === "true";
  }

  const paginateOptions = {
    limit: parseInt(req.query.limit),
    skip: parseInt(req.query.skip),
  };

  const sortOptions = {};
  if (req.query.sort) {
    const parts = req.query.sort.split(":");
    sortOptions[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    const tasks = await req.user
      .populate({
        path: "tasks",
        match: queryParams,
        options: { ...paginateOptions, sort: sortOptions },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (error) {
    res.stutus(500).send();
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    // alternate option await req.user.populate("tasks").execPopulate();
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const taskKeys = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidUpdate = taskKeys.every((key) => {
    return allowedUpdates.includes(key);
  });
  if (!isValidUpdate)
    return res.status(400).send({ error: "Invalid task data" });

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(404).send();
    taskKeys.forEach((key) => (task[key] = req.body[key]));
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
