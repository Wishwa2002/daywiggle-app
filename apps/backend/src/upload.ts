import fs from "node:fs";
import path from "node:path";
import multer from "multer";

export const profileUploadDirectory =
  path.resolve("uploads", "profiles");

if (!fs.existsSync(profileUploadDirectory)) {
  fs.mkdirSync(profileUploadDirectory, {
    recursive: true,
  });
}

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (
    _request,
    _file,
    callback
  ) => {
    callback(null, profileUploadDirectory);
  },

  filename: (
    _request,
    file,
    callback
  ) => {
    const extension =
      extensionByMimeType[file.mimetype] ?? ".jpg";

    const randomNumber = Math.round(
      Math.random() * 1_000_000
    );

    const filename =
      `profile-${Date.now()}-${randomNumber}${extension}`;

    callback(null, filename);
  },
});

export const uploadProfilePicture = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (
    _request,
    file,
    callback
  ) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new Error(
          "Only JPG, PNG and WebP profile pictures are allowed."
        )
      );

      return;
    }

    callback(null, true);
  },
});