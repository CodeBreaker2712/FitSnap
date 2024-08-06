import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
    UserPoolId: "us-east-1_l5AOax0Ak",
    ClientId: "l02pfaqp87bh2kdr14h77d5tb"
};

const Userpool = new CognitoUserPool(poolData);

export default {
    signUp(email, password, attributes, callback) {
        Userpool.signUp(email, password, attributes, null, callback);
    }
};
