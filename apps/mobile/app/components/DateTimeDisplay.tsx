import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

type Greeting =
  | "Good Morning"
  | "Good Afternoon"
  | "Good Evening"
  | "Good Night";

const getGreeting = (hour: number): Greeting => {
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";

  return "Good Night";
};

export default function DateTimeDisplay() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const time = currentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const date = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const greeting = getGreeting(currentDate.getHours());

  const handleNotificationPress = () => {
    console.log("Notification pressed");
  };

  const handleProfilePress = () => {
    console.log("Profile pressed");
  };

  return (
    <View className="w-full flex-row items-start justify-between px-5 py-6">
      {/* Date, greeting, and time */}
      <View className="flex-1 items-start pr-4">
        <Text className="text-xl font-semibold text-gray-800">
          {greeting}
        </Text>

        <Text className="mt-2 text-base text-gray-500">
          {date}
        </Text>
      </View>

      {/* Notification and profile buttons */}
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={handleNotificationPress}
          className="h-11 w-11 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
        >
          <Ionicons
            name="notifications-outline"
            size={23}
            color="#374151"
          />
        </Pressable>

        <Pressable
          onPress={handleProfilePress}
          className="h-11 w-11 items-center justify-center rounded-full bg-gray-200 active:bg-gray-300"
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Ionicons
            name="person-outline"
            size={23}
            color="#374151"
          />
        </Pressable>
      </View>
    </View>
  );
}