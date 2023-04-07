const LOADING_BACKGROUND =
    'url(\'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" ' +
    'height="100%" viewBox="0 0 100% 100%"><text fill="%23FF0000" x="50%" y="50%" font-family="\\\'Lucida Grande\\\', ' +
    'sans-serif" font-size="24" text-anchor="middle">Loading...</text></svg>\') 0px 0px no-repeat';

export default function RemoteView({ url }: { url: string }) {
    return (
        <iframe
            style={{
                width: "100%",
                height: "100%",
                border: "none",
                background: LOADING_BACKGROUND,
            }}
            className="flex-grow-1"
            src={url}
            loading="lazy"
        />
    );
}
