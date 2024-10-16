import { View, Text, ScrollView, Image, Alert } from "react-native"
import { useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { Link, router } from "expo-router"

import { images } from "../../constants"
import { FormField, CustomButton } from "../../components"
import { getCurrentUser, signIn } from "../../lib/appwrite"

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    email: "",
    password: ""
  })

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields")
    }
    setIsSubmitting(true);

    try {
      await signIn(form.email, form.password);
      const result = await getCurrentUser();
      setUser(result);
      setIsLogged(true);

      router.replace("/home")
    } catch (error) {
      Alert.alert("Error", error.message)
    } finally {
      setIsSubmitting(false)
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">
          <View className="items-center">
            <Image
              source={images.logo}
              className="w-[280px] h-[84px] items-center"
              resizeMode="contain"
            />
          </View>
          <Text className="text-2xl text-white text-semibold mt-10 font-psemibold text-center">Log in</Text>
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-2"
            keyboardType="email-address"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-4"
          />
          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-3 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Don"t have an account?
            </Text>
            <Link href="/sign-up" className="text-lg font-psemibold text-secondary">Sign Up</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn