import { View, Text, Image } from "react-native"
import { router } from "expo-router"
import React from "react"

import { images } from "../constants"
import CustomButton from "./CustomButton"

const RCEmptyState = ({ title, subtitle }) => {
    return (
        <View className="justify-center items-center px-4 -z-10">
            <Image
                source={images.empty}
                className="w-[240px] h-[150px] z-1"
                resizeMode="contain"
            />
            <Text className="text-2xl text-center font-psemibold text-white mt-2">
                {title}
            </Text>
            <Text className="font-pmedium text-sm text-gray-100">
                {subtitle}
            </Text>
            <CustomButton
                title="Create ReadyCheck"
                handlePress={() => router.push("/createReadyCheck")}
                containerStyles="w-full my-5"
            />
        </View>
    )
}

export default RCEmptyState