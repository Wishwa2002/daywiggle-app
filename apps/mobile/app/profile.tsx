import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

type UserProfile = {
  fullName: string;
  email: string;
  phoneNumber: string;
  profilePhotoUrl: string | null;
};


const TEMP_USER: UserProfile = {
  fullName: " ",
  email: " ",
  phoneNumber: " ",
  profilePhotoUrl: null,
};

export default function ProfileScreen() {
  const [user] = useState<UserProfile>(TEMP_USER);

  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    user.profilePhotoUrl
  );

  const handleSelectPhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo access to select a profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const selectedPhotoUri = result.assets[0].uri;

      setProfilePhoto(selectedPhotoUri);

      // Later:
      // 1. Upload selectedPhotoUri to your backend.
      // 2. Backend stores the image in cloud/file storage.
      // 3. Save the returned image URL in the user's database record.
    } catch (error) {
      console.error("Profile photo selection error:", error);

      Alert.alert(
        "Unable to select photo",
        "Something went wrong while selecting the profile photo."
      );
    }
  };

  const getInitials = (name: string) => {
    const initials = name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");

    return initials || "U";
  };

  return (
    <ScrollView
      className="flex-1 bg-blue-50"
      contentContainerClassName="px-5 pb-10 pt-14"
    >
      {/* Header */}
      <View className="mb-6 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white active:bg-gray-100"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text className="text-xl text-gray-800">←</Text>
        </Pressable>

        <Text className="ml-4 text-2xl font-bold text-gray-900">
          My Profile
        </Text>
      </View>

      {/* Profile card */}
      <View className="items-center rounded-3xl bg-white px-6 py-8">
        <Pressable
          onPress={handleSelectPhoto}
          className="relative"
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
        >
          {profilePhoto ? (
            <Image
              source={{ uri: profilePhoto }}
              className="h-28 w-28 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-28 w-28 items-center justify-center rounded-full bg-blue-100">
              <Text className="text-3xl font-bold text-blue-600">
                {getInitials(user.fullName)}
              </Text>
            </View>
          )}

          <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600">
            <Text className="text-xl font-bold text-white">+</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={handleSelectPhoto}
          className="mt-4 rounded-full bg-blue-50 px-5 py-2 active:bg-blue-100"
        >
          <Text className="font-semibold text-blue-600">
            {profilePhoto ? "Change Photo" : "Add Profile Photo"}
          </Text>
        </Pressable>

        <Text className="mt-5 text-2xl font-bold text-gray-900">
          {user.fullName}
        </Text>

        <Text className="mt-1 text-gray-500">{user.email}</Text>
      </View>

      {/* User details */}
      <View className="mt-6 rounded-3xl bg-white p-6">
        <Text className="mb-5 text-lg font-bold text-gray-900">
          Personal Information
        </Text>

        <ProfileItem label="Full Name" value={user.fullName} />

        <ProfileItem label="Email Address" value={user.email} />

        <ProfileItem
          label="Phone Number"
          value={user.phoneNumber}
          showBottomBorder={false}
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
        showBottomBorder ? "border-b border-gray-100" : ""
      }`}
    >
      <Text className="text-sm font-medium text-gray-500">{label}</Text>

      <Text className="mt-1 text-base font-semibold text-gray-900">
        {value}
      </Text>
    </View>
  );
}