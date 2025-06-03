const authorizeRoute = require("./authorize.route.js");
const userRoute = require("./user.route.js");
const documentRoute = require("./document.route.js");
const homeworkRoute = require("./homework.route.js");
const auth = require("../middleware/auth");
const classroomRoute = require("./classroom.route.js");
// const commentRoute = require("./comment.route");
const submissionRoute = require("./submission.route.js");
// const todoRoute = require('./todo.route')
const accessClassroom = require("../middleware/accessClassroom");

function route(app) {
  app.use("/api/authorize", authorizeRoute);
  app.use("/api/user", userRoute);
  app.use("/api/document", documentRoute);
  app.use("/api/homework", homeworkRoute);
  app.use("/api/submission", submissionRoute);
  // app.use('/api/todo', todoRoute)

  app.use("/api/classroom", auth, classroomRoute);
}

module.exports = route;
