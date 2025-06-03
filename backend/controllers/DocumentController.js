const Document = require("../models/Document");
const Classroom = require("../models/Classroom");
const mongoose = require("mongoose");
const userController = require("./UserController");
const unitTable = ["B", "KB", "MB", "GB", "TB"];

const saveDocumentToMongoDB = async (
  _id,
  classroomId,
  title,
  description,
  creatorId,
  attachedFiles,
  fileAttributes,
  topic,
  duplicateTopicId
) => {
  const newDocument = new Document({
    _id,
    classroomId,
    title,
    description,
    creatorId,
    attachedFiles,
    fileAttributes,
    topic,
  });
  await newDocument.save();

  // push new document to list document of class
  await Classroom.updateOne(
    { "topicDocument._id": duplicateTopicId },
    { $push: { "topicDocument.$.documents": _id } }
  );
};

const addNewTopic = async (classroomId, topic) => {
  var myId = new mongoose.Types.ObjectId();
  await Classroom.updateOne(
    { _id: classroomId },
    { $push: { topicDocument: { _id: myId, topic: topic, documents: [] } } }
  );
  return myId;
};

const checkIfDuplicate = async (classroomId, topic) => {
  /* check if topic exists in class
   * return _id of topic if yes, otherwise return null
   * return topics array used for check title in next step
   */
  const updatedClassroom = await Classroom.findOne(
    { _id: classroomId },
    "topicDocument"
  ).populate({
    path: "topicDocument.documents",
    select: "title",
  });
  const topics = updatedClassroom.topicDocument;
  var isTheLastDocumentOfTopic = false;
  var duplicateTopicId = null;
  for (let i = 0; i < topics.length; i++) {
    if (topics[i].topic === topic) {
      duplicateTopicId = topics[i]._id;
      if (topics[i].documents.length == 1) {
        isTheLastDocumentOfTopic = true;
      }
      break;
    }
  }
  return { duplicateTopicId, topics, isTheLastDocumentOfTopic };
};

const reverseDocumentIn1Topic = (topic) => {
  /* new document will be pushed at tail of array documents
   * we need to reverse documents array so new document will hoist to top of documents array
   */
  const n = topic.documents.length;
  for (let i = 0; i <= (n - 1) / 2; i++) {
    const temp = topic.documents[i];
    topic.documents[i] = topic.documents[n - 1 - i];
    topic.documents[n - 1 - i] = temp;
  }
};

const reverseTopic = (topics) => {
  /* new topic will be pushed at tail of topics array
       we need to reverse topics array so new topic will hoist to top of topics array
     */
  const n = topics.length;
  for (let i = 0; i <= (n - 1) / 2; i++) {
    const temp = topics[i];
    topics[i] = topics[n - 1 - i];
    topics[n - 1 - i] = temp;
    reverseDocumentIn1Topic(topics[i]);
    if (n > 1) reverseDocumentIn1Topic(topics[n - 1 - i]);
  }
};

const getIdOfTopic = (topics, topic) => {
  var topicId = null;
  for (let i = 0; i < topics.length; i++) {
    if (topics[i].topic === topic) {
      topicId = topics[i]._id;
      break;
    }
  }
  return topicId;
};

const checkIfDuplicateTitle = (topics, title, documentId) => {
  // check if exists another documents with same title in class
  for (let i = 0; i < topics.length; i++) {
    for (let j = 0; j < topics[i].documents.length; j++) {
      if (
        topics[i].documents[j].title === title &&
        topics[i].documents[j]._id != documentId
      ) {
        return true;
      }
    }
  }
  return false;
};

const removeDocumentOutOfTopic = async (
  duplicateTopicId,
  documentId,
  classroomId,
  isTheLastDocumentOfTopic
) => {
  if (isTheLastDocumentOfTopic) {
    await Classroom.updateOne(
      { _id: classroomId },
      { $pull: { topicDocument: { _id: duplicateTopicId } } }
    );
  } else
    await Classroom.updateOne(
      { "topicDocument._id": duplicateTopicId },
      { $pull: { "topicDocument.$.documents": documentId } }
    );
};

const getFilenameFromURL = (url) => {
  const splited = url.split("/");
  console.log(splited);
  const result = splited[splited.length - 1].split("?")[0];
  return result.replace("%20", " ");
};

