import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { formatTiming } from "../utils/formatTiming";
import { icons } from "../constants";

const ReadyCheckCard = ({ readycheck, archived }) => {
    const {
        title = "Untitled",
        timing = "Unknown Time",
        owner = {}, // Fallback to empty object if owner is missing
    } = readycheck || {};

    const router = useRouter();
    const name = owner.displayName || owner.username || "Anonymous";
    const avatar = owner.avatar || icons.defaultAvatar;
    const { time, date } = formatTiming(timing);

    return (
        <TouchableOpacity
            onPress={() => router.push(`/readycheck/${readycheck.$id}`)}
            className="mb-5">
            <View className={`flex-col px-4 rounded-lg ${archived ? "opacity-60" : "opacity-100"}`}>
                <View className="flex-row gap-3 items-start">
                    <View className="flex-row flex-1">
                        <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
                            <Image
                                source={{ uri: avatar }}
                                className="w-full h-full rounded-lg"
                                resizeMode="cover"
                            />
                        </View>
                        <View className="justify-center ml-3 gap-y-1">
                            <Text
                                className={`font-psemibold text-sm ${archived ? "text-gray-300" : "text-white"}`}
                                numberOfLines={1}
                            >
                                {title}
                            </Text>
                            <Text
                                className={`text-xs font-pregular ${archived ? "text-gray-400" : "text-gray-100"}`}
                                numberOfLines={1}
                            >
                                {name}
                            </Text>
                        </View>
                    </View>

                    <View className="justify-center flex-end ml-3 gap-y-1">
                        <Text className={`text-xs font-pregular ${archived ? "text-gray-400" : "text-gray-100"}`}>
                            {time},
                        </Text>
                        <Text className={`text-xs font-pregular ${archived ? "text-gray-400" : "text-gray-100"}`}>
                            {date}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default ReadyCheckCard;