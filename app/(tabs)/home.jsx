import { View, Text, FlatList, Image, RefreshControl, Alert } from "react-native"
import { React, useState, useEffect } from "react"
import { SafeAreaView } from "react-native-safe-area-context"

import RCEmptyState from "../../components/RCEmptyState"
import Upcoming from "../../components/Upcoming"
import ReadyCheckCard from "../../components/ReadyCheckCard"
import { getReadyChecks, getLatestReadyChecks } from "../../lib/appwrite"
import { images } from "../../constants"
import useAppwrite from "../../lib/useAppwrite"
import { useGlobalContext } from "../../context/GlobalProvider"

const Home = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const { data: readychecks, refetch } = useAppwrite(getReadyChecks)
  const { data: latestReadychecks } = useAppwrite(getLatestReadyChecks)

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
          <View className="my-6 px-4 space-y-2">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  Welcome Back,
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  {user?.username}
                </Text>
              </View>
              <View className="mt-1.5">
                <Image
                  source={images.logoSmall}
                  className="w-12 h-12"
                  resizeMode="contain"
                />
              </View>
            </View>

            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-gray-100 text-lg font-pregular mb-2">
                Upcoming ReadyChecks
              </Text>

              <Upcoming readychecks={latestReadychecks ?? []}/>

            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <RCEmptyState
            title="No Upcoming ReadyChecks"
            subtitle="Create one to get started!" />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  )
}

export default Home