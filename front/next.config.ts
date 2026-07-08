import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    //ip de maquina
    "172.17.96.1",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
