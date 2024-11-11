// import React, { createContext, useContext, useEffect, useState } from "react";
// import { client } from "../lib/appwrite"; 

// const RealTimeContext = createContext();

// export const RealTimeProvider = ({ children }) => {
//     const [documents, setDocuments] = useState([]); // Store real-time documents here

//     useEffect(() => {
//         // Subscribe to real-time updates only once when provider mounts
//         const unsubscribe = client.subscribe("documents", (response) => {
//             const eventType = response.events[0];
//             const changedDocument = response.payload;

//             if (eventType.includes("create")) {
//                 setDocuments((prevDocs) => [changedDocument, ...prevDocs]);
//             }

//             if (eventType.includes("update")) {
//                 setDocuments((prevDocs) =>
//                     prevDocs.map((doc) =>
//                         doc.$id === changedDocument.$id ? changedDocument : doc
//                     )
//                 );
//             }

//             if (eventType.includes("delete")) {
//                 setDocuments((prevDocs) =>
//                     prevDocs.filter((doc) => doc.$id !== changedDocument.$id)
//                 );
//             }
//         });

//         // Clean up the subscription on unmount
//         return () => unsubscribe();
//     }, []);

//     return (
//         <RealTimeContext.Provider value={{ documents }}>
//             {children}
//         </RealTimeContext.Provider>
//     );
// };

// // Custom hook to access the real-time data
// export const useRealTime = () => useContext(RealTimeContext);
