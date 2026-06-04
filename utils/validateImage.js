/**
 * Validates that a file is an image and within the size limit.
 *
 * @param {{ mimeType: string, fileSize: number }} options
 * @throws {Error} if mimeType is not an image or fileSize exceeds 10MB
 */
function validateImage({ mimeType, fileSize }) {
  if (!mimeType || !mimeType.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  if (fileSize > 10 * 1024 * 1024) {
    throw new Error('File size must be under 10MB');
  }
}

module.exports = { validateImage };
