import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getReadyCheck, deleteReadyCheck, addOrUpdateRSVP } from "../../../lib/appwrite";
import { formatTiming } from "../../../utils/formatTiming";
import MiniUserCard from "../../../components/MiniUserCard";
import { useGlobalContext } from "../../../context/GlobalProvider";
import { useSocket } from '../../../context/SocketContext';

const LiveReadyCheck = () => {
    const socket = useSocket();
    const { readycheckId, refresh } = useLocalSearchParams();
    const [readycheck, setReadyCheck] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const { user } = useGlobalContext();
    const router = useRouter();
    const [activeRSVP, setActiveRSVP] = useState("Pending");

    // Socket connection setup for joining room and handling updates
    useEffect(() => {
        if (!socket || !readycheckId) return;

        // Join room for real-time updates
        socket.emit("joinReadyCheck", readycheckId);
        console.log(`Socket joining room for ReadyCheck ID: ${readycheckId}`);

        // Listen for real-time readyCheck updates
        socket.on("readyCheckUpdate", (updatedData) => {
            console.log("Received readyCheckUpdate event on client:", socket.id, updatedData);
            if (updatedData.readyCheckId === readycheckId) {
                console.log("Updating readycheck state with new data on client:", socket.id, updatedData.update);
                setReadyCheck(updatedData.update);
            }
        });

        // Listen for readyCheck deletion
        socket.on("readyCheckDeleted", (deletedReadyCheckId) => {
            if (deletedReadyCheckId === readycheckId) {
                // Alert.alert("This ReadyCheck has been deleted.");
                router.replace("/home"); // Redirect to home on deletion
            }
        });

        // Cleanup listeners on unmount
        return () => {
            console.log(`Socket leaving room for ReadyCheck ID: ${readycheckId}`);
            socket.emit("leaveReadyCheck", readycheckId);
            socket.off("readyCheckUpdate");
            socket.off("readyCheckDeleted");
        };
    }, [socket, readycheckId]);

    // Initial data fetch for the readyCheck details
    useEffect(() => {
        if (!readycheckId) return;

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
    }, [readycheckId]);

    // Timer countdown calculation for the readyCheck timing
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
            setActiveRSVP(status);
            console.log(`RSVP updated to "${status}" for ReadyCheck ID: ${readycheckId}`);

            const updatedReadyCheck = await getReadyCheck(readycheckId);
            console.log("Fetched updated ReadyCheck data:", updatedReadyCheck);
            setReadyCheck(updatedReadyCheck);

            // Emit RSVP update to notify other clients
            socket.emit("readyCheckUpdate", { readyCheckId: readycheckId, update: updatedReadyCheck });
            console.log("Emitting readyCheckUpdate event:", { readyCheckId: readycheckId, update: updatedReadyCheck });
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
                        socket.emit("readyCheckDeleted", readycheckId); // Notify other clients
                        router.replace("/home");
                    } catch (error) {
                        console.error("Failed to delete ReadyCheck:", error);
                    }
                },
            },
        ]);
    };

    // Check if data has loaded before rendering the UI
    if (!readycheck) {
        return (
            <SafeAreaView className="bg-primary h-full pt-5">
                <TouchableOpacity onPress={() => router.push("/home")}>
                    <Text className="text-white text-lg relative left-4">Home</Text>
                </TouchableOpacity>
                <Text className="text-white text-center mt-10">Loading...</Text>
            </SafeAreaView>
        );
    }

    // Group invitees by RSVP status with full user objects
    const pendingUsers = readycheck?.invitees.filter(invitee =>
        !readycheck.rsvps.some(rsvp => rsvp.userId === invitee.$id)
    ) || [];

    const rsvpGroups = {
        "I'm Ready": readycheck?.invitees.filter(invitee =>
            readycheck.rsvps.some(rsvp => rsvp.userId === invitee.$id && rsvp.status === "I'm Ready")
        ) || [],
        "Maybe": readycheck?.invitees.filter(invitee =>
            readycheck.rsvps.some(rsvp => rsvp.userId === invitee.$id && rsvp.status === "Maybe")
        ) || [],
        "I can't": readycheck?.invitees.filter(invitee =>
            readycheck.rsvps.some(rsvp => rsvp.userId === invitee.$id && rsvp.status === "I can't")
        ) || [],
    };

    // Include owner in RSVP groups if they have RSVP status
    const ownerRSVP = readycheck?.rsvps.find(rsvp => rsvp.userId === readycheck.owner.$id);
    if (ownerRSVP) {
        rsvpGroups[ownerRSVP.status] = [...rsvpGroups[ownerRSVP.status], readycheck.owner];
    }

    const { title, timing, description, owner, invitees } = readycheck || {};
    const { time, date } = formatTiming(timing);
    const isOwner = owner?.$id === user?.$id;
    const isInvitee = invitees?.some(invitee => invitee.$id === user?.$id);

    return (
        <SafeAreaView className="bg-primary h-full pt-5">
            <FlatList
                data={invitees}
                keyExtractor={(item) => item.id || item.$id}
                ListHeaderComponent={() => (
                    <View className="px-4">
                        <View className="flex-row justify-between items-center px-4 py-4">
                            <TouchableOpacity onPress={() => router.push("/home")}>
                                <Text className="text-white text-lg relative -left-4">Back</Text>
                            </TouchableOpacity>
                            {isOwner && (
                                <View className="flex-row gap-4">
                                    <TouchableOpacity onPress={() => router.push(`/edit/${readycheckId}`)}>
                                        <Text className="text-blue-500 text-lg relative -right-4">Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleDelete}>
                                        <Text className="text-red-500 text-lg relative -right-5">Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <Text className="text-secondary text-3xl mt-2 text-center">{title}</Text>
                        <Text className="text-gray-100 text-lg mb-2 text-center">{timeLeft}</Text>
                        <View className="flex-row">
                            <Text className="text-gray-400 text-lg mt-2">Owner:</Text>
                            <MiniUserCard key={readycheck.owner.$id} user={readycheck.owner} />
                        </View>
                        <View className="flex-row">
                            <Text className="text-gray-400 text-lg mt-2">When:</Text>
                            <Text className="text-white font-psemibold text-lg mt-2 ml-2">{time}, {date}</Text>
                        </View>
                        <View className="flex-row">
                            <Text className="text-gray-400 text-lg mt-2">Description:</Text>
                            <Text className="text-white font-psemibold text-lg mt-2 ml-2">{description}</Text>
                        </View>
                        <Text className="text-gray-400 text-lg mt-2">Invitees (Pending):</Text>
                        <View className="flex-row flex-wrap">
                            {pendingUsers.map((user) => (
                                <MiniUserCard key={user.$id} user={user} />
                            ))}
                        </View>
                        <Text className="text-gray-400 text-lg mt-3">RSVPs:</Text>
                        {(isOwner || isInvitee) && (
                            <View className="flex-row justify-between">
                                <View className="flex-column mt-2 items-center">
                                    <TouchableOpacity
                                        onPress={() => handleRSVP("I'm Ready")}
                                        className={`px-4 py-2 rounded w-[100px] h-[35px] ${activeRSVP === "I'm Ready" ? "bg-green-500" : "bg-gray-700"}`}
                                    >
                                        <Text className="text-white text-center">I'm Ready</Text>
                                    </TouchableOpacity>
                                    {rsvpGroups["I'm Ready"].map((user) => (
                                        <MiniUserCard key={user.$id} user={user} />
                                    ))}
                                </View>
                                <View className="flex-column mt-2 items-center">
                                    <TouchableOpacity
                                        onPress={() => handleRSVP("Maybe")}
                                        className={`px-4 py-2 rounded w-[100px] h-[35px] ${activeRSVP === "Maybe" ? "bg-yellow-500" : "bg-gray-700"}`}
                                    >
                                        <Text className="text-white text-center">Maybe</Text>
                                    </TouchableOpacity>
                                    {rsvpGroups["Maybe"].map((user) => (
                                        <MiniUserCard key={user.$id} user={user} />
                                    ))}
                                </View>
                                <View className="flex-column mt-2 items-center">
                                    <TouchableOpacity
                                        onPress={() => handleRSVP("I can't")}
                                        className={`px-4 py-2 rounded w-[100px] h-[35px] ${activeRSVP === "I can't" ? "bg-red-500" : "bg-gray-700"}`}
                                    >
                                        <Text className="text-white text-center">Can't Join</Text>
                                    </TouchableOpacity>
                                    {rsvpGroups["I can't"].map((user) => (
                                        <MiniUserCard key={user.$id} user={user} />
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
