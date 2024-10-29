import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getReadyCheck } from "../../../lib/appwrite";
import { formatTiming } from "../../../utils/formatTiming";
import InfoBox from "../../../components/InfoBox";

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
                <InfoBox title={title} subtitle="ReadyCheck Title" />
                <Text className="text-white text-lg my-2">Timing: {time} on {date}</Text>
                <Text className="text-white text-lg my-2">Countdown: {Math.max(countdown / 1000, 0).toFixed(0)} seconds</Text>
                <Text className="text-white text-lg my-2">Description: {description}</Text>
                <InfoBox title={owner.username} subtitle="Owner" />
                <Text className="text-white text-lg my-2">Invitees:</Text>
                {invitees.map((invitee, index) => (
                    <InfoBox key={invitee.$id || index} title={invitee.username} subtitle="Invitee" />
                ))}
            </View>
        </SafeAreaView>
    );
};

export default LiveReadyCheck;
