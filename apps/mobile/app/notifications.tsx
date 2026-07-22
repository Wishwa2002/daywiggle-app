import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
};

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Welcome to DayWiggle",
    message:
      "Your DayWiggle profile is ready.",
    time: "Just now",
    isRead: false,
  },
  {
    id: "2",
    title: "Transaction reminder",
    message:
      "Remember to review your recent transactions.",
    time: "Today",
    isRead: true,
  },
];

export default function NotificationsScreen() {
  return (
    <ScrollView
      className="flex-1 bg-blue-50"
      contentContainerClassName="px-5 pb-10 pt-14"
    >
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
          Notifications
        </Text>
      </View>

      {NOTIFICATIONS.length === 0 ? (
        <View className="items-center rounded-3xl bg-white px-6 py-12">
          <Text className="text-lg font-bold text-gray-900">
            No notifications
          </Text>

          <Text className="mt-2 text-center text-gray-500">
            New notifications will appear here.
          </Text>
        </View>
      ) : (
        <View className="overflow-hidden rounded-3xl bg-white">
          {NOTIFICATIONS.map(
            (notification, index) => (
              <View
                key={notification.id}
                className={`flex-row px-5 py-5 ${
                  index <
                  NOTIFICATIONS.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <View
                  className={`mt-2 h-2.5 w-2.5 rounded-full ${
                    notification.isRead
                      ? "bg-gray-300"
                      : "bg-blue-600"
                  }`}
                />

                <View className="ml-4 flex-1">
                  <Text className="font-bold text-gray-900">
                    {notification.title}
                  </Text>

                  <Text className="mt-1 leading-5 text-gray-600">
                    {notification.message}
                  </Text>

                  <Text className="mt-2 text-xs text-gray-400">
                    {notification.time}
                  </Text>
                </View>
              </View>
            )
          )}
        </View>
      )}
    </ScrollView>
  );
}