import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

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
  const [currentDate, setCurrentDate] = useState(new Date());

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

  return (
    <View className="items-center justify-center px-5 py-6">
      <Text className="mb-2 text-xl font-semibold text-gray-800">
        {greeting}
      </Text>

      <Text className="text-4xl font-bold text-gray-950">{time}</Text>

      <Text className="mt-2 text-base text-gray-500">{date}</Text>
    </View>
  );
}