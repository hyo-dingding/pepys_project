import dotenv from "dotenv";
import { expand } from "dotenv-expand";
import path from "path";

if (process.env.STAGE) {
    expand(
        dotenv.config({
            path: path.join(__dirname, `.env.${process.env.STAGE}`),
            override: true,
        })
    );
}

export default {
    expo: {
        name: "YourAppName",
        slug: "your-app",
        version: "1.0.0",
        orientation: "portrait",
        extra: {
            supabaseUrl: process.env.SUPABASE_URL,
            supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#FFFFFF",
            },
        },
        ios: {
            supportsTablet: true,
        },
        web: {
            favicon: "./assets/favicon.png",
        },
    },
};
