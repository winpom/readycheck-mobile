import { View, Image, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOwnedReadyChecks, getUserById, addFriend, removeFriend, isFriend } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
import ReadyCheckCard from '../../components/ReadyCheckCard';
import InfoBox from '../../components/InfoBox';
import RCEmptyState from '../../components/RCEmptyState';

const OtherProfile = () => {
  const { userId } = useLocalSearchParams(); 
  const { user: currentUser } = useGlobalContext();
  const [profileUser, setProfileUser] = useState(null);
  const [isFriendStatus, setIsFriendStatus] = useState(false);
  const { data: activeReadychecks } = useAppwrite(() => getOwnedReadyChecks(userId));

  useEffect(() => {
    // Fetch the clicked user's profile
    getUserById(userId).then(setProfileUser);

    // Check if the clicked user is already a friend
    isFriend(currentUser.$id, userId).then(setIsFriendStatus);
  }, [userId, currentUser]);

  const handleAddFriend = async () => {
    try {
      await addFriend(currentUser.$id, userId);
      setIsFriendStatus(true);
      Alert.alert("Friend added!");
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to add friend.");
    }
  };

  const handleRemoveFriend = async () => {
    try {
      await removeFriend(currentUser.$id, userId);
      setIsFriendStatus(false);
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
              title={profileUser?.username}
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
            {!isFriendStatus ? (
              <TouchableOpacity onPress={handleAddFriend} className="mt-4 p-2 bg-blue-500 rounded">
                <Text className="text-center text-white">Add Friend</Text>
              </TouchableOpacity>
            ) : (
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