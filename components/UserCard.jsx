import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import { icons } from "../constants";

const UserCard = ({ user }) => {
    const { user: currentUser } = useGlobalContext();

    const {
        username = "Anonymous", 
        avatar = icons.defaultAvatar
    } = user || {};

    // Determine if navigating to the clicked user’s profile or current user's profile
    const isCurrentUser = user?.id === currentUser?.$id;
    const href = isCurrentUser ? "/myProfile" : `/${user.$id}`;

    return (
        <Link href={href} asChild>
            <TouchableOpacity>
                <View className="flex-col items-center px-4 mb-14">
                    <View className="flex-row gap-3 items-start">
                        <View className="justify-center items-center flex-row flex-1">
                            <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
                                <Image
                                    source={{ uri: avatar }}
                                    className="w-full h-full rounded-lg"
                                    resizeMode="cover"
                                />
                            </View>
                            <View className="justify-center flex-w ml-3 gap-y-1">
                                <Text className="text-xs text-gray-100 font-pregular" numberOfLines={1}>
                                    {username}
                                </Text>
                            </View>
                        </View>
                        <View className="pt-2">
                            <Image
                                source={icons.menu}
                                className="w-5 h-5"
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );
}

export default UserCard;
