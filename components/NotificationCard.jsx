import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { icons } from "../constants";

const NotificationCard = ({ notification, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mb-4 p-4 rounded-lg flex-row items-center ${
        notification.status === "read" ? "bg-gray-700" : "bg-gray-800"
      }`}
    >
      <Image
        source={{ uri: notification.icon || icons.defaultNotification }}
        className="w-12 h-12 rounded-full"
        resizeMode="cover"
      />
      <View className="ml-4">
        <Text className={`font-semibold text-base ${notification.status === "read" ? "text-gray-400" : "text-white"}`}>
          {notification.message}
        </Text>
        <Text className="text-gray-400 text-sm">{notification.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationCard;