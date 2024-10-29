import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import { icons } from "../constants";

const UserCard = ({ user }) => {
  const router = useRouter();
  const { user: currentUser } = useGlobalContext();

  // Determine if navigating to the clicked user’s profile or current user's profile
  const isCurrentUser = user?.id === currentUser?.$id;
  const href = isCurrentUser ? "/myProfile" : `user/${user.id}`;

    return (
        <TouchableOpacity onPress={() => router.push(href)} className="mb-4 p-4 bg-gray-800 rounded-lg flex-row items-center">
            <Image
                source={{ uri: user.avatar || icons.defaultAvatar }}
                className="w-12 h-12 rounded-full"
                resizeMode="cover"
            />
            <View className="ml-4">
                <Text className="text-white font-semibold text-base">{user.username || "Unnamed"}</Text>
                <Text className="text-gray-400 text-sm">{isCurrentUser ? "View My Profile" : "View Profile"}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default UserCard;
