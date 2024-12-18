import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

import { formatTiming } from "../utils/formatTiming";
import { icons } from "../constants";

const ReadyCheckCard = ({ readycheck }) => {
    const {
        title = "Untitled",
        timing = "Unknown Time",
        owner = {}, // Fallback to empty object if owner is missing
    } = readycheck || {};

    const router = useRouter();
    const name = owner.displayName ||owner.username || "Anonymous";
    const avatar = owner.avatar || icons.defaultAvatar;
    const { time, date } = formatTiming(timing);

    return (
        <TouchableOpacity onPress={() => router.push(`/readycheck/${readycheck.$id}`)} className="">
            <View className="flex-col px-4 mb-7">
                <View className="flex-row gap-3 items-start">
                    <View className="flex-row flex-1">
                        <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
                            <Image
                                source={{ uri: avatar }}
                                className="w-full h-full rounded-lg"
                                resizeMode="cover"
                            />
                        </View>
                        <View className="justify-center flex-w ml-3 gap-y-1">
                            <Text className="text-white font-psemibold text-sm" numberOfLines={1}>
                                {title}
                            </Text>
                            <Text className="text-xs text-gray-100 font-pregular" numberOfLines={1}>
                                {name}
                            </Text>
                        </View>
                    </View>

                    {/* Display time over date */}
                    <View className="justify-center flex-end flex-w ml-3 gap-y-1 gap-x-20">
                        <Text className="text-xs text-gray-100 font-pregular">
                            {time},
                        </Text>
                        <Text className="text-xs text-gray-100 font-pregular">
                            {date}
                        </Text>
                    </View>
{/* 
                    <View className="pt-2">
                        <Image
                            source={icons.menu}
                            className="w-5 h-5"
                            resizeMode="contain"
                        />
                    </View> */}
                </View>
            </View>
        </TouchableOpacity>

    );
};

export default ReadyCheckCard;
