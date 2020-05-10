- Task Manager app built with node v13.10.1, mongodb.
- Creates users with login provision
- Logged In user can create tasks, edit, delete the tasks
- User can also upload profile avatar
- sort, pagination provisioned for tasks
- Test cases written using jest & mocha
- run `npm run dev` to start local server

Make sure to create .env file with following keys

PORT=3000
SENDGRID_API_KEY=your-sendgrid-api-key
JWT_SECRET=your-jwt-secret-key
MONGO_DB_URL=mongodb://127.0.0.1:27017/task-manager
