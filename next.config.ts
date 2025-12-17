import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */

    serverExternalPackages: ["@takumi-rs/image-response"],
    output: "standalone",
};

export default nextConfig;
