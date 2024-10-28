import { View, Text, FlatList, TouchableOpacity, Image } from "react-native"
import { React, useEffect } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from 'expo-router';

import UserCard from "../../components/UserCard"
import { searchUsers } from "../../lib/appwrite"
import useAppwrite from "../../lib/useAppwrite"
import { useLocalSearchParams } from "expo-router"
import SearchInput from "../../components/SearchInput"

import { images } from "../../constants"

const Search = () => {
  const { query } = useLocalSearchParams()
  const { data: users, refetch } = useAppwrite(() => searchUsers(query));

  useEffect(() => {
    refetch()
  }, [query])

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={users}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <UserCard user={item} />
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-4">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-white text-right text-lg">Back</Text>
            </TouchableOpacity>
            <Text className="font-pmedium text-sm text-gray-100">
              Search Results
            </Text>
            <Text className="text-2xl font-psemibold text-white">
              {query}
            </Text>
            <View className="mt-6 mb-8">
              <SearchInput initialQuery={query} />
            </View>
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
              No Users Found
            </Text>
            <Text className="font-pmedium text-sm text-gray-100">
              Try searching something else
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

export default Search