import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, RefreshControl, StatusBar, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../context/GlobalProvider";
import { getFriends } from "../lib/appwrite";
import useAppwrite from "../lib/useAppwrite";
import UserCard from "./UserCard";
import { useSocket } from "../context/SocketContext";
import { images } from "../constants";

const FriendsList = () => {
  const { user } = useGlobalContext();
  const socket = useSocket();
  const { data: friends, refetch } = useAppwrite(() => getFriends(user.$id)); // `refetch` is defined here
  const [refreshing, setRefreshing] = useState(false);

  // Refetch friend data on refresh action
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useEffect(() => {
    if (!socket) return;

    // Join the friendsRoom for real-time updates
    socket.emit("joinFriendsRoom");
    console.log("Joined friendsRoom for real-time updates");

    // Listen for friendAdded and friendRemoved events
    socket.on("friendAdded", ({ friendId, userId }) => {
      if (userId === user.$id) handleRefresh();
    });

    socket.on("friendRemoved", ({ friendId, userId }) => {
      if (userId === user.$id) handleRefresh();
    });

    // Cleanup listeners on component unmount
    return () => {
      socket.off("friendAdded");
      socket.off("friendRemoved");
    };
  }, [socket, user.$id, handleRefresh]);

  return (
    <SafeAreaView className="bg-primary h-full">
      <StatusBar backgroundColor="#161622" style="light" />
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id || item.$id}
        renderItem={({ item }) => <UserCard user={item} />}
        ListHeaderComponent={() => (
          <View className="mb-2 px-4">
            <Text className="text-gray-100 text-lg font-pregular mb-2">
              Friends List
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="justify-center items-center px-4">
            <Image
              source={images.empty}
              className="w-[270px] h-[215px]"
              resizeMode="contain"
            />
            <Text className="text-2xl text-center font-psemibold text-white mt-2">
              No Friends Added
            </Text>
            <Text className="font-pmedium text-sm text-gray-100">
              Add a friend to get started!
            </Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    </SafeAreaView>
  );
};

export default FriendsList;