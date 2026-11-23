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

    const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));

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
        if (!localStorage.getItem("token")) return;

        let active = true;

        getProfile()
            .then((profile) => {
                if (active) setUser(profile);
            })
            .catch((error) => {
                console.error("Failed to load user", error);
                if (active) setUser(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
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