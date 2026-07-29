const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - file buffer
 * @param {string} folder - Cloudinary folder (e.g., 'meditations', 'sounds')
 * @param {string} resourceType - 'image' or 'video' or 'raw' (for audio)
 * @param {object} options - additional options
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, folder, resourceType = 'image', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `chiyembekezo/${folder}`,
        resource_type: resourceType,
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - 'image' or 'video' or 'raw'
 */
const deleteFromCloudinary = (publicId, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
