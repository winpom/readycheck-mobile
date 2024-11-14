import { View, Image, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOwnedReadyChecks, getUserById, requestFriend, removeFriend, acceptFriendRequest, rejectFriendRequest } from '../../../lib/appwrite';
import useAppwrite from '../../../lib/useAppwrite';
import { useGlobalContext } from '../../../context/GlobalProvider';
import ReadyCheckCard from '../../../components/ReadyCheckCard';
import InfoBox from '../../../components/InfoBox';
import RCEmptyState from '../../../components/RCEmptyState';
import { useSocket } from '../../../context/SocketContext';

const OtherProfile = () => {
  const { userId } = useLocalSearchParams();
  const { user: currentUser, setCurrentUser } = useGlobalContext();
  const socket = useSocket();
  const [profileUser, setProfileUser] = useState(null);
  const [relationshipStatus, setRelationshipStatus] = useState(null);
  const { data: activeReadychecks } = useAppwrite(() => getOwnedReadyChecks(userId));

  // console.log(userId)
  // console.log(currentUser.$id)

  const fetchProfileAndStatus = async () => {
    const fetchedUser = await getUserById(userId);
    setProfileUser(fetchedUser);

    if (currentUser?.friends?.includes(fetchedUser.$id)) {
      setRelationshipStatus("friends");
    } else if (currentUser?.friendRequests?.includes(fetchedUser.$id)) {
      setRelationshipStatus("requestReceived");
    } else if (fetchedUser?.friendRequests?.includes(currentUser?.$id)) {
      setRelationshipStatus("pending");
    } else {
      setRelationshipStatus("none");
    }
  };

  useEffect(() => {
    fetchProfileAndStatus();
  }, [userId, currentUser]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinUserRoom", currentUser.$id); // Join user's own room
    console.log(`Socket joining room for User ID: ${currentUser.$id}`);

    socket.on("friendAdded", ({ friendId }) => {
      if (friendId === userId) setRelationshipStatus("friends");
    });

    socket.on("friendRemoved", ({ friendId }) => {
      if (friendId === userId) setRelationshipStatus("none");
    });

    return () => {
      console.log(`Socket leaving room for User ID: ${currentUser.$id}`);
      socket.emit("leaveUserRoom", currentUser.$id);
      socket.off("friendAdded");
      socket.off("friendRemoved");
    };
  }, [socket, userId, currentUser]);

  const handleRequestFriend = async () => {
    try {
      await requestFriend(currentUser.$id, userId);
      setRelationshipStatus("pending");
      Alert.alert("Friend request sent!");
      
      if (socket) {
        socket.emit("friendRequestSent", currentUser.$id, userId);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to send friend request.");
    }
  };

  const handleAcceptFriendRequest = async () => {
    try {
      await acceptFriendRequest(currentUser.$id, userId);
      const updatedCurrentUser = await getUserById(currentUser.$id);
      setCurrentUser(updatedCurrentUser);
      setRelationshipStatus("friends");
      Alert.alert("Friend request accepted!");

      if (socket) {
        socket.emit("friendAdded", currentUser.$id, userId);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to accept friend request.");
    }
  };

  const handleRejectFriendRequest = async () => {
    try {
      await rejectFriendRequest(currentUser.$id, userId);
      const updatedCurrentUser = await getUserById(currentUser.$id);
      setCurrentUser(updatedCurrentUser);
      setRelationshipStatus("none");
      Alert.alert("Friend request rejected.");

      if (socket) {
        socket.emit("friendRequestRejected", currentUser.$id, userId);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to reject friend request.");
    }
  };

  const handleRemoveFriend = () => {
    Alert.alert(
      "Remove Friend",
      "Are you sure you want to remove this friend?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeFriend(currentUser.$id, userId);
              const updatedCurrentUser = await getUserById(currentUser.$id);
              setCurrentUser(updatedCurrentUser);
              setRelationshipStatus("none");
              Alert.alert("Friend removed.");

              if (socket) {
                socket.emit("friendRemoved", currentUser.$id, userId);
              }
            } catch (error) {
              console.error(error);
              Alert.alert("Failed to remove friend.");
            }
          },
        },
      ]
    );
  };

  if (!profileUser) return null;

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="flex-row justify-between items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-white text-lg">Back</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={activeReadychecks}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <ReadyCheckCard readycheck={item} />}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-5 px-4">
            <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
              <Image source={{ uri: profileUser?.avatar }} className="w-[90%] h-[90%] rounded-lg" resizeMode="cover" />
            </View>
            <InfoBox title={profileUser?.displayName || profileUser?.username} containerStyles="mt-5" titleStyles="text-lg" />
            <View className="mt-5 flex-row">
              <InfoBox title={activeReadychecks?.length || 0} subtitle="ReadyChecks" containerStyles="mr-10" titleStyles="text-xl" />
              <InfoBox title={profileUser?.friends?.length || 0} subtitle="Friends" titleStyles="text-xl" />
            </View>

            {relationshipStatus === "none" && (
              <TouchableOpacity onPress={handleRequestFriend} className="mt-4 p-2 bg-blue-500 rounded">
                <Text className="text-center text-white">Add Friend</Text>
              </TouchableOpacity>
            )}
            {relationshipStatus === "pending" && (
              <TouchableOpacity className="mt-4 p-2 bg-gray-500 rounded">
                <Text className="text-center text-white">Pending</Text>
              </TouchableOpacity>
            )}
            {relationshipStatus === "requestReceived" && (
              <>
                <TouchableOpacity onPress={handleAcceptFriendRequest} className="mt-4 p-2 bg-green-500 rounded">
                  <Text className="text-center text-white">Accept Friend Request</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRejectFriendRequest} className="mt-2 p-2 bg-red-500 rounded">
                  <Text className="text-center text-white">Reject Friend Request</Text>
                </TouchableOpacity>
              </>
            )}
            {relationshipStatus === "friends" && (
              <TouchableOpacity onPress={handleRemoveFriend} className="mt-4 p-2 bg-red-500 rounded">
                <Text className="text-center text-white">Remove Friend</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          <RCEmptyState title="No Active ReadyChecks" subtitle="This user has no active ReadyChecks." />
        )}
      />
    </SafeAreaView>
  );
};

export default OtherProfile;