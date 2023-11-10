![Cover](mobile/assets/images/Cover.png)
# Bubble, a modern chat app 💬

This is a chat app built with React Native, Supabase and Node.js. 
It provides a real-time chat system with all the basic functionalities for a chat application

# Features:
- Authentification
- Realtime chat system (send, receive and delete message), 
- Send messages with medias (photos and videos)
- User profiles

The app utilizes various libraries and components such as React Navigation, Socket.io, Reanimated, Expo and more!
Feel free to modify and enhance the app according to your needs!

# Prerequisites:
- Node.js: Visit the official Node.js website and follow the instructions to install the latest LTS version of Node.js.
- NPM (Node Package Manager): NPM is automatically installed with Node.js.
- Xcode (for macOS) or Android Studio (for Windows/Linux): Depending on your target platform
- A Supabase account 

# Installation Steps:
- Clone the repository
- Install dependencies: Run `npm install` in the "mobile" and "server" folders
- For ios users: Run `pod install` in the "mobile" folder
- Create a new project on supabase and copy the sql code to create databases.
- Create two buckets in your supabase project "avatars" and "chats"
- Copy your supabase credentials and paste them into the supabase.js file, do the same for the server folder but in the env file.
- Use your local ip address in 'hooks/axios.js' to etablish the connection to the node server
- Start the expo development server: `npm run start` into the "mobile" directory and the "server" directory
- Use your local ip address in the file "hooks/axios.js"
- Build and run the app: `npm run android` or `npm run ios`

Enjoy coding! 🚀

----------------------

https://www.linkedin.com/in/aka-joseph/
https://github.com/mrAlphak