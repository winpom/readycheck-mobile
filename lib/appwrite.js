import { Account, Client, ID, Avatars, Databases, Query, Storage } from "react-native-appwrite";
import { appwriteConfig } from './config';
import { formatTiming } from "../utils/formatTiming";

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    readycheckCollectionId,
    notificationCollectionId,
    storageId,
} = appwriteConfig

const client = new Client();

client
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setPlatform(platform);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export async function updateExpoPushToken(userId, expoPushToken) {
    try {
        await databases.updateDocument(
            databaseId,
            userCollectionId,
            userId,
            { expoPushToken }
        );
        //   console.log('Expo Push Token saved successfully');
    } catch (error) {
        console.error('Error saving Expo Push Token:', error);
    }
}

// Send push notification to a user
export async function sendPushNotification(expoPushToken, title, body, data = {}) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data,
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
}

// Register User
export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if (!newAccount) throw Error;

        const avatarURL = avatars.getInitials(username);

        await signIn(email, password);

        const newUser = await databases.createDocument(
            databaseId,
            userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarURL,
                friends: []
            }
        )
        return newUser;
    } catch (error) {
        console.log(error);
        throw new Error(error)
    }
}

// Sign In User
export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password)

        return session;

    } catch (error) {
        throw new Error(error);
    }
}

export const signOut = async (userId) => {
    try {
        // Clear the Expo push token by setting it to an empty string
        await updateExpoPushToken(userId, '');

        // Delete the current session
        const session = await account.deleteSession("current");
        return session;
    } catch (error) {
        console.error("Error during sign-out:", error);
        throw new Error(error.message);
    }
};

// Get All Users 
export const getAllUsers = async () => {
    try {
        const users = await databases.listDocuments(databaseId, userCollectionId);

        if (users && Array.isArray(users.documents)) {
            return users.documents.map(user => ({
                id: user.$id,
                name: user.username || "Unnamed",
                avatarUrl: user.avatar || "", // Ensure avatar field is populated
            }));
        } else {
            console.warn("No documents found or unexpected format in users response.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching users:", error.message);
        return []; // Return an empty array if an error occurs
    }
};

// Search Users
export const searchUsers = async (query) => {
    try {
        const users = await databases.listDocuments(
            databaseId,
            userCollectionId,
            [Query.search("username", query)]
        )

        return users.documents;
    } catch (error) {
        throw new Error(error);
    }
}

// Get Current User (for global context)
export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) return null;

        const currentUser = await databases.listDocuments(
            databaseId,
            userCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        );

        return currentUser.documents[0] || null;  // Return `null` if no user is found
    } catch (error) {
        console.log("Error fetching current user:", error);
        return null;  // Return `null` on error
    }
};

// get User by ID
export const getUserById = async (userId) => {
    try {
        const response = await databases.getDocument(
            databaseId,
            userCollectionId,
            userId
        );
        return response;
    } catch (error) {
        console.error("Error fetching user by ID:", error.message);
        throw new Error("Failed to fetch user.");
    }
};

export const createReadyCheck = async (form) => {
    try {
        const ownerDocument = await databases.getDocument(databaseId, userCollectionId, form.owner);

        const newReadyCheck = await databases.createDocument(databaseId, readycheckCollectionId, ID.unique(), {
            title: form.title,
            timing: form.timing,
            description: form.description,
            invitees: form.invitees,
            owner: form.owner,
        });

        const readycheckId = newReadyCheck.$id;
        const formattedTime = formatTiming(form.timing);
        const formattedTimingString = `${formattedTime.time}, ${formattedTime.date}`;

        for (const inviteeId of form.invitees) {
            const inviteeDocument = await databases.getDocument(databaseId, userCollectionId, inviteeId);

            await databases.createDocument(databaseId, notificationCollectionId, ID.unique(), {
                type: "readyCheckInvite",
                message: `${ownerDocument.username} invited you to ${form.title}`,
                userId: inviteeDocument.$id,
                senderId: ownerDocument.$id,
                readycheckId: readycheckId,
                timestamp: new Date().toISOString(),
            });

            // Send push notification with navigation data
            if (inviteeDocument.expoPushToken) {
                await sendPushNotification(
                    inviteeDocument.expoPushToken,
                    'ReadyCheck Invitation',
                    `${ownerDocument.username} invited you to join ${form.title} at ${formattedTimingString}`,
                    { screen: 'ReadyCheck', readycheckId } // Attach navigation data
                );
            }
        }

        return newReadyCheck;
    } catch (error) {
        console.error("Error in createReadyCheck:", error.message);
        throw new Error("Failed to create ReadyCheck and send notifications.");
    }
};

// Get ReadyChecks 
export const getReadyChecks = async () => {
    try {
        const readychecks = await databases.listDocuments(
            databaseId,
            readycheckCollectionId
        )

        return readychecks.documents;
    } catch (error) {
        throw new Error(error);
    }
}

// Fetch a specific ReadyCheck by ID and parse RSVPs
export const getReadyCheck = async (readycheckId) => {
    try {
        const readycheck = await databases.getDocument(databaseId, readycheckCollectionId, readycheckId);
        // Parse RSVPs JSON string if it exists
        return {
            ...readycheck,
            rsvps: readycheck.rsvps ? JSON.parse(readycheck.rsvps) : [],
        };
    } catch (error) {
        console.error("Error fetching readycheck:", error);
        throw new Error("Failed to fetch readycheck.");
    }
};

// Update ReadyCheck
export const updateReadyCheck = async (readycheckId, updatedData) => {
    try {

        // Retrieve the existing ReadyCheck document
        const existingReadyCheck = await databases.getDocument(
            databaseId,
            readycheckCollectionId,
            readycheckId
        );

        // Identify new invitees
        const currentInvitees = new Set(existingReadyCheck.invitees.map(i => i.$id) || []);
        const updatedInvitees = new Set(updatedData.invitees || []);
        const newInvitees = Array.from(updatedInvitees).filter(invitee => !currentInvitees.has(invitee));

        // Retrieve the owner document and ensure owner fields are correct
        const ownerDocument = existingReadyCheck.owner;

        const formattedTime = formatTiming(existingReadyCheck.timing);
        const formattedTimingString = `${formattedTime.time}, ${formattedTime.date}`;

        // Send notifications to new invitees
        for (const inviteeId of newInvitees) {

            // Create an in-app notification document for the invitee
            const notificationData = {
                type: "readyCheckInvite",
                message: `${ownerDocument.username} invited you to ${existingReadyCheck.title}`,
                userId: inviteeId,
                senderId: ownerDocument.$id,
                readycheckId: readycheckId,
                timestamp: new Date().toISOString(),
            };

            await databases.createDocument(
                databaseId,
                notificationCollectionId,
                ID.unique(),
                notificationData
            );

            // Retrieve invitee document for push notification
            const inviteeDocument = await databases.getDocument(databaseId, userCollectionId, inviteeId);
            if (inviteeDocument.expoPushToken) {
                await sendPushNotification(
                    inviteeDocument.expoPushToken,
                    'ReadyCheck Invitation',
                    `${ownerDocument.username} invited you to join ${existingReadyCheck.title} at ${formattedTimingString}`,
                    { screen: 'ReadyCheck', readycheckId: readycheckId }
                );
            }
        }

        // Update the ReadyCheck with the new data
        await databases.updateDocument(
            databaseId,
            readycheckCollectionId,
            readycheckId,
            updatedData
        );

    } catch (error) {
        console.error("Failed to update ReadyCheck:", error.message);
        throw error;
    }
};

// Delete a ReadyCheck by ID
export const deleteReadyCheck = async (readycheckId) => {
    try {
        await databases.deleteDocument(
            databaseId,
            readycheckCollectionId,
            readycheckId
        );
    } catch (error) {
        console.error("Failed to delete ReadyCheck:", error);
        throw error;
    }
};

// Get Latest ReadyChecks - NEED TO FIX ORDER BASED ON TIMING LATER
export const getLatestReadyChecks = async () => {
    try {
        const readychecks = await databases.listDocuments(
            databaseId,
            readycheckCollectionId,
            [Query.orderDesc("$createdAt", Query.limit(7))]
        )

        return readychecks.documents;
    } catch (error) {
        throw new Error(error);
    }
}

// Get Owned ReadyChecks
export const getOwnedReadyChecks = async (userId) => {
    try {
        const readychecks = await databases.listDocuments(
            databaseId,
            readycheckCollectionId,
            [Query.equal("owner", userId)]
        )

        return readychecks.documents;
    } catch (error) {
        throw new Error(error);
    }
}

// Get invited ReadyChecks
export const getInvitedReadyChecks = async (userId) => {
    try {
        const readychecks = await databases.listDocuments(databaseId, readycheckCollectionId);

        // Filter readychecks where any invitee's `$id` matches the given userId
        const invitedReadychecks = readychecks.documents.filter(readycheck =>
            readycheck.invitees.some(invitee => invitee.$id === userId)
        );

        return invitedReadychecks;
    } catch (error) {
        console.error("Error fetching invited readychecks:", error.message);
        throw new Error("Failed to fetch invited readychecks.");
    }
};

// get RSVPs for a ReadyCheck
export const getRSVPsForReadyCheck = async (readycheckId) => {
    try {
        const response = await databases.listDocuments(
            databaseId,
            readycheckCollectionId,
            [Query.equal("readycheckId", readycheckId)]
        );
        return response.documents;
    } catch (error) {
        console.error("Error fetching RSVPs:", error.message);
        throw new Error("Failed to fetch RSVPs.");
    }
};

// Add or update RSVP for a user
export const addOrUpdateRSVP = async (readycheckId, userId, rsvpStatus) => {
    try {
        const readycheck = await databases.getDocument(databaseId, readycheckCollectionId, readycheckId);
        let rsvps = readycheck.rsvps ? JSON.parse(readycheck.rsvps) : [];

        const existingRSVPIndex = rsvps.findIndex(rsvp => rsvp.userId === userId);
        if (existingRSVPIndex !== -1) {
            rsvps[existingRSVPIndex].status = rsvpStatus;
        } else {
            rsvps.push({ userId, status: rsvpStatus });
        }

        await databases.updateDocument(databaseId, readycheckCollectionId, readycheckId, {
            rsvps: JSON.stringify(rsvps),
        });

        const ownerId = readycheck.owner.$id;
        console.log("OWNER", ownerId)
        const currentUser = await databases.getDocument(databaseId, userCollectionId, userId);
        console.log("CURRENT USER", currentUser)

        // Create an in-app notification for the owner
        await databases.createDocument(
            databaseId,
            notificationCollectionId,
            ID.unique(),
            {
                type: "readyCheckInvite",
                message: `${currentUser.username} responded to ${readycheck.title} with "${rsvpStatus}"`,
                userId: ownerId,
                senderId: currentUser.$id,
                timestamp: new Date().toISOString(),
                readycheckId: readycheckId,
            }
        )

        // Send a push notification to the owner if they have an expoPushToken
        const ownerDocument = await databases.getDocument(databaseId, userCollectionId, ownerId);
        if (ownerDocument.expoPushToken) {
            await sendPushNotification(
                ownerDocument.expoPushToken,
                'RSVP Update',
                `${currentUser.username} responded to ${readycheck.title} with "${rsvpStatus}".`,
                { screen: 'ReadyCheck', readycheckId } // Include the readycheckId for navigation
            );
        }

    } catch (error) {
        console.error("Error adding or updating RSVP:", error.message);
        throw new Error("Failed to add or update RSVP.");
    }
};

// getFilePreview
export const getFilePreview = async (fileId, type) => {
    let fileUrl;

    try {
        if (type === 'image') {
            fileUrl = storage.getFilePreview(storageId, fileId, 250, 250, 'top', 100)
        } else {
            throw new Error('Invalid file type')
        }
        if (!fileUrl) throw Error;
        return fileUrl
    } catch (error) {
        throw new Error(error)
    }
}

// Upload File
export const uploadFile = async (file, type) => {
    if (!file) return;

    const asset = {
        name: file.fileName,
        type: file.mimeType,
        size: file.filesize,
        uri: file.uri,
    }

    try {
        const uploadedFile = await storage.createFile(
            storageId,
            ID.unique,
            asset,
        );

        const fileUrl = await getFilePreview(uploadedFile.$id, type)
        return fileUrl
    } catch (error) {
        throw new Error(error)
    }
}

// Upload new Profile Image
export const uploadProfileImage = async (form) => {
    try {
        const [profileImageUrl] = await Promise.all([
            uploadFile(form.profileImage, 'image'),
        ])

        const newProfileImage = await databases.createDocument(
            databaseId,
            userCollectionId,
            ID.unique(), {
            profileImage: profileImageUrl
        }
        )

        return newProfileImage;
    } catch (error) {
        throw new Error(error)
    }
}

// Friend Request with Push Notification
export const requestFriend = async (userId, friendId) => {
    try {
        const currentUser = await databases.getDocument(databaseId, userCollectionId, userId);
        const friendUser = await databases.getDocument(databaseId, userCollectionId, friendId);

        if (currentUser.friends?.includes(friendId)) {
            throw new Error("This user is already in your friends list.");
        }

        await databases.updateDocument(databaseId, userCollectionId, userId, {
            friends: [...(currentUser.friends || []), friendId],
        });

        await databases.updateDocument(databaseId, userCollectionId, friendId, {
            friends: [...(friendUser.friends || []), userId],
        });

        await databases.createDocument(
            databaseId,
            notificationCollectionId,
            ID.unique(),
            {
                type: "friendInvite",
                message: `${currentUser.username} sent a friend request.`,
                userId: friendId,
                senderId: userId,
                timestamp: new Date().toISOString(),
                readycheckId: null,
            }
        )

        // Send push notification if expoPushToken exists
        if (friendUser.expoPushToken) {
            await sendPushNotification(
                friendUser.expoPushToken,
                'New Friend Request',
                `${currentUser.username} sent you a friend request!`,
                { screen: 'UserProfile', userId: currentUser.$id } // Attach navigation data
            );
        }
    } catch (error) {
        console.error("Error adding friend:", error.message);
    }
};

