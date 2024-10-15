import { Account, Client, ID, Avatars, Databases } from 'react-native-appwrite';

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'wp.readycheck',
    projectId: '670e82530023fa109c78',
    databaseId: '670e839a00385a7d92b5',
    userCollectionId: '670e83bd0016bbfbbedd',
    readycheckCollectionId: '670e83ed00022b41b412',
    storageId: '670e86540011d7ed9529',
}

const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform);

const account = new Account(client);
// const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register User
export const createUser = async (email, username, password) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            username,
            password

        );

        if (!newAccount) throw Error;

        const avatarURL = avatars.getInitials(username);

        await signIn(email, password);

        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarURL
            }
        )
        return newUser;
    } catch (error) {
        console.log(error);
        throw new Error(error)
    }
}

// Sign In User
export async function signIn(email, password) {
    try {
        const session = await account.createEmailSession(email, password)

        return session;

    } catch (error) {
        throw new Error(error);
    }
}