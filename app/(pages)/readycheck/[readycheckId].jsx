import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getReadyCheck } from "../../../lib/appwrite";
import { formatTiming } from "../../../utils/formatTiming";
import InfoBox from "../../../components/InfoBox";
import UserCard from "../../../components/UserCard"


const LiveReadyCheck = () => {
    const { readycheckId } = useLocalSearchParams();
    const [readycheck, setReadyCheck] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (readycheckId) {
            getReadyCheck(readycheckId)
                .then(setReadyCheck)
                .catch((error) => console.error(error));
        }
    }, [readycheckId]);

    if (!readycheck) return null;

    const { title, timing, description, owner, invitees } = readycheck;
    const { time, date } = formatTiming(timing);
    const countdown = new Date(timing) - new Date();

    return (
        <SafeAreaView className="bg-primary h-full pt-5">
            <View className="px-4 py-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">Back</Text>
                </TouchableOpacity>
            </View>
            <View className="px-4">
                <Text className="text-secondary text-3xl my-2 text-center">{title}</Text>
                <Text className="text-white text-lg my-2 text-center">{Math.max(countdown / 1000, 0).toFixed(0)} seconds</Text>
                <Text className="text-white text-lg my-2">Owner: {owner.username}</Text>
                <Text className="text-white text-lg my-2">When: {time} on {date}</Text>
                <Text className="text-white text-lg my-2">Description: {description}</Text>
                <Text className="text-white text-lg my-2">Invitees:</Text>
                <FlatList
                    data={invitees}
                    keyExtractor={(item) => item.id || item.$id} // Ensure a unique key, fallback to item.$id if necessary
                    renderItem={({ item }) => <UserCard user={item} />}
                    ListEmptyComponent={() => (
                        <View className="justify-center items-center px-4">
                            <Text className="text-lg text-center font-psemibold text-white mt-2">
                                No Invites Sent
                            </Text>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
};

export default LiveReadyCheck;
