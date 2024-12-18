import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getOwnedReadyChecks, getInvitedReadyChecks } from "../../lib/appwrite";
import ReadyCheckCard from "../../components/ReadyCheckCard";
import { useSocket } from "../../context/SocketContext";

const YourReadyChecks = () => {
  const { user } = useGlobalContext();
  const socket = useSocket();
  const [ownedReadyChecks, setOwnedReadyChecks] = useState([]);
  const [invitedReadyChecks, setInvitedReadyChecks] = useState([]);
  const [archivedReadyChecks, setArchivedReadyChecks] = useState([]);

  // Fetch ready checks from the server
  const fetchReadyChecks = async () => {
    try {
      // Fetch readychecks the user is connected to
      const owned = await getOwnedReadyChecks(user.$id);
      const invited = await getInvitedReadyChecks(user.$id);

      // Current time in milliseconds
      const now = Date.now();

      // Filter archived readychecks (timing older than 24 hours from now)
      const ownedArchived = owned.filter((readycheck) => {
        const readyCheckTime = new Date(readycheck.timing).getTime();
        return now - readyCheckTime > 86400000;
      });

      const invitedArchived = invited.filter((readycheck) => {
        const readyCheckTime = new Date(readycheck.timing).getTime();
        return now - readyCheckTime > 86400000;
      });

      // Active Lists
      setOwnedReadyChecks(owned.filter((readycheck) => !ownedArchived.includes(readycheck)));
      setInvitedReadyChecks(invited.filter((readycheck) => !invitedArchived.includes(readycheck)));

      // Combine and sort archived readychecks in descending order of timing
      const archived = [...ownedArchived, ...invitedArchived].sort((a, b) => new Date(b.timing) - new Date(a.timing));
      setArchivedReadyChecks(archived);

    } catch (error) {
      console.error("Error fetching readychecks:", error);
      Alert.alert("Error", "Could not load ReadyChecks.");
    }
  };

  useEffect(() => {
    fetchReadyChecks();
  }, [user.$id]);

  // Set up socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Listen for readyCheck updates and refetch the data on update
    socket.on("readyCheckUpdate", () => {
      console.log("Received readyCheckUpdate event");
      fetchReadyChecks();
    });

    // Listen for readyCheck deletion and refetch the data on deletion
    socket.on("readyCheckDeleted", () => {
      console.log("Received readyCheckDeleted event");
      fetchReadyChecks();
    });

    // Cleanup listeners on component unmount
    return () => {
      socket.off("readyCheckUpdate");
      socket.off("readyCheckDeleted");
    };
  }, [socket]);

  return (
    <SafeAreaView className="bg-primary h-[100vh] pt-5">
      <View className="px-3">
        <Text className="text-secondary text-3xl my-2 text-center">Your ReadyChecks</Text>
        <ScrollView className="h-full">
          <Text className="text-white text-xl my-4">Owned ReadyChecks</Text>
          {ownedReadyChecks.length > 0 ? (
            ownedReadyChecks.map((item) => <ReadyCheckCard key={item.$id} readycheck={item} />)
          ) : (
            <Text className="text-gray-400 text-center my-2">No owned ReadyChecks.</Text>
          )}

          <Text className="text-white text-xl my-4">Invited ReadyChecks</Text>
          {invitedReadyChecks.length > 0 ? (
            invitedReadyChecks.map((item) => <ReadyCheckCard key={item.$id} readycheck={item} />)
          ) : (
            <Text className="text-gray-400 text-center my-2">No invitations to ReadyChecks.</Text>
          )}

          <Text className="text-white text-xl my-4">Archived ReadyChecks</Text>
          {archivedReadyChecks.length > 0 ? (
            archivedReadyChecks.map((item) => <ReadyCheckCard key={item.$id} readycheck={item} />)
          ) : (
            <Text className="text-gray-400 text-center">No archived ReadyChecks.</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default YourReadyChecks;