import { useEffect, useMemo } from "react";
import { echo } from "@/utils";

type WhenType = boolean | (() => boolean) | undefined;

export function useChannel<E = unknown>(
    channelName: string | undefined,
    eventName: string,
    callback: (data: E) => void,
    when: WhenType = undefined,
) {
    const channel = useMemo(() => (channelName ? echo.channel(channelName) : undefined), [channelName]);
    useEffect(() => {
        if (!channel) return;
        if (!channelName) return;
        if (when !== undefined) {
            if (typeof when === "function" && !when()) {
                return;
            } else if (!when) {
                return;
            }
        }
        channel.listen(eventName, callback);
        return () => {
            channel.stopListening(eventName);
        };
    }, [channelName, eventName, callback, channel, when]);
    return channel;
}

type ChannelSpec<E = unknown> = {
    channelName?: string;
    eventName: string;
    callback: (data: E) => void;
    when?: WhenType;
};

export function useChannels<E = unknown>(specs: ChannelSpec<E>[] = []) {
    const channels = useMemo(
        () =>
            specs.map((spec) => ({
                ...spec,
                channel: spec.channelName ? echo.channel(spec.channelName) : undefined,
            })),
        [specs],
    );
    useEffect(() => {
        channels.forEach(({ channelName, channel, when, eventName, callback }) => {
            if (!channelName) return;
            if (!channel) return;
            if (when !== undefined) {
                if (typeof when === "function" && !when()) {
                    return;
                } else if (!when) {
                    return;
                }
            }
            channel.listen(eventName, callback);
        });
        return () => {
            channels.forEach(({ channelName, channel, eventName, callback }) => {
                if (!channelName) return;
                if (!channel) return;
                channel.stopListening(eventName, callback);
            });
        };
    }, [channels]);
    return channels;
}
