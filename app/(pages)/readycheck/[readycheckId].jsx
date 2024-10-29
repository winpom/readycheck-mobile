import { View, Text, Image, TouchableOpacity, FlatList, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getReadyCheck, deleteReadyCheck, updateRSVP } from "../../../lib/appwrite";
import { formatTiming } from "../../../utils/formatTiming";
import UserCard from "../../../components/UserCard";
import { useGlobalContext } from "../../../context/GlobalProvider";

const LiveReadyCheck = () => {
    const { readycheckId } = useLocalSearchParams();
    const [readycheck, setReadyCheck] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const { user } = useGlobalContext();
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

        calculateTimeLeft();
        const intervalId = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(intervalId);
    }, [readycheck]);

    const { title, timing, description, owner, invitees, rsvps = [] } = readycheck || {};
    const { time, date } = formatTiming(timing);
    const isOwner = owner?.$id === user?.$id;
    const isInvitee = invitees?.some(invitee => invitee.$id === user?.$id);

    const userRSVP = rsvps.find(rsvp => rsvp.userId === user?.$id)?.response || "Pending";

    const handleRSVP = async (response) => {
        try {
            await updateRSVP(readycheckId, user.$id, response);
            setReadyCheck(prev => ({
                ...prev,
                rsvps: prev.rsvps.map(rsvp =>
                    rsvp.userId === user.$id ? { ...rsvp, response } : rsvp
                )
            }));
            Alert.alert("RSVP updated", `You have responded with "${response}"`);
        } catch (error) {
            console.error("Failed to update RSVP:", error);
            Alert.alert("Error", "Failed to update RSVP.");
        }
    };

    const handleDelete = () => {
        Alert.alert("Confirm Delete", "Are you sure you want to delete this ReadyCheck?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteReadyCheck(readycheckId);
                        router.replace("/"); // Navigate back to the main page or any other appropriate page
                    } catch (error) {
                        console.error("Failed to delete ReadyCheck:", error);
                    }
                },
            },
        ]);
    };

    const handleEdit = () => {
        router.push(`/edit/${readycheckId}`);
    };

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
                            {isOwner && (
                                <View className="flex-row gap-4">
                                    <TouchableOpacity onPress={handleEdit}>
                                        <Text className="text-blue-500 text-lg">Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleDelete}>
                                        <Text className="text-red-500 text-lg">Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <Text className="text-secondary text-3xl my-2 text-center">{title}</Text>
                        <Text className="text-white text-lg my-2 text-center">{timeLeft}</Text>
                        <Text className="text-white text-lg my-2">Owner: {owner?.username}</Text>
                        <Text className="text-white text-lg my-2">When: {time} on {date}</Text>
                        <Text className="text-white text-lg my-2">Description: {description}</Text>
                        <Text className="text-white text-lg my-2">Invitees:</Text>
                        {(isOwner || isInvitee) && (
                            <View className="mt-5">
                                <Text className="text-white text-lg">RSVP:</Text>
                                <Text className="text-gray-400 mb-2">Current Status: {userRSVP}</Text>
                                <View className="flex-row gap-4">
                                    <TouchableOpacity onPress={() => handleRSVP("I'm Ready")}>
                                        <Text className="text-green-500">I'm Ready</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleRSVP("Maybe")}>
                                        <Text className="text-yellow-500">Maybe</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleRSVP("I can't")}>
                                        <Text className="text-red-500">I Can't</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
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
