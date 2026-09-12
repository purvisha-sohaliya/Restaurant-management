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
                const res = await getProfile();
                if (res?.success) {
                    setUser(res.data);
                }
            } catch (error) {
                console.log(
                    "PROFILE ERROR:",
                    error.response?.data ||
                    error.message
                );

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
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);