import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, RefreshControl, StatusBar, Image, ScrollView } from "react-native";
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
  const { data: friendsData, refetch } = useAppwrite(() => getFriends(user.$id));
  const [refreshing, setRefreshing] = useState(false);

  // Separate friends and friend requests from data
  const friends = friendsData?.friends || [];
  const friendRequests = friendsData?.friendRequests || [];

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

    // Listen for friend events
    socket.on("friendRequestSent", ({ friendId, userId }) => {
      if (userId === user.$id || friendId === user.$id) {
        handleRefresh();
      }
    });

    socket.on("friendAdded", ({ friendId, userId }) => {
      if (userId === user.$id || friendId === user.$id) {
        handleRefresh();
      }
    });

    socket.on("friendRemoved", ({ friendId, userId }) => {
      if (userId === user.$id || friendId === user.$id) {
        handleRefresh();
      }
    });

    // Cleanup listeners on component unmount
    return () => {
      socket.off("friendRequestSent");
      socket.off("friendAdded");
      socket.off("friendRemoved");
    };
  }, [socket, user.$id, handleRefresh]);

  return (
    <SafeAreaView className="bg-primary h-[100vh]">
      <StatusBar backgroundColor="#161622" style="light" />
      <View className="-mt-8 px-3">
        <ScrollView className="h-full">

          {/* Friends List Section */}
          <Text className="text-gray-100 text-lg font-pregular my-2">Friends List</Text>
          {friends.length > 0 ? (
            friends.map((item) => <UserCard key={item.$id} user={item} />)
          ) : (
            <View className="justify-center items-center px-4 my-2">
              <Image
                source={images.empty}
                className="w-[270px] h-[150px]"
                resizeMode="contain"
              />
              <Text className="text-xl text-center font-psemibold text-white mt-2">
                No Friends Added
              </Text>
              <Text className="font-pmedium text-xs text-gray-100">
                Add a friend to get started!
              </Text>
            </View>
          )}

          {/* Friend Requests Section */}
          <Text className="text-gray-100 text-base font-pregular mt-5 mb-1">Friend Requests</Text>
          {friendRequests.length > 0 ? (
            friendRequests.map((item) => <UserCard key={item.$id} user={item} />)
          ) : (
            <Text className="text-gray-400 text-center my-2">No friend requests.</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default FriendsList;