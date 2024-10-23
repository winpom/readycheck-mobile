import { View, Image, Text, FlatList, TouchableOpacity } from "react-native"
import React from 'react'
import { Link } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar";
import { router } from 'expo-router'

import { signOut } from "../../lib/appwrite"
import useAppwrite from "../../lib/useAppwrite"
import { icons } from "../../constants"



const Settings = () => {

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLoggedIn(false)

    router.replace("/sign-in")
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <Text className="text-secondary text-3xl mt-10">Settings</Text>
      <Link href="/profile" className="text-lg font-psemibold text-white">Profile</Link>
      <TouchableOpacity
        className="w-full mb-10 flex-row items-center"
        onPress={logout}
      >
        <View className="flex-row items-center">
          <Image
            source={icons.logout}
            className="w-5 h-5 mr-2" // Add some margin to the right of the icon
            resizeMode="contain"
          />
          <Text className="text-lg font-psemibold text-white">
            Logout
          </Text>
        </View>
      </TouchableOpacity>
      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  )
}

export default Settings