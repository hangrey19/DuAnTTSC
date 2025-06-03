const mongoose = require("mongoose");
const User = require("../models/User");
const Classroom = require("../models/Classroom");
const Submission = require("../models/Submission");

const createDefaultSubmissionForEveryHomeworkInClass = async (
  code,
  studentId
) => {
  const result = await Classroom.findOne({ code: code }, "topicHomework");
  const markDone = false;
  const attachedFiles = [];
  for (let i = 0; i < result.topicHomework.length; i++) {
    const topic = result.topicHomework[i];
    for (let j = 0; j < topic.homeworks.length; j++) {
      const homeworkId = topic.homeworks[j];
      const newSubmission = new Submission({
        homeworkId,
        studentId,
        markDone,
        attachedFiles,
      });
      await newSubmission.save();
    }
  }
};

const convertToArray = (topicHomework) => {
  let res = [];
  const n = topicHomework.length;
  for (let i = 0; i < n; i++) {
    res = res.concat(topicHomework[i].homeworks);
  }
  return res;
};

const deleteSubmissionsOfStudentInClass = async (studentId, classroomId) => {
  const result = await Classroom.findOne({ _id: classroomId }, "topicHomework");
  const homeworks = convertToArray(result.topicHomework);
  // Xoá submission trong DB
  await Submission.deleteMany({
    studentId: studentId,
    homeworkId: { $in: homeworks },
  });
};

