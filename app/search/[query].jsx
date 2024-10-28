import { View, Text, FlatList, TouchableOpacity } from "react-native"
import { React, useEffect } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from 'expo-router';

import SearchEmptyState from "../../components/SearchEmptyState"
import UserCard from "../../components/UserCard"
import { searchUsers } from "../../lib/appwrite"
import useAppwrite from "../../lib/useAppwrite"
import { useLocalSearchParams } from "expo-router"
import SearchInput from "../../components/SearchInput"

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
          <SearchEmptyState
            title="No Users Found"
            subtitle="Try searching something else" />
        )}
      />
    </SafeAreaView>
  )
}

export default Search