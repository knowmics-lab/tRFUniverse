import dynamic from "next/dynamic";
import useSWR from "swr";
import { PlotlyResponse } from "@/types";
import { useRef } from "react";
import Loading from "@/components/Loading";

const Plot = dynamic(() => import("react-plotly.js"), {
    loading: () => <Loading />,
    ssr: false,
});

type FetcherFunction<K> = (key: K) => Promise<PlotlyResponse>;

type PlotViewerProps<K> = {
    requestKey?: K;
    fetcher: FetcherFunction<K>;
};

export function LocalPlotViewer({ data }: { data?: PlotlyResponse["data"] }) {
    return <>{data && <Plot {...data} />}</>;
}

export default function PlotViewer<K>({ requestKey, fetcher }: PlotViewerProps<K>) {
    const fetcherRef = useRef(fetcher);
    const { data } = useSWR<PlotlyResponse, any, any>(requestKey, fetcherRef.current, { suspense: true });
    return <LocalPlotViewer data={data?.data} />;
}
