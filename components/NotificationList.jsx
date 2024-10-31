import { View, FlatList, Text, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { getNotifications } from "../lib/appwrite";
import { NotificationCard } from "./NotificationCard";

import { useGlobalContext } from "../context/GlobalProvider"

const NotificationList = () => {
    const { user } = useGlobalContext();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const latestNotifications = await getNotifications();
                setNotifications(latestNotifications);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user]);

    const handlePress = async (notification) => {
        try {
            //   await markNotificationAsRead(notification.$id);

            if (notification.type === "ReadyCheck") {
                router.push(`/readycheck/${notification.readycheckId}`);
            } else if (notification.type === "FriendInvite") {
                router.push(`/profile/${notification.senderId}`);
            }

            setNotifications((prev) =>
                prev.map((n) => (n.$id === notification.$id ? { ...n, status: "read" } : n))
            );
        } catch (error) {
            console.error("Error marking notification as read:", error.message);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-primary">
                <ActivityIndicator size="large" color="#4B5563" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-primary p-4">
                <Text className="text-white text-center">Error: {error}</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={notifications}
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => (
                <NotificationCard
                    notification={item}
                    onPress={() => handlePress(item)}
                    isUnread={item.status === "unread"} // Pass read/unread status
                />
            )}
            contentContainerStyle={{ padding: 20, backgroundColor: "#1F2937" }}
            ItemSeparatorComponent={() => <View className="h-4" />}
        />
    );
};

export default NotificationList;