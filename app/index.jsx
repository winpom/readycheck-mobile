import { StatusBar } from "expo-status-bar";
import { Text, View, Image, ScrollView } from "react-native";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "../constants";
import { CustomButton } from "../components";


export default function App() {
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
          <Text className="text-sm font-pregular text-gray-100 mb-3 text-center">
            is as simple as a ✅
          </Text>
          <CustomButton
            title="Continue with Email"
            handlePress={() => router.push('/sign-in')}
            containerStyles="w-full mt-7"
          />
        </View>
      </ScrollView>

      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
}