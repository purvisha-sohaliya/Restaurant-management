
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getProfile } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadUser = async () => {

      try {

        console.log("CHECKING LOGIN SESSION...");

        const res = await getProfile();

        console.log("PROFILE RESPONSE:", res);

        if (res.success) {

          setUser(res.data);

          console.log(
            "USER RESTORED:",
            res.data
          );

        } else {

          setUser(null);

        }

      } catch (error) {
    console.log(
        "PROFILE ERROR:",
        error.response?.data || error.message
    );

    // Only remove user when authentication is actually invalid
    if (error.response?.status === 401) {
        setUser(null);
    }
} finally {

        setLoading(false);

      }

    };

    loadUser();

  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  return useContext(AuthContext);
};