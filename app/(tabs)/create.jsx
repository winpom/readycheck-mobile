import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native"
import React, { useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { FormField, CustomButton } from "../../components"

import { icons } from "../../constants"

const CreateReadyCheck = () => {
  // use this for profile image upload
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    title: "",
    timing: "",
    activity: "",
    description: "",
    owner: "",
    invitees: "",
  })

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-secondary font-psemibold pt-5">
          Create New ReadyCheck
        </Text>
        <FormField

          title="Title"
          value={form.title}
          placeholder="Let people know what's up..."
          handleChangeText={(e) => setForm({
            ...form,
            title: e,
          })}
          otherStyles="mt-10"
        />
        <FormField
          title="Timing"
          value={form.timing}
          placeholder="Let people know what's up..."
          handleChangeText={(e) => setForm({
            ...form,
            title: e,
          })}
          otherStyles="mt-3"
        />
        <FormField
          title="Activity"
          value={form.activity}
          placeholder="Let people know what's up..."
          handleChangeText={(e) => setForm({
            ...form,
            title: e,
          })}
          otherStyles="mt-3"
        />
        <FormField
          title="Description"
          value={form.description}
          placeholder="Let people know what's up..."
          handleChangeText={(e) => setForm({
            ...form,
            title: e,
          })}
          otherStyles="mt-3"
        />
        <FormField
          title="Invitees"
          value={form.invitees}
          placeholder="Let people know what's up..."
          handleChangeText={(e) => setForm({
            ...form,
            title: e,
          })}
          otherStyles="mt-3"
        />
        <View className="mt-7 space-y-2">
          <Text>

          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default CreateReadyCheck