import { View, Text, FlatList, Image, RefreshControl, TouchableOpacity, Platform, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { RCEmptyState, ReadyCheckCard, NotificationList } from "../../components";
import { getOwnedReadyChecks, getInvitedReadyChecks, updateExpoPushToken, getUnreadNotificationCount } from "../../lib/appwrite"; // Import updateExpoPushToken here
import { icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";

// Set up notifications handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Register for push notifications
async function registerForPushNotificationsAsync(userId) {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Permission not granted to get push token for push notification!');
      return;
    }

    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      console.warn('Project ID not found');
      return;
    }

    try {
      const pushTokenString = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      await updateExpoPushToken(userId, pushTokenString);
      return pushTokenString;

    } catch (error) {
      console.error("Failed to get push token:", error);
    }
  } else {
    console.warn("Must use a physical device for push notifications");
  }
}

const Home = () => {
  const { user } = useGlobalContext();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [activeReadyChecks, setActiveReadyChecks] = useState([]);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState();
  const [unreadNotifications, setUnreadNotifications] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  // Redirect to sign-in if user is not logged in
  useEffect(() => {
    if (!user) {
      router.replace("/sign-in");
    }
  }, [user]);

  // Check for unread notifications
  const checkUnreadNotifications = async () => {
    if (user) {
      const unread = await getUnreadNotificationCount(user.$id);
      setUnreadNotifications(unread);
    }
  };

  // Initial check for unread notifications
  useEffect(() => {
    checkUnreadNotifications();
  }, [user]);

  // Fetch ready checks
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReadyChecks();
    }
  }, [user]);
  
  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReadyChecks();
    setRefreshing(false);
  };

  // Toggle notification list and re-check for unread notifications if list is closed
  const toggleNotificationList = () => {
    setIsNotificationVisible((prev) => !prev);
    if (isNotificationVisible) {
      checkUnreadNotifications();
    }
  };

  const closeNotificationList = () => {
    if (isNotificationVisible) {
      setIsNotificationVisible(false);
      checkUnreadNotifications();
    }
  };

  // Notification listeners
  useEffect(() => {
    // Register push notifications and save the token if user is available
    if (user) {
      registerForPushNotificationsAsync(user.$id)
        .then(token => setExpoPushToken(token ?? ''))
        .catch(error => console.error("Error registering for notifications:", error));
    }

    // Set up listener for received notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      checkUnreadNotifications(); // Check unread count when a notification is received
    });

    // Set up response listener for notification interactions
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { screen, readycheckId, userId } = response.notification.request.content.data;

      if (screen === 'ReadyCheck' && readycheckId) {
        router.push(`/readycheck/${readycheckId}`);
      } else if (screen === 'UserProfile' && userId) {
        router.push(`/user/${userId}`);
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);

  // Render the main content
  return (
    <SafeAreaView className="bg-primary h-[100vh] relative">
      <StatusBar backgroundColor="#161622" style="light" />

      {isNotificationVisible && (
        <TouchableOpacity
          onPress={closeNotificationList}
          className="absolute inset-0 h-full w-full bg-black opacity-50 z-20"
        />
      )}

      {isNotificationVisible && (
        <View
          className="absolute top-28 right-6 bg-gray-800 rounded-lg shadow-lg w-72 p-4 border border-secondary shadow-2xl z-50 max-h-[300px]">
          <Text className="text-lg font-pmedium text-white mb-4">Notifications</Text>
          <NotificationList />
        </View>
      )}

      {loading ? (
        <ActivityIndicator size={40} color="#ffffff" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={activeReadyChecks}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => <ReadyCheckCard readycheck={item} />}
          ListHeaderComponent={() => (
            <View className="mt-6 px-4 space-y-2">
              <View className="justify-between items-start flex-row mb-6">
                <View>
                  <Text className="font-pmedium text-sm text-gray-100">Welcome Back,</Text>
                  <Text className="text-2xl font-psemibold text-white">{user.displayName || user?.username}</Text>
                </View>
                <View className="mt-1.5">
                  {unreadNotifications > 0 && (
                    <View className="flex justify-center items-center z-10 rounded-full absolute -right-0.5 bg-red-600 -top-0.5 min-w-[15px] h-[15px]">
                      <Text className="text-white text-xs">
                        {unreadNotifications}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={toggleNotificationList}>
                    <Image
                      source={icons.notifications}
                      className="w-7 h-7"
                      resizeMode="contain"
                      tintColor={unreadNotifications > 0 ? "#FFA001" : "#CDCDE0"}
                    />
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
      )}
    </SafeAreaView>
  );
};

export default Home;