import { View, Text } from 'react-native'
import React from 'react'
import SearchInput from "../../components/SearchInput";
import { SafeAreaView } from 'react-native-safe-area-context'


const Social = () => {
  return (
    <SafeAreaView className="bg-primary h-full">
      <Text className="text-white">Social</Text>
      <SearchInput />
    </SafeAreaView>
  )
}

export default Social