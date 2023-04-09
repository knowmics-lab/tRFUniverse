// noinspection HtmlRequiredTitleElement

import { Head, Html, Main, NextScript } from "next/document";

const DESCRIPTION =
    "tRFUniverse is a public web app through which users may analyze tRNA-derived ncRNAs in TCGA, TARGET, NCI-60, and biological fluids.";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <meta name="description" content={DESCRIPTION} />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <body className="g-sidenav-show bg-gray-100">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
