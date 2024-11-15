import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

// Define the schema
const schema = a.schema({
  // Users Table
  User: a.model({
    accountId: a.id().required(),
    username: a.string().required(),
    email: a.email().required(),
    avatar: a.string(), // URL string for avatars
    friends: a.hasMany('User', 'friendId'), // Self-referential Many-to-Many relation
    friendRequests: a.hasMany('User', 'requesterId'), // Self-referential Many-to-Many relation for requests
    displayName: a.string(),
    expoPushToken: a.string(),
  }),

  // Messages Table
  Message: a.model({
    message: a.string().required(),
    timestamp: a.datetime().required(),
    type: a.enum(['readycheck', 'group']),
    typeId: a.string().required(), // Related ID (e.g., ReadyCheck ID, Group ID)
    sender: a.belongsTo('User', 'senderId'), // Message sender
    group: a.belongsTo('Group', 'groupId'), // Group association if type is 'group'
  }),

  // Groups Table
  Group: a.model({
    name: a.string().required(),
    members: a.hasMany('GroupMember', 'groupId'), // Many-to-Many with User via GroupMember
  }),

  // Group Members Join Table
  GroupMember: a.model({
    groupId: a.id().required(),
    userId: a.id().required(),
    group: a.belongsTo('Group', 'groupId'),
    user: a.belongsTo('User', 'userId'),
  }),

  // Notifications Table
  Notification: a.model({
    type: a.string().required(),
    message: a.string().required(),
    timestamp: a.datetime().required(),
    readStatus: a.enum(['unread', 'read']),
    readyCheck: a.belongsTo('ReadyCheck', 'readyCheckId'), // Notification for a ReadyCheck
    sender: a.belongsTo('User', 'senderId'), // Notification sender
    recipient: a.belongsTo('User', 'recipientId'), // Notification recipient
  }),

  // ReadyChecks Table
  ReadyCheck: a.model({
    title: a.string().required(),
    timing: a.datetime().required(),
    description: a.string(),
    rsvps: a.hasMany('RSVP', 'readyCheckId'), // Many-to-Many relation with RSVP
    owner: a.belongsTo('User', 'ownerId'), // One-to-Many relation with User (Owner)
    invitees: a.hasMany('ReadyCheckInvite', 'readyCheckId'), // Many-to-Many via ReadyCheckInvite
  }),

  // RSVP Join Table
  RSVP: a.model({
    readyCheckId: a.id().required(),
    userId: a.id().required(),
    status: a.string().required(), // RSVP status
    readyCheck: a.belongsTo('ReadyCheck', 'readyCheckId'),
    user: a.belongsTo('User', 'userId'),
  }),

  // ReadyCheck Invite Join Table
  ReadyCheckInvite: a.model({
    readyCheckId: a.id().required(),
    userId: a.id().required(),
    readyCheck: a.belongsTo('ReadyCheck', 'readyCheckId'),
    user: a.belongsTo('User', 'userId'),
  }),
});

// Used for code completion / highlighting when making requests from frontend
export type Schema = ClientSchema<typeof schema>;

// Defines the data resource to be deployed
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});
