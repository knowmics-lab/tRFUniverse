import { Col, Overlay, Row, Tooltip } from "react-bootstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { RefObject, useId, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareSquare } from "@fortawesome/free-solid-svg-icons";
import { useEffectOnce, useTimeoutFn } from "react-use";

export default function ShareThisPage({
    text = "Share this analysis",
    tooltipText = "Link copied to clipboard!",
}: {
    text?: string;
    tooltipText?: string;
}) {
    const overlayId = useId();
    const copyButtonRef = useRef<HTMLButtonElement>() as RefObject<HTMLButtonElement>;
    const [copied, setCopied] = useState(false);
    const [show, setShow] = useState(false);
    const [, , reset] = useTimeoutFn(() => setCopied(false), 2000);
    useEffectOnce(() => setShow(true));
    return (
        <Row className="justify-content-end my-0">
            <Col sm="auto">
                {show && (
                    <>
                        <CopyToClipboard
                            text={window.location.href}
                            onCopy={() => {
                                setCopied(true);
                                reset();
                            }}
                        >
                            <button ref={copyButtonRef} className="btn btn-xs btn-link m-0">
                                <FontAwesomeIcon icon={faShareSquare} />
                                <span className="d-sm-inline ms-1">{text}</span>
                            </button>
                        </CopyToClipboard>
                        <Overlay target={copyButtonRef.current} show={copied} placement="top">
                            {(props) => (
                                <Tooltip id={overlayId} {...props}>
                                    {tooltipText}
                                </Tooltip>
                            )}
                        </Overlay>
                    </>
                )}
            </Col>
        </Row>
    );
}
