import {
  router,
  useFocusEffect,
} from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  useCallback,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import ProfileAvatarButton from "./components/ProfileAvatarButton";

import {
  API_BASE_URL,
  getLatestProfile,
  type BackendProfile,
} from "../app/services/profileApi";

type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profilePhotoUrl: string | null;
  updatedAt: string;
};

type ProfileApiResponse = {
  success: boolean;
  message?: string;
  profile?: BackendProfile;
};

function mapBackendProfile(
  profile: BackendProfile
): UserProfile {
  return {
    id: profile.id,
    fullName: profile.name,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
    profilePhotoUrl: profile.profilePictureUrl,
    updatedAt: profile.updatedAt,
  };
}

function addCacheVersion(
  imageUrl: string | null,
  updatedAt: string
): string | null {
  if (!imageUrl) {
    return null;
  }

  // Local ImagePicker URIs should not be modified.
  if (
    imageUrl.startsWith("file://") ||
    imageUrl.startsWith("content://")
  ) {
    return imageUrl;
  }

  const separator = imageUrl.includes("?")
    ? "&"
    : "?";

  return `${imageUrl}${separator}updated=${encodeURIComponent(
    updatedAt
  )}`;
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");

  return initials || "U";
}

export default function ProfileScreen() {
  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [
    profilePhoto,
    setProfilePhoto,
  ] = useState<string | null>(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    isUploadingPhoto,
    setIsUploadingPhoto,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  const loadProfile =
    useCallback(async () => {
      try {
        setErrorMessage(null);

        const backendProfile =
          await getLatestProfile();

        const loadedUser =
          mapBackendProfile(
            backendProfile
          );

        setUser(loadedUser);
        setProfilePhoto(
          loadedUser.profilePhotoUrl
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the profile.";

        console.error(
          "Profile loading error:",
          error
        );

        setErrorMessage(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }, []);

  /*
   * Reload the profile every time this page
   * becomes active.
   */
  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    void loadProfile();
  };

  const handleRetry = () => {
    setIsLoading(true);
    void loadProfile();
  };

  const handleSelectPhoto =
    async () => {
      if (!user) {
        Alert.alert(
          "Profile unavailable",
          "The profile must load before selecting a picture."
        );

        return;
      }

      try {
        const permission =
          await ImagePicker
            .requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permission required",
            "Please allow photo access to select a profile picture."
          );

          return;
        }

        const result =
          await ImagePicker
            .launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

        if (
          result.canceled ||
          !result.assets?.length
        ) {
          return;
        }

        const selectedAsset =
          result.assets[0];

        const selectedPhotoUri =
          selectedAsset.uri;

        /*
         * Show the selected image immediately
         * while it uploads.
         */
        setProfilePhoto(
          selectedPhotoUri
        );

        setIsUploadingPhoto(true);

        const fileName =
          selectedAsset.fileName ??
          `profile-${Date.now()}.jpg`;

        const mimeType =
          selectedAsset.mimeType ??
          "image/jpeg";

        const formData =
          new FormData();

        formData.append(
          "name",
          user.fullName
        );

        formData.append(
          "email",
          user.email
        );

        formData.append(
          "phoneNumber",
          user.phoneNumber
        );

        formData.append(
          "profilePicture",
          {
            uri: selectedPhotoUri,
            name: fileName,
            type: mimeType,
          } as any
        );

        const response =
          await fetch(
            `${API_BASE_URL}/api/profile`,
            {
              method: "POST",
              body: formData,
            }
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

        if (
          !response.ok ||
          !data.profile
        ) {
          throw new Error(
            data.message ??
              "Unable to upload profile picture."
          );
        }

        const updatedUser =
          mapBackendProfile(
            data.profile
          );

        setUser(updatedUser);
        setProfilePhoto(
          updatedUser.profilePhotoUrl
        );

        Alert.alert(
          "Photo updated",
          "Your profile picture was saved successfully."
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Something went wrong while saving the profile picture.";

        console.error(
          "Profile photo error:",
          error
        );

        /*
         * Restore the previous backend picture
         * if the upload fails.
         */
        setProfilePhoto(
          user.profilePhotoUrl
        );

        Alert.alert(
          "Unable to save photo",
          message
        );
      } finally {
        setIsUploadingPhoto(
          false
        );
      }
    };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-blue-50">
        <ActivityIndicator
          size="large"
        />

        <Text className="mt-4 text-base font-medium text-gray-600">
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-blue-50 px-5 pt-14">
        <View className="flex-row items-center">
          <ProfileAvatarButton />
          <Pressable
            onPress={() =>
              router.back()
            }
            className="h-10 w-10 items-center justify-center rounded-full bg-white active:bg-gray-100"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text className="text-xl text-gray-800">
              ←
            </Text>
          </Pressable>

          <Text className="ml-4 text-2xl font-bold text-gray-900">
            My Profile
          </Text>
        </View>

        <View className="mt-10 rounded-3xl bg-white p-6">
          <Text className="text-lg font-bold text-red-600">
            Unable to load profile
          </Text>

          <Text className="mt-2 text-gray-600">
            {errorMessage ??
              "Profile data was not found."}
          </Text>

          <Text className="mt-3 text-sm text-gray-500">
            API: {API_BASE_URL}
          </Text>

          <Pressable
            onPress={
              handleRetry
            }
            className="mt-5 items-center rounded-xl bg-blue-600 px-5 py-3 active:bg-blue-700"
          >
            <Text className="font-semibold text-white">
              Try Again
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const displayedPhoto =
    addCacheVersion(
      profilePhoto,
      user.updatedAt
    );

  return (
    <ScrollView
      className="flex-1 bg-blue-50"
      contentContainerClassName="px-5 pb-10 pt-14"
      refreshControl={
        <RefreshControl
          refreshing={
            isRefreshing
          }
          onRefresh={
            handleRefresh
          }
        />
      }
    >
      {/* Header */}
      <View className="mb-6 flex-row items-center">
        <Pressable
          onPress={() =>
            router.back()
          }
          className="h-10 w-10 items-center justify-center rounded-full bg-white active:bg-gray-100"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text className="text-xl text-gray-800">
            ←
          </Text>
        </Pressable>

        <Text className="ml-4 text-2xl font-bold text-gray-900">
          My Profile
        </Text>
      </View>

      {/* Profile card */}
      <View className="items-center rounded-3xl bg-white px-6 py-8">
        <Pressable
          onPress={
            handleSelectPhoto
          }
          disabled={
            isUploadingPhoto
          }
          className="relative"
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
        >
          {displayedPhoto ? (
            <Image
              source={{
                uri: displayedPhoto,
              }}
              className="h-28 w-28 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-28 w-28 items-center justify-center rounded-full bg-blue-100">
              <Text className="text-3xl font-bold text-blue-600">
                {getInitials(
                  user.fullName
                )}
              </Text>
            </View>
          )}

          <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600">
            {isUploadingPhoto ? (
              <ActivityIndicator
                size="small"
                color="#ffffff"
              />
            ) : (
              <Text className="text-xl font-bold text-white">
                +
              </Text>
            )}
          </View>
        </Pressable>

        <Pressable
          onPress={
            handleSelectPhoto
          }
          disabled={
            isUploadingPhoto
          }
          className={`mt-4 rounded-full px-5 py-2 ${
            isUploadingPhoto
              ? "bg-gray-100"
              : "bg-blue-50 active:bg-blue-100"
          }`}
          accessibilityRole="button"
          accessibilityLabel="Select profile picture"
        >
          <Text
            className={`font-semibold ${
              isUploadingPhoto
                ? "text-gray-500"
                : "text-blue-600"
            }`}
          >
            {isUploadingPhoto
              ? "Saving Photo..."
              : profilePhoto
                ? "Change Photo"
                : "Add Profile Photo"}
          </Text>
        </Pressable>

        <Text className="mt-5 text-2xl font-bold text-gray-900">
          {user.fullName}
        </Text>

        <Text className="mt-1 text-gray-500">
          {user.email}
        </Text>
      </View>

      {/* Personal information */}
      <View className="mt-6 rounded-3xl bg-white p-6">
        <Text className="mb-5 text-lg font-bold text-gray-900">
          Personal Information
        </Text>

        <ProfileItem
          label="Full Name"
          value={user.fullName}
        />

        <ProfileItem
          label="Email Address"
          value={user.email}
        />

        <ProfileItem
          label="Phone Number"
          value={
            user.phoneNumber
          }
          showBottomBorder={
            false
          }
        />
      </View>
    </ScrollView>
  );
}

type ProfileItemProps = {
  label: string;
  value: string;
  showBottomBorder?: boolean;
};

function ProfileItem({
  label,
  value,
  showBottomBorder = true,
}: ProfileItemProps) {
  return (
    <View
      className={`py-4 ${
        showBottomBorder
          ? "border-b border-gray-100"
          : ""
      }`}
    >
      <Text className="text-sm font-medium text-gray-500">
        {label}
      </Text>

      <Text className="mt-1 text-base font-semibold text-gray-900">
        {value ||
          "Not provided"}
      </Text>
    </View>
  );
}