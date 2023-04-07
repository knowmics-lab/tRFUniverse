import Echo from "laravel-echo";
import Pusher from "pusher-js";

export const echo = new Echo({
    broadcaster: "pusher",
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST,
    wsPort: +(process.env.NEXT_PUBLIC_PUSHER_PORT ?? ""),
    forceTLS: false,
    encrypted: true,
    disableStats: true,
    enabledTransports: [process.env.NEXT_PUBLIC_PUSHER_PROTOCOL ?? "ws"],
    client: new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY ?? "", {
        wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST,
        wsPort: +(process.env.NEXT_PUBLIC_PUSHER_PORT ?? ""),
        forceTLS: false,
        disableStats: true,
        enabledTransports: ["ws", "wss"],
    }),
});
