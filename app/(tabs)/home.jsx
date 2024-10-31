import { View, Text, FlatList, Image, RefreshControl, TouchableOpacity } from "react-native"
import { React, useState, useEffect } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar";

import { RCEmptyState, Upcoming, ReadyCheckCard } from "../../components";
import { getReadyChecks, getLatestReadyChecks } from "../../lib/appwrite"
import { images } from "../../constants"
import { icons } from "../../constants"
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
    <SafeAreaView className="bg-primary h-full pt-5">
      <StatusBar backgroundColor="#161622" style="light" />
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
                <TouchableOpacity>
                  <Image
                    source={icons.notifications}
                    className="w-7 h-7"
                    resizeMode="contain"
                    tintColor="#CDCDE0"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-gray-100 text-lg font-pregular mb-2">
                Upcoming ReadyChecks
              </Text>

              <Upcoming readychecks={latestReadychecks ?? []} />

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