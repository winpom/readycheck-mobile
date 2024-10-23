import { View, Image, Text, FlatList, TouchableOpacity } from "react-native"
import { React, useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router";

import { getOwnedReadyChecks, getInvitedReadyChecks } from "../../lib/appwrite"
import useAppwrite from "../../lib/useAppwrite"
import { useGlobalContext } from "../../context/GlobalProvider"

import ReadyCheckCard from "../../components/ReadyCheckCard"
import InfoBox from "../../components/InfoBox"
import RCEmptyState from "../../components/RCEmptyState"
import { FormField } from "../../components"

import { icons } from "../../constants"

const ownedProfile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const { data: activeReadychecks } = useAppwrite(() => getOwnedReadyChecks(user.$id));

  const [uploading, setUploading] = useState(false)
  const [editing, isEditing] = useState(false)

  const [form, setForm] = useState({
    first: "",
    last: "",
    profileImage: "",
  })

  return (
    <SafeAreaView className="bg-primary h-full">
      {/* Header with Back and Edit Buttons */}
      <View className="flex-row justify-between items-center px-4 py-4">
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()}>
        <Text className="text-white text-lg">Back</Text>
        </TouchableOpacity>

        {/* Edit Button */}
        <TouchableOpacity onPress={() => {
          console.log("Edit button pressed");
        }}>
          <Text className="text-white text-lg">Edit</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={activeReadychecks}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <ReadyCheckCard readycheck={item} />
        )}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-5 px-4">
            <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />

              {/* <View className="mt-7 space-y-2">
                <Text className="text-base text-gray-100 font-pmedium">
                  Upload Profile Photo
                </Text>
                <TouchableOpacity>
                  {form.profileImage ? (
                    <Image
                      source={{ uri: form.image.uri }}
                      className="w-full h-64 rounded-2xl"
                      resizeMode={ResizeMode.COVER}
                    />
                  ) : (
                    <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
                      <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                        <Image
                          source={icons.upload}
                          resizeMode="contain"
                          className="w-1/2 h-1/2" />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View> */}

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

export default ownedProfile