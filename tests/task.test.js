const request = require("supertest");
const app = require("../src/app");
const {
  mockedUserId,
  mockedUser,
  configureDB,
  mockedUserTwoId,
  mockedUserTwo,
  taskOne,
  taskTwo,
} = require("./fixtures/db");

const Task = require("../src/models/task");

beforeEach(configureDB);

test("should create task for logged in user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${mockedUser.tokens[0].token}`)
    .send({
      description: "task 1",
    })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toBe(false);
  expect(task.description).toBe("task 1");
});

test("should not create task for unauthorized user", async () => {
  const response = await request(app)
    .post("/tasks")
    .send({
      description: "task 1",
      completed: "false",
    })
    .expect(401);
});

test("should fetch task for authorized user", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${mockedUser.tokens[0].token}`)
    .send()
    .expect(200);

  // check for tasks length
  expect(response.body.length).toEqual(1);
});

test("should allow to delete task for authorized user only", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${mockedUser.tokens[0].token}`)
    .send()
    .expect(200);

  const task = await Task.findById(taskOne._id);
  expect(task).toBeNull();
});

test("should not allow to delete task for unauthorized user", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${mockedUserTwo.tokens[0].token}`)
    .send()
    .expect(404);

  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});
