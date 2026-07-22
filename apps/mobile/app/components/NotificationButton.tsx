import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Pressable,
  Text,
  View,
} from "react-native";

type NotificationButtonProps = {
  unreadCount?: number;
};

export default function NotificationButton({
  unreadCount = 0,
}: NotificationButtonProps) {
  const displayedCount =
    unreadCount > 99
      ? "99+"
      : String(unreadCount);

  return (
    <Pressable
      onPress={() =>
        router.push("/notifications")
      }
      className="relative h-11 w-11 items-center justify-center rounded-full bg-white active:bg-gray-100"
      accessibilityRole="button"
      accessibilityLabel="Open notifications"
    >
      <Ionicons
        name="notifications-outline"
        size={23}
        color="#1F2937"
      />

      {unreadCount > 0 && (
        <View className="absolute -right-1 -top-1 min-w-5 items-center justify-center rounded-full border-2 border-blue-50 bg-red-500 px-1">
          <Text className="text-[10px] font-bold text-white">
            {displayedCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}