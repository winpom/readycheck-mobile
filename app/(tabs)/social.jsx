import { View, Text } from 'react-native'
import React from 'react'
import SearchInput from "../../components/SearchInput";
import { SafeAreaView } from 'react-native-safe-area-context'


const Social = () => {
  return (
    <SafeAreaView className="bg-primary h-full pt-10">
      <Text className="text-secondary text-3xl text-center mb-8">Social</Text>
      <SearchInput />
    </SafeAreaView>
  )
}

export default Social