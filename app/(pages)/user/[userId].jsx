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

const OtherProfile = () => {
  const { userId } = useLocalSearchParams(); 
  const { user: currentUser } = useGlobalContext();
  const [profileUser, setProfileUser] = useState(null);
  const [relationshipStatus, setRelationshipStatus] = useState(null); 
  const { data: activeReadychecks } = useAppwrite(() => getOwnedReadyChecks(userId));

  useEffect(() => {
    // Fetch the clicked user's profile and relationship status
    const fetchProfileAndStatus = async () => {
      const fetchedUser = await getUserById(userId);
      setProfileUser(fetchedUser);
      console.log("fetched", fetchedUser)
      console.log("current", currentUser)

      // Determine relationship status with profileUser
      if (currentUser.friends?.includes(userId)) {
        setRelationshipStatus("friends");
      } else if (currentUser.friendRequests?.includes(userId)) {
        setRelationshipStatus("requestReceived");
      } else if (fetchedUser.friendRequests?.includes(currentUser.$id)) {
        setRelationshipStatus("pending");
      } else {
        setRelationshipStatus("none");
      }
    };

    fetchProfileAndStatus();
  }, [userId, currentUser]);

  // Handlers for the different button actions
  const handleRequestFriend = async () => {
    try {
      await requestFriend(currentUser.$id, userId);
      setRelationshipStatus("pending");
      Alert.alert("Friend request sent!");
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to send friend request.");
    }
  };

  const handleAcceptFriendRequest = async () => {
    try {
      await acceptFriendRequest(currentUser.$id, userId);
      setRelationshipStatus("friends");
      Alert.alert("Friend request accepted!");
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to accept friend request.");
    }
  };

  const handleRejectFriendRequest = async () => {
    try {
      await rejectFriendRequest(currentUser.$id, userId);
      setRelationshipStatus("none");
      Alert.alert("Friend request rejected.");
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to reject friend request.");
    }
  };

  const handleRemoveFriend = async () => {
    try {
      await removeFriend(currentUser.$id, userId);
      setRelationshipStatus("none");
      Alert.alert("Friend removed.");
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to remove friend.");
    }
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
              <Image
                source={{ uri: profileUser?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>
            <InfoBox
              title={profileUser?.displayName || profileUser?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />
            <View className="mt-5 flex-row">
              <InfoBox
                title={activeReadychecks?.length || 0}
                subtitle="ReadyChecks"
                containerStyles="mr-10"
                titleStyles="text-xl"
              />
              <InfoBox
                title={profileUser?.friends?.length || 0}
                subtitle="Friends"
                titleStyles="text-xl"
              />
            </View>

            {/* Button display based on relationship status */}
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
          <RCEmptyState
            title="No Active ReadyChecks"
            subtitle="This user has no active ReadyChecks."
          />
        )}
      />
    </SafeAreaView>
  );
};

export default OtherProfile;