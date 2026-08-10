const multer = require('multer');
const { uploadToCloudinary } = require('../utils/upload');

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => cb(null, true);
const limits = { fileSize: 50 * 1024 * 1024 };

const uploadFile = multer({ storage, limits, fileFilter }).single('file');
const uploadImage = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter }).single('image');
const uploadAudio = multer({ storage, limits: { fileSize: 30 * 1024 * 1024 }, fileFilter }).single('audio');
const uploadVideo = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 }, fileFilter }).single('video');
const uploadFields = (fieldsArray) => multer({ storage, limits, fileFilter }).fields(fieldsArray);

module.exports = { uploadFile, uploadImage, uploadAudio, uploadVideo, uploadFields };
 