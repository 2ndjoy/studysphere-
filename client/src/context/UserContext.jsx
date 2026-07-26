import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { getProfile } from "../services/userService";

const UserContext = createContext();

export const UserProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {

        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        try {

            const profile = await getProfile();

            setUser(profile);

        } catch (error) {

            console.error(error);

            setUser(null);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchUser();

    }, []);

    return (

        <UserContext.Provider
            value={{
                user,
                setUser,
                fetchUser,
                loading,
            }}
        >

            {children}

        </UserContext.Provider>

    );

};

export const useUser = () => useContext(UserContext);