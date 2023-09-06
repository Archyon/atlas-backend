import axios from "axios";

// authorization for the microservice
export const authorizationMS = { authorization: process.env.API_TOKEN };

// authorization for a user
export const authorizationUser = (token: string) => {
    return { authorization: token };
};

export async function getAuth() {
    var options = {
        method: "POST",
        url: "https://dev-sqg3xz8h1fpw2nan.eu.auth0.com/oauth/token",
        headers: { "content-type": "application/json" },
        body: '{"client_id":"f5Ecbq4wCwKfQ8vh1MoeAgd83SLy6CDI","client_secret":"xzADHTSFg_wITNW2Ob2lM8O5gOCGVOMdzuXvO5p245OLmftBopX9zu3V2pigzknz","audience":"http://localhost:8080","grant_type":"client_credentials"}',
    };

    const clientId = "f5Ecbq4wCwKfQ8vh1MoeAgd83SLy6CDI";
    const clientSecret =
        "xzADHTSFg_wITNW2Ob2lM8O5gOCGVOMdzuXvO5p245OLmftBopX9zu3V2pigzknz";
    const audience = "http://localhost:8080";

    const data = {
        client_id: clientId,
        client_secret: clientSecret,
        audience: audience,
        grant_type: "client_credentials",
    };

    const axiosConfig = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    try {
        const response = await axios.post(
            "https://dev-sqg3xz8h1fpw2nan.eu.auth0.com/oauth/token",
            data,
            axiosConfig,
        );
        console.log(response.data);
        const token = response.data;
        return token.access_token;
    } catch (error: any) {
        throw new Error(error);
    }
}