const changeTopic = async (
  duplicateTopicId,
  topicId,
  topic,
  documentId,
  classroomId,
  isTheLastDocumentOfTopic
) => {
  await removeDocumentOutOfTopic(
    duplicateTopicId,
    documentId,
    classroomId,
    isTheLastDocumentOfTopic
  );
  if (!topicId) {
    topicId = await addNewTopic(classroomId, topic);
  }
  await Classroom.updateOne(
    { "topicDocument._id": topicId },
    { $push: { "topicDocument.$.documents": documentId } }
  );
};

convertSizeToProperUnit = (bytes) => {
  var i = 0;
  while (bytes >= 1024) {
    i++;
    bytes = bytes / 1024;
  }
  bytes = Math.round(bytes * 100) / 100;
  return `${bytes} ${unitTable[i]}`;
};

getFileExtension = (filename) => {
  var i = filename.length - 1;
  while (filename[i] != ".") {
    i = i - 1;
  }
  return filename.substring(i + 1);
};

class DocumentController {
  upload = async (req, res) => {
    try {
      const classroomId = req.body.classroomId;
      const title = req.body.title;
      const description = req.body.description;
      const creatorId = req.userId;
      const topic = req.body.topic;
      const googleDriveLink = req.body.googleDriveLink;

      // Only teacher of class can create document
      const isValid = await userController.isUserATeacherOfClass(
        creatorId,
        classroomId
      );
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Chỉ có giáo viên mới được đăng tài liệu",
        });
      }

      if (
        !googleDriveLink ||
        typeof googleDriveLink !== "string" ||
        googleDriveLink.trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "Bạn phải nhập link Google Drive!",
        });
      }

      // Validate Google Drive link format
      const googleDrivePattern =
        /^https:\/\/drive\.google\.com\/(file\/d\/|open\?id=|drive\/folders\/)/;
      if (!googleDrivePattern.test(googleDriveLink)) {
        return res.status(400).json({
          success: false,
          message: "Link Google Drive không hợp lệ",
        });
      }

      // Kiểm tra chủ đề và trùng tiêu đề
      let { duplicateTopicId, topics, isTheLastDocumentOfTopic } =
        await checkIfDuplicate(classroomId, topic);
      const isTitleExist = checkIfDuplicateTitle(topics, title, null);
      if (isTitleExist) {
        return res.status(400).json({
          success: false,
          message: "1 lớp không thể có 2 tài liệu cùng tên",
        });
      }
      if (!duplicateTopicId) {
        duplicateTopicId = await addNewTopic(classroomId, topic);
      }

      // Lưu link vào mảng attachedFiles
      const attachedFiles = [googleDriveLink];

      // For Google Drive links, we don't need fileAttributes since we can't get actual file size
      // The Document model expects size to be Number, so we'll leave fileAttributes empty
      const fileAttributes = [];

      // Gọi hàm lưu document vào MongoDB
      await saveDocumentToMongoDB(
        new mongoose.Types.ObjectId(),
        classroomId,
        title,
        description,
        creatorId,
        attachedFiles,
        fileAttributes,
        topic,
        duplicateTopicId
      );

      return res
        .status(200)
        .json({ success: true, message: "Tài liệu đã được lưu thành công!" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  };

  download = async (req, res) => {
    try {
      const documentId = req.body.documentId;
      const document = await Document.findOne({ _id: documentId });

      if (!document) {
        return res.status(400).json({
          success: false,
          message: "Document doesnt exist",
        });
      }

      var filename;
      if (document.attachedFiles.length > 0)
        filename = getFilenameFromURL(document.attachedFiles[0]);
      else filename = undefined;

      return res.status(200).json({ success: true, document, filename });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ success: false, message: "ERROR" });
    }
  };

  getAllDocumentMetadataOfClass = async (req, res) => {
    const classroomId = req.body.classroomId;
    const topicDocument = await Classroom.findOne(
      { _id: classroomId },
      "topicDocument"
    ).populate({
      path: "topicDocument.documents",
      select: "title createdAt fileAttributes",
    });
    const topics = topicDocument.topicDocument;
    if (topics.length === 0) {
      return res.status(200).json(topics);
    }
    reverseTopic(topics);
    return res.status(200).json(topics);
  };

  changeDocument = async (req, res) => {
    try {
      const documentId = req.body.documentId;
      const title = req.body.title;
      const description = req.body.description;
      const topic = req.body.topic;
      const userId = req.userId;

      const updatedDocument = await Document.findOne({ _id: documentId });
      if (!updatedDocument) {
        throw new Error("No document");
      }

      const classId = updatedDocument.classroomId;

      // Only teacher of class can modify document
      const isValid = await userController.isUserATeacherOfClass(
        userId,
        classId
      );
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Chỉ có giáo viên mới được sửa tài liệu",
        });
      }

      const oldTopic = updatedDocument.topic;

      var { duplicateTopicId, topics, isTheLastDocumentOfTopic } =
        await checkIfDuplicate(classId, oldTopic);
      const isTitleExist = checkIfDuplicateTitle(topics, title, documentId);
      if (isTitleExist) {
        throw new Error("2 documents have same title in 1 class");
      }

      // consider to erase this block of code
      if (!duplicateTopicId) {
        throw new Error("ERROR");
      }

      var topicId = getIdOfTopic(topics, topic);

      if (oldTopic != topic) {
        await changeTopic(
          duplicateTopicId,
          topicId,
          topic,
          documentId,
          classId,
          isTheLastDocumentOfTopic
        );
      }

      await Document.findOneAndUpdate(
        { _id: documentId },
        {
          $set: {
            title: title,
            description: description,
            topic: topic,
          },
        }
      );
      return res.status(200).json({
        success: true,
        message: "Change document successfully",
      });
    } catch (err) {
      if (err.message == "2 documents have same title in 1 class") {
        return res.status(400).json({
          success: false,
          message: "1 lớp không thể có 2 tài liệu cùng tên",
        });
      } else if (err.message === "No document") {
        return res.status(400).json({
          success: false,
          message: "Tài liệu không tồn tại hoặc đã bị xóa",
        });
      } else {
        console.log(err);
        res.status(400).json({ success: false, message: "ERROR" });
      }
    }
  };
  changeDocumentFile = async (req, res) => {
    try {
      const documentId = req.body.documentId;
      const googleDriveLink = req.body.googleDriveLink;
      const userId = req.userId;

      const updatedDocument = await Document.findOne({ _id: documentId });
      if (!updatedDocument) {
        throw new Error("No document");
      }

      // Only teacher of class can modify document file
      const isValid = await userController.isUserATeacherOfClass(
        userId,
        updatedDocument.classroomId
      );
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Chỉ có giáo viên mới được sửa tài liệu",
        });
      }

      if (!googleDriveLink) {
        throw new Error("No Google Drive link");
      }

      const attachedFiles = [googleDriveLink];
      const fileAttributes = [];

      await Document.updateOne(
        { _id: documentId },
        {
          $set: {
            attachedFiles: attachedFiles,
            fileAttributes: fileAttributes,
          },
        }
      );
      return res.status(200).json({
        success: true,
        message: "Thay đổi Google Drive link cho tài liệu thành công",
      });
    } catch (err) {
      if (err.message === "No document") {
        return res.status(400).json({
          success: false,
          message: "Tài liệu không tồn tại hoặc đã bị xóa",
        });
      } else if (err.message === "No Google Drive link") {
        return res.status(400).json({
          success: true,
          message: "Bạn không gửi Google Drive link nào cả",
        });
      } else {
        console.log(err);
        return res.status(400).json({ success: false, message: "ERROR" });
      }
    }
  };

  eraseDocument = async (req, res) => {
    try {
      const documentId = req.body.documentId;
      const userId = req.userId;

      const updatedDocument = await Document.findOne(
        { _id: documentId },
        "classroomId topic"
      );
      if (!updatedDocument) {
        throw new Error("No document");
      }

      const classroomId = updatedDocument.classroomId;

      // Only teacher of class can delete document
      const isValid = await userController.isUserATeacherOfClass(
        userId,
        classroomId
      );
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Chỉ có giáo viên mới được xóa tài liệu",
        });
      }

      const topic = updatedDocument.topic;
      var { duplicateTopicId, topics, isTheLastDocumentOfTopic } =
        await checkIfDuplicate(classroomId, topic);
      await removeDocumentOutOfTopic(
        duplicateTopicId,
        documentId,
        classroomId,
        isTheLastDocumentOfTopic
      );
      await Document.findOneAndDelete({ _id: documentId });
      return res.status(200).json({ success: true, message: "Xoa thanh cong" });
    } catch (err) {
      if (err.message === "No document") {
        return res.status(400).json({
          success: true,
          message: "Tài liệu không tồn tại hoặc đã bị xóa",
        });
      } else {
        console.log(err);
        return res.status(400).json({ success: true, message: "Lỗi rồi" });
      }
    }
  };
}

module.exports = new DocumentController();
