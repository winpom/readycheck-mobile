import { StatusBar } from "expo-status-bar";
import { Text, View, Image, ScrollView } from "react-native";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "../constants";
import { CustomButton } from "../components";

import { useGlobalContext } from "../context/GlobalProvider";

export default function App() {
  const { isLoading, isLoggedIn } = useGlobalContext();

  if (!isLoading && isLoggedIn) return <Redirect href="/home" />

  return (
    <SafeAreaView className="bg-primary h-full" >
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="w-full justify-center items-center h-[85vh] px-5">
          <Image
            source={images.logo}
            className="w-[280px] h-[84px]"
            resizeMode="contain"
          />
          <Image
            source={images.cards}
            className="max-w-[380px] w-full h-[280px]"
            resizeMode="contain"
          />
          <View className="relative mt-5">
            <Text className="text-2xl text-white font-bold text-center">
              Be Ready for Anything with{" "}
              <Text className="text-secondary-200">ReadyCheck</Text>
            </Text>
          </View>
          <Text className="text-sm font-pregular text-gray-100 mt-3 text-center">
            Where seeing who's ready
          </Text>
          <View className="flex-row justify-center items-center mb-3">
            <Text className="text-sm font-pregular text-gray-100">
              is as simple as a
            </Text>
            <Image
              source={images.logoSmall}
              className="w-5 h-5 ml-1"
              resizeMode="contain"
            />
          </View>
          <CustomButton
            title="Continue with Email"
            handlePress={() => router.push("/sign-in")}
            containerStyles="w-full mt-7"
          />
        </View>
      </ScrollView>

      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
}