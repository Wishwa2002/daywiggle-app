import React, { useEffect, useMemo, useState } from "react";
import {  Text, View } from "react-native";

type DayPeriod = "Good Morning" | "Good Afternoon" | "Good Evening" | "Good Night";

const getDayPeriod = (hour: number): DayPeriod => {
  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good Evening";
  }

  return "Good Night";
};

const DateTimeDisplay = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const time = useMemo(
    () =>
      currentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    [currentDate]
  );

  const date = useMemo(
    () =>
      currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    [currentDate]
  );

  const greeting = getDayPeriod(currentDate.getHours());

  return (
    <View className="  justify-center p-6">
      <Text className="text-[22px] font-semibold ">{greeting}</Text>
      <Text className="mt-2 text-[16px] opacity-70 ">{date}</Text>
    </View>
  );
};

export default DateTimeDisplay;

