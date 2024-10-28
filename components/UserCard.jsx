import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import { icons } from "../constants";

const UserCard = ({ user }) => {
    const { user: currentUser } = useGlobalContext();
    const router = useRouter();

    // Check if there’s user data; if not, return null
    if (!user) return null;

    const isCurrentUser = user.$id === currentUser?.$id;
    const navigateToProfile = () => {
        if (isCurrentUser) {
            router.push("/myProfile");
        } else {
            router.push(`/${user.$id}`);
        }
    };

    return (
        <TouchableOpacity onPress={navigateToProfile} className="mb-4 p-4 bg-gray-800 rounded-lg flex-row items-center">
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
