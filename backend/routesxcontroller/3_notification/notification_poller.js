// backend/endpoint_notifications/notification_poller.js
const pollingConnections = new Map();

export const addPollingConnection = (userId, connection) => {
    const key = String(userId);
    pollingConnections.set(key, { createdAt: Date.now(), ...connection });
};

export const removePollingConnection = (userId) => {
    const key = String(userId);
    if (pollingConnections.has(key)) {
        const connection = pollingConnections.get(key);
        clearTimeout(connection.timeout);
        pollingConnections.delete(key);
    }
};

export const sendToPollingClients = (userId, notification) => {
    const key = String(userId);
    if (pollingConnections.has(key)) {
        const connection = pollingConnections.get(key);
        clearTimeout(connection.timeout);
        
        connection.res.json({
            success: true,
            notifications: [notification],
            total_unread: 1
        });
        
        pollingConnections.delete(key);
    }
};

// Di notification_poller.js, tambahkan cleanup mechanism
export const cleanupPollingConnections = () => {
    const now = Date.now();
    for (const [userId, connection] of pollingConnections.entries()) {
        if (now - connection.createdAt > 30000) { // 30 detik timeout
            removePollingConnection(userId);
        }
    }
};

setInterval(cleanupPollingConnections, 60000);