// Development server
export const server: string = "https://mail-backend-mu.vercel.app/v1";

// Production server
export const server2: string = "https://mail-backend-mu.vercel.app/v1";

// Active server based on environment
export const activeServer: string = process.env.NODE_ENV === 'production' ? server2 : server;
