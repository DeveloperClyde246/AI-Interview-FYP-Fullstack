import React, { useEffect, useState } from "react";
import { getAllUsers } from "../api/users";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getAllUsers().then(setUsers);
  }, []);

  return (
    <div>
      <h2>All Users</h2>
      <ul>
        {users.map((u) => (
          <li key={u._id}>{u.name} - {u.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
