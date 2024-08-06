import Userpool from "../Userpool";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import { useState, useContext } from "react";
import { AccountContext } from "./Account";

const Signin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { authenticate } = useContext(AccountContext);

    const handleSubmit = (e) => {
        e.preventDefault();

        authenticate(email, password)
            .then(data => {
                console.log("Logged in!", data);
            })
            .catch(err => {
                console.error("Failed to login!", err);
            });
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Signin</button>
            </form>
        </div>
    );
};

export default Signin;
