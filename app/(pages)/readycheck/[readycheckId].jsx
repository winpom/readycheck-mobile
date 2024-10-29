import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getReadyCheck } from "../../../lib/appwrite";
import { formatTiming } from "../../../utils/formatTiming";
import UserCard from "../../../components/UserCard";

const LiveReadyCheck = () => {
    const { readycheckId } = useLocalSearchParams();
    const [readycheck, setReadyCheck] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (readycheckId) {
            getReadyCheck(readycheckId)
                .then(setReadyCheck)
                .catch((error) => console.error(error));
        }
    }, [readycheckId]);

    useEffect(() => {
        if (!readycheck) return;

        const calculateTimeLeft = () => {
            const now = new Date();
            const eventTime = new Date(readycheck.timing);
            const difference = eventTime - now;

            if (difference <= 0) {
                setTimeLeft("It's Time!");
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };

        calculateTimeLeft(); // initial calculation

        const intervalId = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(intervalId); // cleanup interval on component unmount
    }, [readycheck]);

    if (!readycheck) return null;

    const { title, timing, description, owner, invitees } = readycheck;
    const { time, date } = formatTiming(timing);

    return (
        <SafeAreaView className="bg-primary h-full pt-5">
            <FlatList
                data={invitees}
                keyExtractor={(item) => item.id || item.$id}
                renderItem={({ item }) => <UserCard user={item} />}
                ListHeaderComponent={() => (
                    <View className="px-4">
                        <View className="flex-row justify-between items-center px-4 py-4">
                            <TouchableOpacity onPress={() => router.back()}>
                                <Text className="text-white text-lg">Back</Text>
                            </TouchableOpacity>
                        </View>
                        <Text className="text-secondary text-3xl my-2 text-center">{title}</Text>
                        <Text className="text-white text-lg my-2 text-center">
                            {timeLeft}
                        </Text>
                        <Text className="text-white text-lg my-2">Owner: {owner.username}</Text>
                        <Text className="text-white text-lg my-2">When: {time} on {date}</Text>
                        <Text className="text-white text-lg my-2">Description: {description}</Text>
                        <Text className="text-white text-lg my-2">Invitees:</Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View className="justify-center items-center px-4">
                        <Text className="text-lg text-center font-psemibold text-white mt-2">
                            No Invites Sent
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default LiveReadyCheck;
