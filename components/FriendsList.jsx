import { View, Text, FlatList, RefreshControl, Alert, StatusBar, Image } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../context/GlobalProvider";
import { getFriends } from "../lib/appwrite";
import useAppwrite from "../lib/useAppwrite";
import UserCard from "./UserCard";

import { images } from "../constants";

const FriendsList = () => {
  const { user } = useGlobalContext();
  const { data: friends, refetch } = useAppwrite(() => getFriends(user.$id));

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <StatusBar backgroundColor="#161622" style="light" />
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id || item.$id} // Ensure a unique key, fallback to item.$id if necessary
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
};

export default FriendsList;