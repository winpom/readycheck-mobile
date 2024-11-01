import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { icons } from "../constants";

import { formatTiming } from "../utils/formatTiming";

const NotificationCard = ({ notification, onPress }) => {

  const {
    message = "Untitled",
    status = "unread",
    timestamp = "Unknown Time",
    sender = `${notification.senderId}`, 
} = notification || {};

  const { time, date } = formatTiming(timestamp);

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mb-4 p-4 rounded-lg flex-row items-center ${
        notification.status === "read" ? "bg-gray-700" : "bg-gray-800"
      }`}
    >
      <View className="ml-4">
        <Text numberOfLines={1} className={`text-small ${notification.status === "read" ? "text-gray-400 font-pregular" : "text-white font-semibold"}`}>
          {notification.message}
        </Text>
        <Text className="text-gray-400 text-sm">{time}, {date}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationCard;