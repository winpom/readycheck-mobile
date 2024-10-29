import { Account, Client, ID, Avatars, Databases, Query, Storage } from "react-native-appwrite";
import { appwriteConfig } from './config';

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    readycheckCollectionId,
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

// Sign Out User
export const signOut = async () => {
    try {
        const session = await account.deleteSession("current")
        return session;
    } catch (error) {
        throw new Error(error)
    }
}

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

        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            databaseId,
            userCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        )

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
    }

}

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

// Create ReadyCheck
export const createReadyCheck = async (form) => {
    try {
        const newReadyCheck = await databases.createDocument(databaseId, readycheckCollectionId, ID.unique(), {
            title: form.title,
            timing: form.timing,
            description: form.description,
            invitees: form.invitees,
            owner: form.owner,
        }
        )
        return newReadyCheck;
    } catch (error) {
        throw new Error(error)
    }
}

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

// Fetch a specific ReadyCheck by ID
export const getReadyCheck = async (readycheckId) => {
    try {
        const readycheck = await databases.getDocument(
            databaseId,
            readycheckCollectionId,
            readycheckId
        );
        return readycheck;
    } catch (error) {
        console.error("Failed to fetch ReadyCheck:", error);
        throw error;
    }
};

// Update ReadyCheck
export const updateReadyCheck = async (readycheckId, updatedData) => {
    try {
        await databases.updateDocument(
            databaseId,
            readycheckCollectionId,
            readycheckId,
            updatedData
        );
    } catch (error) {
        console.error("Failed to update ReadyCheck:", error);
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

// Add friend
export const addFriend = async (userId, friendId) => {
    try {
        // Retrieve documents for both users
        const currentUser = await databases.getDocument(databaseId, userCollectionId, userId);
        const friendUser = await databases.getDocument(databaseId, userCollectionId, friendId);

        // Check if the friendId is already in currentUser's friends list
        if (currentUser.friends?.includes(friendId)) {
            throw new Error("This user is already in your friends list.");
        }

        // Update currentUser's friends array to include friendId
        await databases.updateDocument(databaseId, userCollectionId, userId, {
            friends: [...(currentUser.friends || []), friendId]
        });

        // Update friendUser's friends array to include userId
        await databases.updateDocument(databaseId, userCollectionId, friendId, {
            friends: [...(friendUser.friends || []), userId]
        });

    } catch (error) {
        console.error("Error adding friend:", error.message);
        throw new Error("Failed to add friend.");
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