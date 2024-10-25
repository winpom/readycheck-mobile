import { Account, Client, ID, Avatars, Databases, Query, Storage } from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: "https://cloud.appwrite.io/v1",
    platform: "com.wp.readycheck",
    projectId: "670faf450016d4610c15",
    databaseId: "670fb03d0039ae43b0b3",
    userCollectionId: "670fb05000340d720fd0",
    readycheckCollectionId: "670fb069000ec4a96868",
    storageId: "670fb14b0038ddfb7ad6",
}

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
        const readychecks = await databases.listDocuments(
            databaseId,
            readycheckCollectionId,
            [Query.equal("invitee", userId)]
        )

        return readychecks.documents;
    } catch (error) {
        throw new Error(error);
    }
}

// signOut
export const signOut = async () => {
    try {
        const session = await account.deleteSession("current")
        return session;
    } catch (error) {
        throw new Error(error)
    }
}

// Create ReadyCheck
export const createReadyCheck = async (form) => {
    try {
        const newReadyCheck = await databases.createDocument(databaseId, readycheckCollectionId, ID.unique(), {
            title: form.title,
            timing: form.timing,
            activity: form.activity,
            description: form.description,
            invitees: form.invitees,
            owner: form.userId,
        }
    ) 
    return newReadyCheck;
    } catch (error) {
        throw new Error(error)
    }
}

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

    const { mimeType, ...rest } = file;
    const asset = { type: mimeType, ...rest }

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
            databaseId, userCollectionId, ID.unique(), {
                profileImage: profileImageUrl
            }
        )

        return newProfileImage;
    } catch (error) {
        throw new Error(error)
    }
}