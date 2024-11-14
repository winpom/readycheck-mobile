import { View, Image, Text, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

import { getOwnedReadyChecks, getFriends } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
import { ReadyCheckCard, InfoBox, RCEmptyState } from '../../components';
import { icons } from '../../constants';

const OwnedProfile = () => {
  const { user } = useGlobalContext();
  const { data: activeReadychecks } = useAppwrite(() => getOwnedReadyChecks(user.$id));
  const { data: friends } = useAppwrite(() => getFriends(user.$id));

  useFocusEffect(
    useCallback(() => {
    }, [user.avatar, user.displayName])
  );

  return (
    <SafeAreaView className="bg-primary h-full">
      {/* Header with Back and Edit Buttons */}
      <View className="flex-row justify-between items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-white text-lg">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace("/editProfile")}>
          <Text className="text-white text-lg">Edit</Text>
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
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>
            <InfoBox
              title={user?.displayName || user?.username}
              subtitle={user?.displayName ? user?.username : undefined}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />
            <View className="mt-5 flex-row items-center">
              <InfoBox
                title={activeReadychecks?.length || 0}
                subtitle="ReadyChecks"
                containerStyles="mr-10"
                titleStyles="text-xl"
              />
              <InfoBox
                title={friends?.length || 0}
                subtitle="Friends"
                titleStyles="text-xl"
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <RCEmptyState
            title="No Active ReadyChecks"
            subtitle="Create one to get started!"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default OwnedProfile;