// Remove a friend
export const removeFriend = async (userId, friendId) => {
    try {
        // Retrieve documents for both users
        const currentUser = await databases.getDocument(databaseId, userCollectionId, userId);
        const friendUser = await databases.getDocument(databaseId, userCollectionId, friendId);

        // Remove friendId from currentUser's friends array
        const updatedCurrentUserFriends = (currentUser.friends || []).filter(id => id !== friendId);
        await databases.updateDocument(databaseId, userCollectionId, userId, {
            friends: updatedCurrentUserFriends
        });

        // Remove userId from friendUser's friends array
        const updatedFriendUserFriends = (friendUser.friends || []).filter(id => id !== userId);
        await databases.updateDocument(databaseId, userCollectionId, friendId, {
            friends: updatedFriendUserFriends
        });

    } catch (error) {
        console.error("Error removing friend:", error.message);
        throw new Error("Failed to remove friend.");
    }
};

// Function to check if a friend exists
export const isFriend = async (userId, friendId) => {
    try {
        // Retrieve the current user's document
        const currentUser = await databases.getDocument(databaseId, userCollectionId, userId);

        // Check if friendId exists in the friends array
        return (currentUser.friends || []).includes(friendId);
    } catch (error) {
        console.error("Error checking friend status:", error.message);
        throw new Error("Failed to check friend status.");
    }
};

// Get Friends based on user ID
export const getFriends = async (userId) => {
    try {
        // Retrieve the current user's document to access the friends array
        const currentUser = await databases.getDocument(databaseId, userCollectionId, userId);

        // If no friends, return an empty array
        if (!currentUser.friends || currentUser.friends.length === 0) {
            return [];
        }

        // Fetch details for each friend in the friends array
        const friendsPromises = currentUser.friends.map(friendId =>
            databases.getDocument(databaseId, userCollectionId, friendId)
        );

        // Await all promises and map the result to include necessary friend details
        const friendsWithDetails = await Promise.all(friendsPromises);
        return friendsWithDetails.map(friend => ({
            id: friend.$id,              // Friend's user ID
            username: friend.username,    // Friend's username
            avatar: friend.avatar || "",  // Friend's avatar, fallback to empty if missing
        }));
    } catch (error) {
        console.error("Error fetching friends:", error.message);
        throw new Error("Failed to fetch friends.");
    }
};

export const getNotifications = async (userId) => {
    try {
        // Retrieve notifications for the user based on userId
        const response = await databases.listDocuments(
            databaseId,
            notificationCollectionId,
            [Query.equal("userId", userId)]
        );

        // Filter and structure the notifications
        const notifications = response.documents.map(notification => {
            const { type, senderId, message, readStatus, readycheckId } = notification;

            // Additional data formatting (e.g., sender info for friend requests)
            return {
                id: notification.$id,
                type,
                message,
                timestamp: notification.$createdAt,
                readStatus,
                senderId, // ID of the user who triggered the notification
                readycheckId,
            };
        });

        return notifications;
    } catch (error) {
        console.error("Error fetching notifications:", error.message);
        throw new Error("Failed to fetch notifications.");
    }
};

export const hasUnreadNotifications = async (userId) => {
    try {
        // Retrieve notifications for the user based on userId
        const response = await databases.listDocuments(
            databaseId,
            notificationCollectionId,
            [Query.equal("userId", userId), Query.equal("readStatus", "unread")]
        );

        // Check if there are any unread notifications
        return response.documents.length > 0;
    } catch (error) {
        console.error("Error checking unread notifications:", error.message);
        throw new Error("Failed to check for unread notifications.");
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await databases.updateDocument(
            databaseId,
            notificationCollectionId,
            notificationId,
            { readStatus: "read" } // Set status to "read"
        );
        return response;
    } catch (error) {
        console.error("Failed to mark notification as read:", error.message);
        throw new Error("Could not mark notification as read.");
    }
};

// FOR DEVELOPMENT PURPOSES ONLY
export const checkActiveSession = async () => {
    try {
      const session = await account.getSession("current");
      return session ? true : false;
    } catch (error) {
      console.error("No active session found:", error.message);
      return false; // No session exists
    }
  };
  
  // Deletes any active session
  export const forceDeleteSession = async () => {
    try {
      await account.deleteSession("current");
      console.log("Session deleted.");
    } catch (error) {
      console.error("Failed to delete session:", error.message);
      throw error;
    }
  };