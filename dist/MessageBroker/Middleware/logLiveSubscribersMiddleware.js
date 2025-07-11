/**
 * Middleware to log all live subscribers before message is published.
 * You can add this via `broker.use(logLiveSubscribersMiddleware)`
 */
export function logLiveSubscribersMiddleware(broker, // Pass the broker so middleware can access .subscribers
label = "") {
    return (msg, next) => {
        const subscribers = broker.getSubscribers();
        console.log(`[LiveSubscribers] ${label} Subscribers: ${subscribers.length}`);
        let i = 1;
        for (const sub of subscribers) {
            // Optionally, print just the handler name (if it exists)
            let name = sub.handler.name || "(anonymous)";
            console.log(`  ${i++}. Handler: ${name}`, sub);
        }
        next(msg);
    };
}
//# sourceMappingURL=logLiveSubscribersMiddleware.js.map