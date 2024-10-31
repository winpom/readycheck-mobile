import { View, Text } from "react-native"
import React from "react"
import { SafeAreaView } from "react-native-safe-area-context"

import { FriendsList, SearchInput } from "../../components";


const Social = () => {
  return (
    <SafeAreaView className="bg-primary h-full pt-10">
      <Text className="text-secondary text-3xl text-center mb-5">Social</Text>
      <View className="items-center">
        <SearchInput />
      </View>
      <FriendsList />
    </SafeAreaView>
  )
}

export default Social