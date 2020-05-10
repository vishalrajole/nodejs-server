const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { mockedUserId, mockedUser, configureDB } = require("./fixtures/db");

beforeEach(configureDB);

test("should signup a new user", async () => {
  const response = await request(app)
    .post("/user")
    .send({
      name: "test",
      email: "test@test.com",
      password: "testPass",
    })
    .expect(201);

  // asert that database was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: "test",
      email: "test@test.com",
    },
    token: user.tokens[0].token,
  });

  // assert for plain password not stored in database
  expect(user.password).not.toBe("testPass");
});

test("should not signup new user if data is not correct", async () => {
  await request(app)
    .post("/user")
    .send({
      name: "test",
      email: "test@test.com",
      password: "test",
    })
    .expect(400);
});

test("should login existing user", async () => {
  const response = await request(app)
    .post("/user/login")
    .send({
      email: mockedUser.email,
      password: mockedUser.password,
    })
    .expect(200);

  //asert for tokens present in tokens array
  const user = await User.findById(mockedUserId);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test("should fail login for non existing user", async () => {
  await request(app)
    .post("/user/login")
    .send({
      email: mockedUser.email,
      password: "nonpassword",
    })
    .expect(400);
});

test("should get profile for logged in user", async () => {
  await request(app)
    .get("/user-profile")
    .set("Authorization", `Bearer ${mockedUser.tokens[0].token}`)
    .send()
    .expect(200);
});

test("should not get profile for unauthenticated user", async () => {
  await request(app).get("/user-profile").send().expect(401);
});

test("should delete user for logged in user", async () => {
  const response = await request(app)
    .delete("/user")
    .set("Authorization", `Bearer ${mockedUser.tokens[0].token}`)
    .send()
    .expect(200);

  // assert user is removed from database
  const user = await User.findById(mockedUserId);
  expect(user).toBeNull();
});

test("should not delete user for unauthenticated user", async () => {
  await request(app).delete("/user").send().expect(401);
});

test("should upload avatar image for user", async () => {
  await request(app)
    .post("/user/avatar")
    .set("Authorization", `Bearer ${mockedUser.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/test.jpg")
    .expect(200);

  const user = await User.findById(mockedUserId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("should update valid user field", async () => {
  await request(app)
    .patch("/user")
    .set("Authorization", `Bearer ${mockedUser.tokens[0].token}`)
    .send({
      name: "Test2",
    })
    .expect(200);

  const user = await User.findById(mockedUserId);
  expect(user.name).toBe("Test2");
});

test("should not update invalid user field", async () => {
  await request(app)
    .patch("/user")
    .set("Authorization", `Bearer ${mockedUser.tokens[0].token}`)
    .send({
      surname: "Test2",
    })
    .expect(400);

  const user = await User.findById(mockedUserId);
  expect(user.name).toBe("mockedTest");
});
