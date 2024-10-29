import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getOwnedReadyChecks, getInvitedReadyChecks } from "../../lib/appwrite";
import ReadyCheckCard from "../../components/ReadyCheckCard";

const Active = () => {
  const { user } = useGlobalContext();
  const [ownedReadyChecks, setOwnedReadyChecks] = useState([]);
  const [invitedReadyChecks, setInvitedReadyChecks] = useState([]);

  useEffect(() => {
    const fetchReadyChecks = async () => {
      try {
        // Fetch readychecks the user owns
        const owned = await getOwnedReadyChecks(user.$id);
        setOwnedReadyChecks(owned);

        // Fetch readychecks the user has been invited to
        const invited = await getInvitedReadyChecks(user.$id);
        setInvitedReadyChecks(invited);
      } catch (error) {
        console.error("Error fetching readychecks:", error);
        Alert.alert("Error", "Could not load ReadyChecks.");
      }
    };

    fetchReadyChecks();
  }, [user.$id]);

  return (
    <SafeAreaView className="bg-primary h-full pt-5">
      <View className="px-4">
        <Text className="text-secondary text-3xl my-2 text-center">Active ReadyChecks</Text>

        {/* Owned ReadyChecks Section */}
        <Text className="text-white text-xl my-4">Owned ReadyChecks</Text>
        <FlatList
          data={ownedReadyChecks}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => <ReadyCheckCard readycheck={item} />}
          ListEmptyComponent={() => (
            <Text className="text-gray-400 text-center">No owned ReadyChecks.</Text>
          )}
        />

        {/* Invited ReadyChecks Section */}
        <Text className="text-white text-xl my-4">Invited ReadyChecks</Text>
        <FlatList
          data={invitedReadyChecks}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => <ReadyCheckCard readycheck={item} />}
          ListEmptyComponent={() => (
            <Text className="text-gray-400 text-center">No invitations to ReadyChecks.</Text>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default Active;
