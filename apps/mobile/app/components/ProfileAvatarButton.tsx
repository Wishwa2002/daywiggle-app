import {
  router,
  useFocusEffect,
} from "expo-router";
import {
  useCallback,
  useState,
} from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

import {
  getLatestProfile,
  type BackendProfile,
} from "../services/profileApi";

type ProfileAvatarButtonProps = {
  size?: number;
};

export default function ProfileAvatarButton({
  size = 44,
}: ProfileAvatarButtonProps) {
  const [profile, setProfile] =
    useState<BackendProfile | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [imageFailed, setImageFailed] =
    useState(false);

  const loadProfile =
    useCallback(async () => {
      try {
        setIsLoading(true);
        setImageFailed(false);

        const loadedProfile =
          await getLatestProfile();

        console.log(
          "Avatar image URL:",
          loadedProfile.profilePictureUrl
        );

        setProfile(loadedProfile);
      } catch (error) {
        console.error(
          "Profile avatar loading error:",
          error
        );

        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }, []);

  /*
   * Reload whenever the home screen becomes active.
   * This updates the avatar after returning from profile.tsx.
   */
  useFocusEffect(
    useCallback(() => {
      void loadProfile();

      return undefined;
    }, [loadProfile])
  );

  const getInitials = (
    name?: string
  ): string => {
    if (!name?.trim()) {
      return "U";
    }

    return (
      name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) =>
          part.charAt(0).toUpperCase()
        )
        .join("") || "U"
    );
  };

  const getVersionedImageUrl =
    (): string | null => {
      if (
        !profile?.profilePictureUrl ||
        imageFailed
      ) {
        return null;
      }

      const separator =
        profile.profilePictureUrl.includes("?")
          ? "&"
          : "?";

      return `${
        profile.profilePictureUrl
      }${separator}v=${encodeURIComponent(
        profile.updatedAt
      )}`;
    };

  const imageUrl =
    getVersionedImageUrl();

  return (
    <Pressable
      onPress={() =>
        router.push("/profile")
      }
      style={{
        width: size,
        height: size,
      }}
      className="overflow-hidden rounded-full border-2 border-white bg-blue-100 active:opacity-70"
      accessibilityRole="button"
      accessibilityLabel="Open profile"
    >
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="small"
          />
        </View>
      ) : imageUrl ? (
        <Image
          source={{
            uri: imageUrl,
          }}
          style={{
            width: size,
            height: size,
          }}
          resizeMode="cover"
          onLoad={() => {
            console.log(
              "Profile avatar loaded successfully."
            );
          }}
          onError={(event) => {
            console.error(
              "Profile avatar image error:",
              event.nativeEvent.error
            );

            setImageFailed(true);
          }}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-base font-bold text-blue-600">
            {getInitials(
              profile?.name
            )}
          </Text>
        </View>
      )}
    </Pressable>
  );
}