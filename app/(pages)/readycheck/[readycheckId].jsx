import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getReadyCheck, deleteReadyCheck, addOrUpdateRSVP } from "../../../lib/appwrite";
import { formatTiming } from "../../../utils/formatTiming";
import UserCard from "../../../components/UserCard";
import { useGlobalContext } from "../../../context/GlobalProvider";

const LiveReadyCheck = () => {
    const { readycheckId } = useLocalSearchParams();
    const [readycheck, setReadyCheck] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const { user } = useGlobalContext();
    const router = useRouter();

    // Track active RSVP status locally
    const [activeRSVP, setActiveRSVP] = useState("Pending");

    useEffect(() => {
        if (readycheckId) {
            getReadyCheck(readycheckId)
                .then(data => {
                    if (data) {
                        setReadyCheck(data);
                        const userRSVP = data.rsvps.find(rsvp => rsvp.userId === user?.$id)?.status || "Pending";
                        setActiveRSVP(userRSVP);
                    } else {
                        setReadyCheck(null);
                    }
                })
                .catch(error => console.error("Error fetching readycheck:", error));
        }
    }, [readycheckId]);

    useEffect(() => {
        if (!readycheck) return;

        const calculateTimeLeft = () => {
            const now = new Date();
            const eventTime = new Date(readycheck.timing);
            const difference = eventTime - now;
        
            if (difference <= -86400000) {
                setTimeLeft("Expired");
            } else if (difference <= 0) {
                setTimeLeft("It's Time!");
                return;
            } else {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
                setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            }
        };

        calculateTimeLeft();
        const intervalId = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(intervalId);
    }, [readycheck]);

    const handleRSVP = async (status) => {
        try {
            await addOrUpdateRSVP(readycheckId, user.$id, status);
            setActiveRSVP(status); // Set active button
            Alert.alert("RSVP updated", `You have responded with "${status}"`);
            router.replace(`/readycheck/${readycheckId}`);
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
                        router.replace("/");
                    } catch (error) {
                        console.error("Failed to delete ReadyCheck:", error);
                    }
                },
            },
        ]);
    };

    // Group invitees by RSVP status
    const pendingUsers = readycheck?.invitees.filter(invitee =>
        !readycheck.rsvps.some(rsvp => rsvp.userId === invitee.$id)
    ) || [];

    const rsvpGroups = {
        "I'm Ready": readycheck?.rsvps.filter(rsvp => rsvp.status === "I'm Ready").map(rsvp => rsvp.userId) || [],
        "Maybe": readycheck?.rsvps.filter(rsvp => rsvp.status === "Maybe").map(rsvp => rsvp.userId) || [],
        "I can't": readycheck?.rsvps.filter(rsvp => rsvp.status === "I can't").map(rsvp => rsvp.userId) || [],
    };

    const { title, timing, description, owner, invitees } = readycheck || {};
    const { time, date } = formatTiming(timing);
    const isOwner = owner?.$id === user?.$id;
    const isInvitee = invitees?.some(invitee => invitee.$id === user?.$id);

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
                                    <TouchableOpacity onPress={() => router.push(`/edit/${readycheckId}`)}>
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

                        <Text className="text-white text-lg my-2">Invitees (Pending):</Text>
                        {pendingUsers.map((user) => (
                            <Text key={user.$id} className="text-gray-400 ml-4">{user.username}</Text>
                        ))}

                        {(isOwner || isInvitee) && (
                            <View className="mt-5">
                                <Text className="text-white text-lg">RSVP:</Text>
                                <View className="flex-row gap-4 mt-2">
                                    <TouchableOpacity
                                        onPress={() => handleRSVP("I'm Ready")}
                                        className={`px-4 py-2 rounded ${activeRSVP === "I'm Ready" ? "bg-green-500" : "bg-gray-700"}`}
                                    >
                                        <Text className="text-white">I'm Ready</Text>
                                    </TouchableOpacity>
                                    {rsvpGroups["I'm Ready"].map((userId) => (
                                        <Text key={userId} className="text-gray-400 ml-4">{userId}</Text>
                                    ))}
                                </View>
                                <View className="flex-row gap-4 mt-2">
                                    <TouchableOpacity
                                        onPress={() => handleRSVP("Maybe")}
                                        className={`px-4 py-2 rounded ${activeRSVP === "Maybe" ? "bg-yellow-500" : "bg-gray-700"}`}
                                    >
                                        <Text className="text-white">Maybe</Text>
                                    </TouchableOpacity>
                                    {rsvpGroups["Maybe"].map((userId) => (
                                        <Text key={userId} className="text-gray-400 ml-4">{userId}</Text>
                                    ))}
                                </View>
                                <View className="flex-row gap-4 mt-2">
                                    <TouchableOpacity
                                        onPress={() => handleRSVP("I can't")}
                                        className={`px-4 py-2 rounded ${activeRSVP === "I can't" ? "bg-red-500" : "bg-gray-700"}`}
                                    >
                                        <Text className="text-white">Can't Join</Text>
                                    </TouchableOpacity>
                                    {rsvpGroups["I can't"].map((userId) => (
                                        <Text key={userId} className="text-gray-400 ml-4">{userId}</Text>
                                    ))}
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
