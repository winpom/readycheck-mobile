import { View, Text, Image } from "react-native"
import { Tabs } from "expo-router"
import React from "react"

import { icons } from "../../constants";

const TabIcon = ({ icon, color, name, focused }) => {
  const iconSize = name === "Social" ? "w-9 h-8" : "w-6 h-6";
  const textTopStyle = name === "Social" ? { top: -4 } : {};

  return (
    <View className="items-center justify-center gap-1">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className={iconSize}
      />
      <Text
        style={{ color: color, ...textTopStyle }}
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`}
      >
        {name}
      </Text>
    </View>
  )
}

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#FFA001",
          tabBarInactiveTintColor: "#CDCDE0",
          tabBarStyle: {
            backgroundColor: "#161622",
            borderTopWidth: 2,
            borderTopColor: "#232533",
            height: 84,
          } 
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home}
                color={color}
                name="Home"
                focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen
          name="social"
          options={{
            title: "Social",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.social}
                color={color}
                name="Social"
                focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen
          name="createReadyCheck"
          options={{
            title: "Create",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.plus}
                color={color}
                name="Create"
                focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen
          name="yourReadyChecks"
          options={{
            title: "ReadyChecks",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.check}
                color={color}
                name="Checks"
                focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.settings}
                color={color}
                name="Settings"
                focused={focused}
              />
            )
          }}
        />
      </Tabs>
    </>
  )
}

export default TabsLayout