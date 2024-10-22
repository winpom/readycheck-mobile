import { View, FlatList, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { React, useState, useEffect } from "react";
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';
import ReadyCheckCard from "./ReadyCheckCard";
import { getLatestReadyChecks } from "../lib/appwrite"

const zoomIn = {
  0: {
    scale: 0.9,
  },
  1: {
    scale: 1,
  },
};

const zoomOut = {
  0: {
    scale: 1,
  },
  1: {
    scale: 0.9,
  },
};

const UpcomingReadyCheck = ({ activeReadyCheck, readycheck, onPress }) => {
  const { $id } = readycheck;

  return (
    <Animatable.View
      className="mr-5"
      animation={activeReadyCheck === $id ? zoomIn : zoomOut}
      duration={500}
    >
      <TouchableOpacity
        className="relative justify-center items-center"
        activeOpacity={0.7}
        onPress={onPress}
      >
        <ReadyCheckCard readycheck={readycheck} />
      </TouchableOpacity>
    </Animatable.View>
  );
};

const Upcoming = () => {
  const [readychecks, setReadychecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const router = useRouter(); 

  const viewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].key)
    }
  }

  useEffect(() => {
    const fetchReadyChecks = async () => {
      try {
        const latestReadyChecks = await getLatestReadyChecks();
        setReadychecks(latestReadyChecks);
        setActiveItem(latestReadyChecks[0]?.$id || null); // Set the first item as active
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReadyChecks();
  }, []);

  // Handle card press
  const handlePress = (readycheckId) => {
    router.replace(`/readycheck/${readycheckId}`); // Navigate to live page with readycheckId
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text className="text-white">Error: {error}</Text>;
  }

  return (
    <FlatList
      data={readychecks}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <UpcomingReadyCheck
          activeReadyCheck={activeItem}
          readycheck={item}
          onPress={() => handlePress(item.$id)}
        />
      )}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70
      }}
      contentOffset={{ x: 170 }}
      horizontal
      showsHorizontalScrollIndicator={false}
    />
  );
};

export default Upcoming;
