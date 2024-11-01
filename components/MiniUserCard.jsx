import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";

const MiniUserCard = ({ user }) => {
  const router = useRouter();
  const { user: currentUser } = useGlobalContext();
  const userId = user?.$id || user?.id;
  const isCurrentUser = userId === currentUser?.$id;
  const href = isCurrentUser ? "/myProfile" : `user/${userId}`;

  return (
    <TouchableOpacity
      onPress={() => router.push(href)}
      className="mt-2 mx-1 py-1 px-2 bg-gray-800 rounded-lg max-w-[30vw] flex-row items-center justify-center"
    >
      <View>
        <Text className="text-white font-semibold text-center text-sm">
          {user.username || "Not Found"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default MiniUserCard;