import { View, Text, FlatList, Image, RefreshControl, TouchableOpacity, TouchableWithoutFeedback, Alert } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import { RCEmptyState, ReadyCheckCard, NotificationList } from "../../components";
import { getOwnedReadyChecks, getInvitedReadyChecks } from "../../lib/appwrite";
import { icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";

const Home = () => {
  const { user } = useGlobalContext();
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [activeReadyChecks, setActiveReadyChecks] = useState([]);

  // Redirect to sign-in if user is not logged in
  useEffect(() => {
    if (!user) {
      router.replace("/sign-in");
    }
  }, [user]);

  // Fetches ready checks if user exists
  const fetchReadyChecks = async () => {
    if (!user) return;

    try {
      const owned = await getOwnedReadyChecks(user.$id);
      const invited = await getInvitedReadyChecks(user.$id);

      const now = Date.now();
      const activeReadyChecks = [...owned, ...invited].filter((readycheck) => {
        const readyCheckTime = new Date(readycheck.timing).getTime();
        return now - readyCheckTime <= 86400000; // Within the last 24 hours
      });

      setActiveReadyChecks(activeReadyChecks.sort((a, b) => new Date(b.timing) - new Date(a.timing)));
    } catch (error) {
      console.error("Error fetching readychecks:", error);
      Alert.alert("Error", "Could not load ReadyChecks.");
    }
  };

  // Fetches ready checks on component mount and when `user.$id` changes
  useEffect(() => {
    fetchReadyChecks();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReadyChecks();
    setRefreshing(false);
  };

  const toggleNotificationList = () => {
    setIsNotificationVisible((prev) => !prev);
  };

  const closeNotificationList = () => {
    if (isNotificationVisible) {
      setIsNotificationVisible(false);
    }
  };

  if (!user) return null; // Prevent rendering if user is null

  return (
    <TouchableWithoutFeedback onPress={closeNotificationList}>
      <SafeAreaView className="bg-primary h-full pt-5">
        <StatusBar backgroundColor="#161622" style="light" />

        {/* Notification List Container - Move outside FlatList */}
        {isNotificationVisible && (
          <View
            className="absolute top-32 right-6 bg-gray-800 rounded-lg shadow-lg w-72 p-4 border border-secondary z-50">
            <Text className="text-lg font-pmedium text-white mb-4">Notifications</Text>
            <NotificationList />
          </View>
        )}

        <FlatList
          data={activeReadyChecks}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => <ReadyCheckCard readycheck={item} />}
          ListHeaderComponent={() => (
            <View className="mt-6 px-4 space-y-2">
              <View className="justify-between items-start flex-row mb-6">
                <View>
                  <Text className="font-pmedium text-sm text-gray-100">Welcome Back,</Text>
                  <Text className="text-2xl font-psemibold text-white">{user?.username}</Text>
                </View>
                <View className="mt-1.5">
                  <TouchableOpacity onPress={toggleNotificationList}>
                    <Image source={icons.notifications} className="w-7 h-7" resizeMode="contain" tintColor="#CDCDE0" />
                  </TouchableOpacity>
                </View>
              </View>
              <View className="w-full flex-1 pt-5 pb-8">
                <Text className="text-gray-100 text-lg font-pregular mb-1">Upcoming ReadyChecks</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <RCEmptyState title="No Upcoming ReadyChecks" subtitle="Create one to get started!" />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>

  );
};

export default Home;