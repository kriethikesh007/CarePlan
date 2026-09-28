/**
 * CarePlan Centralized API Client
 * Interfaces directly with the Spring Boot backend at http://localhost:8080
 */
(function() {
    // If frontend is served directly by the backend (port 8080), use relative paths; otherwise use localhost:8080
    const API_BASE = window.location.origin.includes('8080') ? '' : 'http://localhost:8080';

    /**
     * Internal request dispatcher
     */
    async function request(path, options = {}) {
        const url = path.startsWith('http') ? path : (API_BASE + path);
        const headers = { ...options.headers };

        // Attach Content-Type: application/json if sending JSON body
        if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // 204 No Content
            if (response.status === 204) {
                return null;
            }

            // Attempt to parse JSON response
            const contentType = response.headers.get('content-type') || '';
            let data = null;
            if (contentType.includes('application/json')) {
                data = await response.json().catch(() => null);
            } else {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch {
                    data = { message: text };
                }
            }

            if (!response.ok) {
                // Construct standardized error object
                const error = new Error(extractErrorMessage(data, response.status));
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (err) {
            if (err.status) {
                throw err;
            }
            // Network failure / server unreachable
            const networkError = new Error('Unable to connect to CarePlan server. Please ensure the backend is running at http://localhost:8080.');
            networkError.status = 0;
            networkError.data = { message: networkError.message };
            throw networkError;
        }
    }

    /**
     * Extracts readable error message from Spring Boot error payload
     */
    function extractErrorMessage(data, status) {
        if (!data) {
            return `Request failed with status ${status}`;
        }

        // Standard message field (from our GlobalExceptionHandler)
        if (data.message) {
            return data.message;
        }

        // Bean validation errors: { field: "must not be null", ... }
        if (typeof data === 'object') {
            const fields = Object.keys(data);
            if (fields.length > 0) {
                const firstField = fields[0];
                return `${firstField}: ${data[firstField]}`;
            }
        }

        return `Server returned status ${status}`;
    }

    // Expose API module globally
    window.API_BASE = API_BASE;
    window.api = {
        get: (path) => request(path, { method: 'GET' }),
        post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
        put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
        del: (path) => request(path, { method: 'DELETE' }),
        // For endpoints accepting URL Query Parameters (such as /api/dose-logs)
        postParams: (path) => request(path, { method: 'POST' })
    };
})();
