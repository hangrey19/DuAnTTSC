const Submission = require("../models/Submission");
const Homework = require("../models/Homework");
const userController = require("./UserController");
const unitTable = ["B", "KB", "MB", "GB", "TB"];
const Classroom = require("../models/Classroom");

const isUserCanSeeSubmissionMetadataOfHomework = async (userId, homeworkId) => {
  const homework = await Homework.findOne({ _id: homeworkId }, "classroomId");
  if (!homework) return false;

  // Use consistent permission check
  return await userController.isUserATeacherOfClass(
    userId,
    homework.classroomId
  );
};

const isUserCanAddScoreToSubmission = async (userId, homeworkId, studentId) => {
  const homework = await Homework.findOne({ _id: homeworkId }, "classroomId");
  if (!homework) return false;

  // Use consistent permission check
  return await userController.isUserATeacherOfClass(
    userId,
    homework.classroomId
  );
};

const checkIfUserSubmitted = async (homeworkId, studentId) => {
  const submission = await Submission.findOne({
    homeworkId: homeworkId,
    studentId: studentId,
    markDone: true,
  });
  if (!submission) {
    return false;
  }
  return true;
};

const isUserCanSeeSubmission = async (userId, homeworkId, studentId) => {
  // Student can see their own submission
  if (userId === studentId) return true;

  // Teacher can see all submissions in their class
  const homework = await Homework.findOne({ _id: homeworkId }, "classroomId");
  if (!homework) return false;

  return await userController.isUserATeacherOfClass(
    userId,
    homework.classroomId
  );
};

const validateGoogleDriveLink = (link) => {
  if (!link) return false;
  const googleDrivePattern =
    /^https:\/\/drive\.google\.com\/(file\/d\/|open\?id=|drive\/folders\/)/;
  return googleDrivePattern.test(link);
};

getFileExtension = (filename) => {
  var i = filename.length - 1;
  while (filename[i] != ".") {
    i = i - 1;
  }
  return filename.substring(i + 1);
};

getArrayOfHomework = (topicHomework) => {
  var res = [];
  const n = topicHomework.length;
  for (let i = 0; i < n; i++) {
    res = res.concat(topicHomework[i].homeworks);
  }
  return res;
};

findHomework = (temp, homeworkId) => {
  var left = 0;
  var right = temp.length - 1;
  while (left <= right) {
    var mid = Math.round((left + right) / 2);
    if (temp[mid].homeworkId < homeworkId) {
      left = mid + 1;
    } else if (temp[mid].homeworkId > homeworkId) {
      right = mid - 1;
    } else return mid;
  }
  return null;
};

createArrayResults = (arrayHomeworks, listStudent, submissions) => {
  var res = [];
  const nStudent = listStudent.length;
  const nHomework = arrayHomeworks.length;
  for (let i = 0; i < nStudent; i++) {
    const student = {
      fullName: listStudent[i].fullName,
      studentId: listStudent[i]._id,
      avatarUrl: listStudent[i].avatarUrl,
    };
    student.scores = Array.from({ length: nHomework }, (_, i) => null);
    res.push(student);
  }
  for (let i = 0; i < submissions.length; i++) {
    const studentId = submissions[i].studentId._id;
    const homeworkId = submissions[i].homeworkId;
    for (let j = 0; j < res.length; j++) {
      if (res[j].studentId.equals(studentId)) {
        for (let t = 0; t < nHomework; t++) {
          if (arrayHomeworks[t]._id.equals(homeworkId)) {
            res[j].scores[t] = submissions[i].score;
            break;
          }
        }
        break;
      }
    }
  }
  return res;
};

