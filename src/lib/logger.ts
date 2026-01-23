/**
 * Standardized logging utility for the application.
 * Permits easy integration with external logging services (like Sentry or Axiom) in the future.
 */
export const logger = {
    error: (message: string, error?: any, context?: any) => {
        const payload = {
            message,
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : error,
            context,
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV
        };

        // Standard console error for immediate visibility in logs (Vercel/Docker)
        console.error(`[ERROR] ${message}`, JSON.stringify(payload, null, 2));

        // FUTURE: Send to Sentry/Axiom here
    },

    warn: (message: string, context?: any) => {
        console.warn(`[WARN] ${message}`, {
            context,
            timestamp: new Date().toISOString()
        });
    },

    info: (message: string, context?: any) => {
        console.log(`[INFO] ${message}`, {
            context,
            timestamp: new Date().toISOString()
        });
    }
};
