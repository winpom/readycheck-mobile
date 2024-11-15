import { View, Image, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import { signOut } from "../../lib/appwrite";
import { icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";

const Settings = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();

  const logout = async () => {
    if (!user) return;

    try {
      await signOut(user.$id);
      setUser(null);
      setIsLoggedIn(false);
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Sign Out Error", "An error occurred while signing out. Please try again.");
    }
  };

  return (
    <SafeAreaView className="bg-primary h-[100vh] pt-10">
      <Text className="text-secondary text-3xl text-center mb-8">Settings</Text>
      <View className="flex-col px-6">
        {/* Profile Link */}
        <Link href="/myProfile" className="flex-row items-center mb-6">
          <Image
            source={icons.profile}
            className="w-6 h-6 mr-3"
            resizeMode="contain"
          />
          <Text className="text-lg font-psemibold text-white">   Profile</Text>
        </Link>

        {/* Logout Button */}
        <TouchableOpacity
          className="flex-row items-center mb-6"
          onPress={logout}
        >
          <Image
            source={icons.logout}
            className="w-6 h-6 mr-3"
            resizeMode="contain"
          />
          <Text className="text-lg font-psemibold text-white">Logout</Text>
        </TouchableOpacity>
      </View>

      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
};

export default Settings;