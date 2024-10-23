import { View, Image, Text, FlatList, TouchableOpacity } from "react-native"
import { React } from "react"
import { SafeAreaView } from "react-native-safe-area-context"

import RCEmptyState from "../../components/RCEmptyState"
import { getOwnedReadyChecks, getInvitedReadyChecks } from "../../lib/appwrite"
import useAppwrite from "../../lib/useAppwrite"
import { useGlobalContext } from "../../context/GlobalProvider"

import ReadyCheckCard from "../../components/ReadyCheckCard"
import InfoBox from "../../components/InfoBox"


const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const { data: activeReadychecks } = useAppwrite(() => getOwnedReadyChecks(user.$id));

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={activeReadychecks}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <ReadyCheckCard readycheck={item} />
        )}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-12 px-4">
            <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>
            <InfoBox
              title={user?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />
            <View className="mt-5 flex-row">
              <InfoBox
                title={activeReadychecks?.length || 0}
                subtitle="ReadyChecks"
                containerStyles="mr-10"
                titleStyles="text-xl"
              />
              <InfoBox
                // title={friends?.length || 0}
                title="7"
                subtitle="Friends"
                titleStyles="text-xl"
              />
            </View>
            {/* <Upcoming readychecks={activeReadychecks ?? []} /> */}
          </View>

        )}
        ListEmptyComponent={() => (
          <RCEmptyState
            title="No Active ReadyChecks"
            subtitle="Create one to get started!" />
        )}
      />
    </SafeAreaView>
  )
}

export default Profile