
import { createContext, useState } from "react";

export const AuthContext = createContext(null);

function AuthProvider({ children }) {
    const [token, setToken] = useState(
        () => localStorage.getItem("token")
    );

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{ token, setToken, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
