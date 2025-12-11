# Bright Wolf Hop

Bright Wolf Hop is a full-stack application designed to be a social platform for users to share their thoughts and connect with others. The application is built with a React frontend and a FastAPI backend.

## Current Functionalities and Features

### User Authentication
- **Signup**: Users can create a new account with a unique email address. The system prevents the creation of multiple accounts with the same email.
- **Login**: Registered users can log in securely. The system checks for correct credentials and prevents unauthorized access.
- **Password Hashing**: User passwords are securely hashed before being stored in the database.

### User Profile
- **Settings Page**: Users can update their display name and change their password.

### Core Features
- **Create Reflections**: Users can create and share their thoughts as "reflections."
- **Herds**: Users can create and join groups called "herds" to share reflections with a specific audience.
- **Friends**: Users can add and manage friends to build their social network.
- **Notifications**: Users receive notifications for important events, such as new friend requests or reactions to their reflections.
- **Reactions**: Users can react to reflections to express their feelings.

## Currently Not Enabled

- **Real-time Notifications**: The current notification system relies on polling and is not yet implemented with WebSockets for real-time updates.
- **Advanced User Profiles**: User profiles are basic and do not yet include features like profile pictures, bios, or activity feeds.
- **Search Functionality**: There is no functionality to search for users, herds, or reflections.

## Future Work

- **Real-time Notifications**: Implement WebSockets to provide instant notifications to users.
- **Enhanced User Profiles**: Add more customization options to user profiles, including profile pictures, cover photos, and personal bios.
- **Search**: Implement a comprehensive search feature to allow users to find friends, herds, and reflections easily.
- **Direct Messaging**: Add a private messaging system for users to communicate directly with their friends.
- **Content Moderation**: Introduce tools for content moderation to ensure a safe and positive community environment.

---
