import Userpool from "../Userpool";
import { useState } from "react";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [gender, setGender] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if passwords match
        if (password !== confirmPassword) {
            console.log("Passwords do not match");
            return;
        }

        // Prepare attributes
        const attributeList = [
            new CognitoUserAttribute({ Name: 'name', Value: name }),
            new CognitoUserAttribute({ Name: 'birthdate', Value: birthdate }),
            new CognitoUserAttribute({ Name: 'gender', Value: gender })
        ];

        // Sign up
        Userpool.signUp(email, password, attributeList, null, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
            }
        });
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="name">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

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

                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <label htmlFor="birthdate">Birthdate</label>
                <input
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                />

                <label htmlFor="gender">Gender</label>
                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Non-Binary</option>
                </select>

                <button type="submit">Signup</button>
            </form>
        </div>
    );
};

export default Signup;
