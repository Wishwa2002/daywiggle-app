import { Platform } from "react-native";

export type BackendProfile = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProfileApiResponse = {
  success: boolean;
  message?: string;
  profile?: BackendProfile;
};

const DEFAULT_API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:4000"
    : "http://localhost:4000";

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  DEFAULT_API_URL
).replace(/\/$/, "");

function normalizeProfilePictureUrl(
  profilePictureUrl: string | null
): string | null {
  if (!profilePictureUrl) {
    return null;
  }

  /*
   * When the backend returns:
   * http://localhost:4000/uploads/profiles/image.jpg
   *
   * rebuild it using the mobile application's API URL:
   * http://YOUR-PC-IP:4000/uploads/profiles/image.jpg
   */
  const uploadsIndex =
    profilePictureUrl.indexOf("/uploads/");

  if (uploadsIndex >= 0) {
    const imagePath =
      profilePictureUrl.slice(uploadsIndex);

    return `${API_BASE_URL}${imagePath}`;
  }

  if (profilePictureUrl.startsWith("/")) {
    return `${API_BASE_URL}${profilePictureUrl}`;
  }

  return profilePictureUrl;
}

export async function getLatestProfile(): Promise<BackendProfile> {
  console.log(
    "Loading profile from:",
    `${API_BASE_URL}/api/profile`
  );

  const response = await fetch(
    `${API_BASE_URL}/api/profile`
  );

  let data: ProfileApiResponse;

  try {
    data =
      (await response.json()) as ProfileApiResponse;
  } catch {
    throw new Error(
      "The backend returned an invalid response."
    );
  }

  if (!response.ok || !data.profile) {
    throw new Error(
      data.message ?? "Unable to load profile."
    );
  }

  return {
    ...data.profile,
    profilePictureUrl:
      normalizeProfilePictureUrl(
        data.profile.profilePictureUrl
      ),
  };
}