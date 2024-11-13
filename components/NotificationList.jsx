import { View, FlatList, Text, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { getNotifications, markNotificationAsRead } from "../lib/appwrite";
import NotificationCard from "./NotificationCard";
import { useGlobalContext } from "../context/GlobalProvider";

const NotificationList = () => {
    const { user } = useGlobalContext();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    const [loadedCount, setLoadedCount] = useState(7); // Limit initially loaded notifications
    const [hasMore, setHasMore] = useState(true); // Track if more notifications are available
    const [isLoadingMore, setIsLoadingMore] = useState(false); // Loading state for more items

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const fetchNotifications = async (loadMore = false) => {
        try {
            setLoading(true);
            const latestNotifications = await getNotifications(user.$id);
            const sortedNotifications = latestNotifications.sort(
                (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            );

            if (loadMore) {
                setNotifications((prev) => [
                    ...prev,
                    ...sortedNotifications.slice(prev.length, prev.length + 7),
                ]);
            } else {
                setNotifications(sortedNotifications.slice(0, loadedCount));
            }

            setHasMore(sortedNotifications.length > notifications.length + 7);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    const loadMoreNotifications = () => {
        if (hasMore && !isLoadingMore) {
            setIsLoadingMore(true);
            setLoadedCount((prevCount) => prevCount + 7);
            fetchNotifications(true);
        }
    };

    const handlePress = async (notification) => {
        try {
            await markNotificationAsRead(notification.id);
            if (notification.type === "readyCheckInvite") {
                router.push(`/readycheck/${notification.readycheckId.$id}`);
            } else if (notification.type === "friendInvite") {
                router.push(`/user/${notification.senderId.$id}`);
            }

            setNotifications((prev) =>
                prev.map((n) => (n.$id === notification.$id ? { ...n, status: "read" } : n))
            );
        } catch (error) {
            console.error("Error marking notification as read:", error.message);
        }
    };

    if (loading && notifications.length === 0) {
        return (
            <View className="flex-1 justify-center items-center bg-primary">
                <ActivityIndicator size={40} color="#4B5563"/>
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
            keyExtractor={(item, index) => item.$id || item.id || index.toString()}
            renderItem={({ item }) => (
                <NotificationCard
                    notification={item}
                    onPress={() => handlePress(item)}
                    isUnread={item.status === "unread"}
                />
            )}
            contentContainerStyle={{ padding: 5, backgroundColor: "#1F2937" }}
            ItemSeparatorComponent={() => <View className="h-4" />}
            onEndReached={loadMoreNotifications} // Load more when the end is reached
            onEndReachedThreshold={0.5}
            ListFooterComponent={
                hasMore && isLoadingMore ? <ActivityIndicator size="small" color="#4B5563" /> : null
            }
        />
    );
};

export default NotificationList;