class SubmissionController {
  submitSubmission = async (req, res) => {
    try {
      const studentId = req.userId;
      const homeworkId = req.body.homeworkId;
      const googleDriveLink = req.body.googleDriveLink;

      console.log("Submit submission attempt:", {
        studentId,
        homeworkId,
        googleDriveLink: googleDriveLink?.substring(0, 50) + "...",
      });

      if (
        !googleDriveLink ||
        typeof googleDriveLink !== "string" ||
        googleDriveLink.trim() === ""
      ) {
        console.log("Validation failed: Empty Google Drive link");
        return res.status(400).json({
          success: false,
          message: "Bạn phải nhập link Google Drive bài làm!",
        });
      }

      // Validate Google Drive link format
      if (!validateGoogleDriveLink(googleDriveLink)) {
        console.log("Validation failed: Invalid Google Drive link format");
        return res.status(400).json({
          success: false,
          message: "Link Google Drive không hợp lệ",
        });
      }

      // Verify homework exists
      const homework = await Homework.findOne({ _id: homeworkId });
      if (!homework) {
        console.log("Validation failed: Homework not found");
        return res.status(400).json({
          success: false,
          message: "Bài tập không tồn tại",
        });
      }

      // Check if submission exists for this student and homework
      const existingSubmission = await Submission.findOne({
        homeworkId: homeworkId,
        studentId: studentId,
      });

      console.log("Existing submission:", {
        exists: !!existingSubmission,
        markDone: existingSubmission?.markDone,
        hasFiles: existingSubmission?.attachedFiles?.length > 0,
      });

      const markDone = true;
      const attachedFiles = [googleDriveLink];

      // For Google Drive links, we don't need detailed fileAttributes
      const fileAttributes = [
        {
          name: "Google Drive Submission",
          size: "External Link",
          extension: "gdrive",
        },
      ];

      const updateResult = await Submission.updateOne(
        { homeworkId: homeworkId, studentId: studentId },
        {
          $set: {
            attachedFiles: attachedFiles,
            markDone: markDone,
            fileAttributes: fileAttributes,
            updatedAt: new Date(),
          },
        }
      );

      console.log("Update result:", updateResult);

      return res.status(200).json({
        success: true,
        message: "Nộp bài thành công!",
      });
    } catch (err) {
      console.log("Submit submission error:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  };

  getSubmission = async (req, res) => {
    try {
      const userId = req.userId; // user who want to see submission
      const homeworkId = req.body.homeworkId;
      const studentId = req.body.studentId; // the owner of submission user want to see

      // only teacher and that student can see his submission
      const isValid = await isUserCanSeeSubmission(
        userId,
        homeworkId,
        studentId
      );
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Bạn không có quyền xem bài làm này",
        });
      }

      // Maybe we dont need this because every student will have default submission
      const submission = await Submission.findOne({
        homeworkId: homeworkId,
        studentId: studentId,
      });
      if (!submission) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy bài nộp",
        });
      }

      return res.status(200).json({ success: true, submission });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  };

  addCommentAndScore = async (req, res) => {
    try {
      const score = req.body.score;
      const comment = req.body.comment || ""; // Handle optional comment
      const studentId = req.body.studentId;
      const homeworkId = req.body.homeworkId;
      const userId = req.userId;

      console.log("Add score attempt:", {
        score,
        comment,
        studentId,
        homeworkId,
        userId,
      });

      const isValid = await isUserCanAddScoreToSubmission(
        userId,
        homeworkId,
        studentId
      );
      if (!isValid) {
        console.log("Permission denied for scoring");
        return res.status(400).json({
          success: false,
          message: "Bạn không có quyền thêm điểm cho bài nộp này",
        });
      }

      // Update both score and comment
      const updateResult = await Submission.findOneAndUpdate(
        { homeworkId: homeworkId, studentId: studentId },
        {
          $set: {
            score: score,
            comment: comment,
            updatedAt: new Date(),
          },
        },
        { new: true } // Return updated document
      );

      console.log("Score update result:", {
        found: !!updateResult,
        newScore: updateResult?.score,
        newComment: updateResult?.comment,
      });

      if (!updateResult) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy bài nộp để chấm điểm",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Đã chấm điểm và nhận xét thành công",
        submission: updateResult,
      });
    } catch (err) {
      console.log("Add score error:", err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  };

  getAllSubmissionMetadataOfHomework = async (req, res) => {
    try {
      const homeworkId = req.body.homeworkId;
      const userId = req.userId;
      const isValid = await isUserCanSeeSubmissionMetadataOfHomework(
        userId,
        homeworkId
      );
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Bạn không có quyền truy cập phần này",
        });
      }
      const result = await Submission.find({ homeworkId: homeworkId }).populate(
        {
          path: "studentId",
          select: "fullName username avatarUrl",
        }
      );
      return res.status(200).json(result);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  };

  deleteSubmission = async (req, res) => {
    try {
      const studentId = req.userId;
      const homeworkId = req.body.homeworkId;

      const isOK = await checkIfUserSubmitted(homeworkId, studentId);
      if (!isOK) {
        return res.status(400).json({
          success: false,
          message: "Chưa nộp bài làm nào để xóa",
        });
      }

      // Reset submission to default state
      await Submission.updateOne(
        { studentId: studentId, homeworkId: homeworkId },
        {
          $set: {
            markDone: false,
            attachedFiles: [],
            fileAttributes: [],
            score: null,
            updatedAt: new Date(),
          },
        }
      );

      return res.status(200).json({
        success: true,
        message: "Đã xóa bài làm của bạn cho bài tập này",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  };

  getAllScoreOf1Class = async (req, res) => {
    try {
      const classroomId = req.body.classroomId;

      // get all homework of class in array
      const classroom = await Classroom.findOne(
        { _id: classroomId },
        "topicHomework listStudent"
      )
        .populate({
          path: "topicHomework.homeworks",
          select: "title createdAt",
        })
        .populate({
          path: "listStudent",
          select: "fullName avatarUrl",
        });
      const arrayHomeworks = getArrayOfHomework(classroom.topicHomework);
      const submissions = await Submission.find(
        {
          homeworkId: { $in: arrayHomeworks },
          score: { $exists: true, $ne: null },
        },
        "studentId score homeworkId"
      ).populate({
        path: "studentId",
        select: "username fullName",
      });
      const result = createArrayResults(
        arrayHomeworks,
        classroom.listStudent,
        submissions
      );
      return res.status(200).json({ arrayHomeworks, result });
    } catch (e) {
      console.log(e);
      return res.status(400).json("Lỗi rồi");
    }
  };
}

module.exports = new SubmissionController();
