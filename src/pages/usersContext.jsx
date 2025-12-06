// import { createContext, useContext, useState } from "react";

// const UsersContext = createContext();

// export const UsersProvider = ({ children }) => {
//   const [users, setUsers] = useState([
//     {
//       UserID: 1,
//       FirstName: "John",
//       LastName: "Doe",
//       Email: "john@example.com",
//       PhoneNumber: "9876543210",
//       RoleName: "Manager",
//       Stores: [{ StoreName: "Main Store" }],
//       IsActive: true,
//       ProfileImageUrl: "",
//     },
//     {
//       UserID: 2,
//       FirstName: "Sarah",
//       LastName: "Williams",
//       Email: "sarah@example.com",
//       PhoneNumber: "9123456780",
//       RoleName: "Cashier",
//       Stores: [{ StoreName: "Outlet 1" }],
//       IsActive: false,
//       ProfileImageUrl: "",
//     },
//   ]);

//  const addUser = (newUser) => {
//   setUsers((prev) => [newUser, ...prev]); 
// };


//   return (
//     <UsersContext.Provider value={{ users, addUser }}>
//       {children}
//     </UsersContext.Provider>
//   );
// };

// export const useUsers = () => useContext(UsersContext);
// src/contexts/UsersContext.js
import { createContext, useState, useContext } from "react";

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([
   
  ]);

  const addUser = (newUser) => {
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (userId, updatedUser) => {
    setUsers(prev => prev.map(user => 
      user.UserID === userId ? { ...user, ...updatedUser } : user
    ));
  };

  const deleteUser = (userId) => {
    setUsers(prev => prev.filter(user => user.UserID !== userId));
  };

  const toggleUserStatus = (userId, status) => {
    setUsers(prev => prev.map(user => 
      user.UserID === userId ? { ...user, IsActive: status } : user
    ));
  };

  return (
    <UsersContext.Provider value={{ users, addUser, updateUser, deleteUser, toggleUserStatus }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
};
