import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

import { formatTiming } from "../utils/formatTiming";

const NotificationCard = ({ notification, onPress }) => {
  const {
    timestamp = "Unknown Time",
  } = notification || {};

  const { time, date } = formatTiming(timestamp);

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mb-2 rounded-lg flex-row items-center ${notification.status === "read" ? "bg-gray-700" : "bg-gray-800"
        }`}
    >
      <View className="ml-4">
        <Text numberOfLines={2} className={`text-small ${notification.readStatus === "read" ? "text-gray-400 font-pregular" : "text-white font-semibold"}`}>
          {notification.message}
        </Text>
        <Text className={`text-small ${notification.readStatus === "read" ? "text-gray-600" : "text-gray-400"}`}>{time}, {date}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationCard;