const router = require("express").Router();

const submissionController = require("../controllers/SubmissionController");
const auth = require("../middleware/auth");

// Remove multer since we're using Google Drive links instead of file uploads
// const multer = require("multer");
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });
// const upload = multer({
//   storage: storage,
// });

// Updated to use JSON data instead of file upload
router.post("/submitSubmission", auth, submissionController.submitSubmission);
router.post("/getSubmission", auth, submissionController.getSubmission);
router.post("/addScore", auth, submissionController.addCommentAndScore);
router.post(
  "/getAllSubmissionMetadataOfHomework",
  auth,
  submissionController.getAllSubmissionMetadataOfHomework
);
router.post("/deleteSubmission", auth, submissionController.deleteSubmission);
router.post(
  "/getAllScoreOf1Class",
  auth,
  submissionController.getAllScoreOf1Class
);
module.exports = router;
