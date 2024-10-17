import { View, Text, FlatList, Image, RefreshControl, Alert } from "react-native"
import { React, useState, useEffect } from "react"
import { SafeAreaView } from "react-native-safe-area-context"

import EmptyState from "../../components/EmptyState"
import ReadyCheckCard from "../../components/ReadyCheckCard"
import { getReadyChecks } from "../../lib/appwrite"
import { images } from "../../constants"
import useAppwrite from "../../lib/useAppwrite"

const Home = () => {
  const { data: readychecks, refetch } = useAppwrite(getReadyChecks)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={readychecks}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <ReadyCheckCard readycheck={item} />
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  Welcome Back
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  Win
                </Text>
              </View>
              <View className="mt-1.5">
                <Image
                  source={images.logoSmall}
                  className="w-9 h-10"
                  resizeMode="contain"
                />
              </View>
            </View>

            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-gray-100 text-lg font-pregular mb-3">
                Upcoming ReadyChecks
              </Text>
            </View>

          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Upcoming ReadyChecks"
            subtitle="Create one to get started!" />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  )
}

export default Home