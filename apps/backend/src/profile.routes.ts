import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  Router,
  type Request,
  type Response,
} from "express";

import { db } from "./db.js";
import {
  profileUploadDirectory,
  uploadProfilePicture,
} from "./upload.js";

export const profileRouter = Router();

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
};

function formatProfile(
  request: Request,
  profile: ProfileRow
) {
  const profilePictureUrl =
    profile.profile_picture
      ? `${request.protocol}://${request.get(
          "host"
        )}${profile.profile_picture}`
      : null;

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phoneNumber: profile.phone_number,
    profilePictureUrl,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

function removeUploadedFile(
  filePath: string | undefined
): void {
  if (!filePath) {
    return;
  }

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function deleteSavedProfilePicture(
  picturePath: string | null
): void {
  if (!picturePath) {
    return;
  }

  const filename = path.basename(picturePath);

  const fullPath = path.join(
    profileUploadDirectory,
    filename
  );

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

/**
 * Create or update a profile.
 *
 * JSON:
 * {
 *   "name": "Linh Perera",
 *   "email": "linh@example.com",
 *   "phoneNumber": "0771234567"
 * }
 *
 * Multipart form-data:
 * name
 * email
 * phoneNumber
 * profilePicture
 */
profileRouter.post(
  "/",
  uploadProfilePicture.single(
    "profilePicture"
  ),
  (request: Request, response: Response) => {
    try {
      const name = String(
        request.body.name ?? ""
      ).trim();

      const email = String(
        request.body.email ?? ""
      )
        .trim()
        .toLowerCase();

      const phoneNumber = String(
        request.body.phoneNumber ?? ""
      ).trim();

      if (!name || !email || !phoneNumber) {
        removeUploadedFile(
          request.file?.path
        );

        response.status(400).json({
          success: false,
          message:
            "Name, email and phone number are required.",
        });

        return;
      }

      if (
        !email.includes("@") ||
        !email.includes(".")
      ) {
        removeUploadedFile(
          request.file?.path
        );

        response.status(400).json({
          success: false,
          message:
            "Please enter a valid email address.",
        });

        return;
      }

      const existingProfile = db
        .prepare(
          `
            SELECT *
            FROM profiles
            WHERE email = ?
          `
        )
        .get(email) as ProfileRow | undefined;

      let profileId: string;

      if (existingProfile) {
        profileId = existingProfile.id;

        const profilePicture =
          request.file
            ? `/uploads/profiles/${request.file.filename}`
            : existingProfile.profile_picture;

        db.prepare(
          `
            UPDATE profiles
            SET
              name = ?,
              phone_number = ?,
              profile_picture = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `
        ).run(
          name,
          phoneNumber,
          profilePicture,
          profileId
        );

        if (
          request.file &&
          existingProfile.profile_picture
        ) {
          deleteSavedProfilePicture(
            existingProfile.profile_picture
          );
        }
      } else {
        profileId = randomUUID();

        const profilePicture =
          request.file
            ? `/uploads/profiles/${request.file.filename}`
            : null;

        db.prepare(
          `
            INSERT INTO profiles (
              id,
              name,
              email,
              phone_number,
              profile_picture
            )
            VALUES (?, ?, ?, ?, ?)
          `
        ).run(
          profileId,
          name,
          email,
          phoneNumber,
          profilePicture
        );
      }

      const savedProfile = db
        .prepare(
          `
            SELECT *
            FROM profiles
            WHERE id = ?
          `
        )
        .get(profileId) as ProfileRow;

      response
        .status(existingProfile ? 200 : 201)
        .json({
          success: true,
          message: existingProfile
            ? "Profile updated successfully."
            : "Profile created successfully.",
          profile: formatProfile(
            request,
            savedProfile
          ),
        });
    } catch (error) {
      removeUploadedFile(
        request.file?.path
      );

      console.error(
        "Profile save error:",
        error
      );

      response.status(500).json({
        success: false,
        message:
          "Unable to save the profile.",
      });
    }
  }
);

/**
 * Get the latest saved profile.
 *
 * GET /api/profile
 *
 * This is suitable for the current
 * single-user DayWiggle version.
 */
profileRouter.get(
  "/",
  (
    request: Request,
    response: Response
  ) => {
    try {
      const profile = db
        .prepare(
          `
            SELECT *
            FROM profiles
            ORDER BY rowid DESC
            LIMIT 1
          `
        )
        .get() as ProfileRow | undefined;

      if (!profile) {
        response.status(404).json({
          success: false,
          message:
            "No profile has been created yet.",
        });

        return;
      }

      response.status(200).json({
        success: true,
        profile: formatProfile(
          request,
          profile
        ),
      });
    } catch (error) {
      console.error(
        "Profile read error:",
        error
      );

      response.status(500).json({
        success: false,
        message:
          "Unable to read the profile.",
      });
    }
  }
);

/**
 * Get a profile using its ID.
 *
 * GET /api/profile/:id
 */
profileRouter.get(
  "/:id",
  (
    request: Request,
    response: Response
  ) => {
    try {
      const profile = db
        .prepare(
          `
            SELECT *
            FROM profiles
            WHERE id = ?
          `
        )
        .get(
          request.params.id
        ) as ProfileRow | undefined;

      if (!profile) {
        response.status(404).json({
          success: false,
          message: "Profile not found.",
        });

        return;
      }

      response.status(200).json({
        success: true,
        profile: formatProfile(
          request,
          profile
        ),
      });
    } catch (error) {
      console.error(
        "Profile read error:",
        error
      );

      response.status(500).json({
        success: false,
        message:
          "Unable to read the profile.",
      });
    }
  }
);

/**
 * Delete a profile.
 *
 * DELETE /api/profile/:id
 */
profileRouter.delete(
  "/:id",
  (
    request: Request,
    response: Response
  ) => {
    try {
      const profile = db
        .prepare(
          `
            SELECT *
            FROM profiles
            WHERE id = ?
          `
        )
        .get(
          request.params.id
        ) as ProfileRow | undefined;

      if (!profile) {
        response.status(404).json({
          success: false,
          message: "Profile not found.",
        });

        return;
      }

      db.prepare(
        `
          DELETE FROM profiles
          WHERE id = ?
        `
      ).run(request.params.id);

      deleteSavedProfilePicture(
        profile.profile_picture
      );

      response.status(200).json({
        success: true,
        message:
          "Profile deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Profile deletion error:",
        error
      );

      response.status(500).json({
        success: false,
        message:
          "Unable to delete the profile.",
      });
    }
  }
);