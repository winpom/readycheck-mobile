import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FriendsList, SearchInput } from "../../components";

const Social = () => {
  return (
    <SafeAreaView className="bg-primary h-[100vh] pt-10">
      <Text className="text-secondary text-3xl text-center mb-5">Social</Text>
      <View className="items-center">
        <SearchInput />
      </View>
      <FriendsList />
    </SafeAreaView>
  );
};

export default Social;