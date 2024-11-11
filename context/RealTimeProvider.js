import React, { createContext, useContext, useEffect, useState } from "react";
import { client } from "../lib/appwrite";

const RealTimeContext = createContext();

export const RealTimeProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [readyChecks, setReadyChecks] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // ReadyChecks Collection
        const readyCheckChannel = 'databases.670fb03d0039ae43b0b3.collections.670fb069000ec4a96868.documents';
        const unsubscribeReadyChecks = client.subscribe(readyCheckChannel, (response) => {
            const eventType = response.events[0];
            const changedReadyCheck = response.payload;

            if (eventType.includes("create")) {
                setReadyChecks((prev) => [changedReadyCheck, ...prev]);
            } else if (eventType.includes("update")) {
                setReadyChecks((prev) =>
                    prev.map((readycheck) =>
                        readycheck.$id === changedReadyCheck.$id ? changedReadyCheck : readycheck
                    )
                );
            } else if (eventType.includes("delete")) {
                setReadyChecks((prev) =>
                    prev.filter((readycheck) => readycheck.$id !== changedReadyCheck.$id)
                );
            }
        });

        // Users Collection
        const usersChannel = 'databases.670fb03d0039ae43b0b3.collections.672b76d7003d9b4dcaa4.documents';
        const unsubscribeUsers = client.subscribe(usersChannel, (response) => {
            const eventType = response.events[0];
            const changedUser = response.payload;

            if (eventType.includes("create")) {
                setUsers((prev) => [changedUser, ...prev]);
            } else if (eventType.includes("update")) {
                setUsers((prev) =>
                    prev.map((user) =>
                        user.$id === changedUser.$id ? changedUser : user
                    )
                );
            } else if (eventType.includes("delete")) {
                setUsers((prev) =>
                    prev.filter((user) => user.$id !== changedUser.$id)
                );
            }
        });

        // Notifications Collection
        const notificationsChannel = 'databases.670fb03d0039ae43b0b3.collections.672229db0000984c62e7.documents';
        const unsubscribeNotifications = client.subscribe(notificationsChannel, (response) => {
            const eventType = response.events[0];
            const changedNotification = response.payload;

            if (eventType.includes("create")) {
                setNotifications((prev) => [changedNotification, ...prev]);
            } else if (eventType.includes("update")) {
                setNotifications((prev) =>
                    prev.map((notification) =>
                        notification.$id === changedNotification.$id ? changedNotification : notification
                    )
                );
            } else if (eventType.includes("delete")) {
                setNotifications((prev) =>
                    prev.filter((notification) => notification.$id !== changedNotification.$id)
                );
            }
        });

        // Clean up the subscriptions on unmount
        return () => {
            unsubscribeReadyChecks();
            unsubscribeUsers();
            unsubscribeNotifications();
        };
    }, []);

    return (
        <RealTimeContext.Provider value={{ users, readyChecks, notifications }}>
            {children}
        </RealTimeContext.Provider>
    );
};

// Custom hook to access the real-time data
export const useRealTime = () => useContext(RealTimeContext);