const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const Document = new mongoose.Schema({
    classroomId: {
        type: ObjectId,
        ref: 'Classroom',
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    creatorId: {
        type: ObjectId,
        ref: 'User',
    },
    // Lưu link Google Drive dưới dạng mảng string
    attachedFiles: [{
        type: String,  // mỗi phần tử là 1 link
    }],
    fileAttributes: [{
        name: {
            type: String,
        },
        size: {
            type: Number,  // đổi thành Number cho dễ xử lý kích thước file (byte)
        },
        extension: {
            type: String,
        }
    }],
    topic: {
        type: String,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Document', Document);