class ClassroomController {
  get = async (req, res) => {
    try {
      const classroom = await Classroom.findById(
        req.params.classroomId,
        "name code description listStudent teacherId numberOfMember topicDocument.topic topicHomework.topic"
      );
      res.json({ success: true, classroom });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Lỗi rồi :(",
      });
    }
  };

  create = async (req, res) => {
    const { name, description } = req.body;
    try {
      let checkDuplicateNameClassroom = await Classroom.findOne({
        name,
        teacherId: req.userId,
      });

      if (checkDuplicateNameClassroom) {
        throw new Error("Tên lớp học bị trùng");
      }

      let code = Math.random().toString(36).substring(2, 8);
      while (await Classroom.findOne({ code: code })) {
        code = Math.random().toString(36).substring(2, 8);
      }

      const numberOfMember = 1;
      const topicDocument = [];
      const topicHomework = [];
      const newClassroom = new Classroom({
        name,
        code,
        description,
        teacherId: req.userId,
        numberOfMember,
        topicDocument,
        topicHomework,
      });
      const result = await newClassroom.save();
      res.json({
        success: true,
        message: "Tạo lớp học thành công",
        classroom: newClassroom,
      });

      await User.findOneAndUpdate(
        { _id: req.userId },
        { $push: { classTeacher: result._id } }
      );
    } catch (error) {
      if (error.message)
        res.status(400).json({
          success: false,
          message: error.message,
        });
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Lỗi rồi :(",
      });
    }
  };

  update = async (req, res) => {
    const { name, description } = req.body;

    try {
      if (name) {
        let checkDuplicateNameClassroom = await Classroom.findOne({
          name,
          teacherId: req.userId,
        });

        if (
          checkDuplicateNameClassroom &&
          checkDuplicateNameClassroom._id.toString() !== req.params.classroomId
        ) {
          throw new Error("Tên lớp học bị trùng");
        }
      }

      const classroomUpdateCondition = {
        _id: req.params.classroomId,
        teacherId: req.userId,
      };

      let updatedClassroom = await Classroom.findOneAndUpdate(
        classroomUpdateCondition,
        {
          name,
          description,
        },
        { new: true }
      );

      if (!updatedClassroom) {
        throw new Error("Bạn không có quyền chỉnh sửa thông tin lớp này");
      }

      res.json({
        success: true,
        message: "Cập nhật thông tin lớp thành công",
        classroom: updatedClassroom,
      });
    } catch (error) {
      if (error.message)
        res.status(400).json({
          success: false,
          message: error.message,
        });

      console.log(error);
      res.status(500).json({
        success: false,
        message: "Lỗi rồi :(",
      });
    }
  };

  delete = async (req, res) => {
    try {
      const classroomDeleteCondition = {
        _id: req.params.classroomId,
        teacherId: req.userId,
      };

      const deleteClassroom = await Classroom.findOne(
        classroomDeleteCondition
      ).lean();

      if (!deleteClassroom) {
        throw new Error("Bạn không có quyền xóa lớp này");
      }

      // Xóa classroom id khỏi user
      let teacher = await User.findOne({ _id: deleteClassroom.teacherId });
      teacher.classTeacher.pull({ _id: req.params.classroomId });
      await teacher.save();

      for (let studentId of deleteClassroom.listStudent) {
        let student = await User.findOne({ _id: studentId });
        student.classStudent.pull({ _id: req.params.classroomId });
        await student.save();
      }

      // Xóa các submission liên quan
      const homeworks = convertToArray(deleteClassroom.topicHomework);
      await Submission.deleteMany({ homeworkId: { $in: homeworks } });

      await Classroom.deleteOne({ _id: req.params.classroomId });
      res.json({
        success: true,
        message: "Xóa lớp thành công",
        classroom: deleteClassroom,
      });
    } catch (error) {
      if (error.message)
        res.status(400).json({
          success: false,
          message: error.message,
        });
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Lỗi rồi :(",
      });
    }
  };

  join = async (req, res) => {
    const { code } = req.body;
    try {
      let updatedClassroom = await Classroom.findOne({ code: code });

      if (!updatedClassroom) {
        throw new Error("Không tìm thấy lớp học này");
      }

      if (
        updatedClassroom.teacherId.toString() === req.userId ||
        updatedClassroom.listStudent.includes(req.userId)
      ) {
        throw new Error("Người dùng đã tham gia lớp này");
      }

      updatedClassroom.listStudent.push(req.userId);
      updatedClassroom.numberOfMember += 1;
      await updatedClassroom.save();

      let updatedMember = await User.findOne({ _id: req.userId });
      updatedMember.classStudent.push(updatedClassroom._id);
      await updatedMember.save();

      await createDefaultSubmissionForEveryHomeworkInClass(code, req.userId);

      res.json({
        success: true,
        message: "Tham gia lớp học thành công",
        classroom: updatedClassroom,
      });
    } catch (error) {
      if (error.message)
        res.status(400).json({
          success: false,
          message: error.message,
        });
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Lỗi rồi :(",
      });
    }
  };

  removeStudent = async (req, res) => {
    const { studentId } = req.body;

    try {
      const classroomUpdateCondition = {
        _id: req.params.classroomId,
        teacherId: req.userId,
      };

      let updatedClassroom = await Classroom.findOne(classroomUpdateCondition);

      if (!updatedClassroom) {
        throw new Error("Bạn không có quyền xóa học sinh");
      }
      if (!updatedClassroom.listStudent.includes(studentId)) {
        throw new Error("Học sinh này không có trong lớp");
      }
      updatedClassroom.listStudent.pull(studentId);

      updatedClassroom.numberOfMember -= 1;
      await updatedClassroom.save();

      let student = await User.findOne({ _id: studentId });
      student.classStudent.pull(updatedClassroom._id);
      await student.save();

      await deleteSubmissionsOfStudentInClass(studentId, updatedClassroom._id);

      res.json({
        success: true,
        message: "Xóa học sinh thành công",
        classroom: updatedClassroom,
      });
    } catch (error) {
      if (error.message)
        res.status(400).json({
          success: false,
          message: error.message,
        });
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Lỗi rồi :(",
      });
    }
  };

  leaveClassroom = async (req, res) => {
    try {
      const classroomId = req.params.classroomId;
      const studentId = req.userId;

      // Tìm lớp học
      let classroom = await Classroom.findOne({ _id: classroomId });

      if (!classroom) {
        throw new Error("Không tìm thấy lớp học này");
      }

      // Kiểm tra user có phải là teacher của lớp không
      if (classroom.teacherId.toString() === studentId) {
        throw new Error("Giáo viên không thể rời khỏi lớp học của chính mình");
      }

      // Kiểm tra user có trong lớp không
      if (!classroom.listStudent.includes(studentId)) {
        throw new Error("Bạn không có trong lớp học này");
      }

      // Xóa student khỏi lớp
      classroom.listStudent.pull(studentId);
      classroom.numberOfMember -= 1;
      await classroom.save();

      // Xóa lớp khỏi danh sách classStudent của user
      let student = await User.findOne({ _id: studentId });
      student.classStudent.pull(classroomId);
      await student.save();

      // Xóa tất cả submission của student trong lớp này
      await deleteSubmissionsOfStudentInClass(studentId, classroomId);

      res.json({
        success: true,
        message: "Rời lớp học thành công",
        classroom: classroom,
      });
    } catch (error) {
      if (error.message)
        res.status(400).json({
          success: false,
          message: error.message,
        });
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Lỗi rồi :(",
      });
    }
  };

  people = async (req, res) => {
    try {
      const classroom = await Classroom.findById(
        req.params.classroomId,
        "name teacherId listStudent"
      )
        .populate({
          path: "teacherId",
          select: "fullName username email phoneNumber avatarUrl",
        })
        .populate({
          path: "listStudent",
          select: "fullName username email phoneNumber avatarUrl",
        });

      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy lớp học",
        });
      }

      res.json({
        success: true,
        classroom: classroom,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  };

  inviteStudent = async (req, res) => {
    const { username } = req.body;

    try {
      // Tìm user theo username
      const student = await User.findOne({ username: username });
      if (!student) {
        throw new Error("Không tìm thấy người dùng với username này");
      }

      // Kiểm tra quyền teacher
      const classroom = await Classroom.findOne({
        _id: req.params.classroomId,
        teacherId: req.userId,
      });

      if (!classroom) {
        throw new Error("Bạn không có quyền mời học sinh vào lớp này");
      }

      // Kiểm tra xem user đã trong lớp chưa
      if (
        classroom.teacherId.toString() === student._id.toString() ||
        classroom.listStudent.includes(student._id)
      ) {
        throw new Error("Người dùng đã tham gia lớp này");
      }

      // Thêm student vào lớp
      classroom.listStudent.push(student._id);
      classroom.numberOfMember += 1;
      await classroom.save();

      // Thêm lớp vào classStudent của user
      student.classStudent.push(classroom._id);
      await student.save();

      // Tạo submission mặc định cho tất cả homework trong lớp
      await createDefaultSubmissionForEveryHomeworkInClass(
        classroom.code,
        student._id
      );

      res.json({
        success: true,
        message: `Đã mời ${student.fullName} vào lớp thành công`,
        classroom: classroom,
      });
    } catch (error) {
      if (error.message)
        res.status(400).json({
          success: false,
          message: error.message,
        });
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  };
}

module.exports = new ClassroomController();
