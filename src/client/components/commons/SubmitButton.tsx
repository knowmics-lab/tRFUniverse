import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faPlay } from "@fortawesome/free-solid-svg-icons";
import { useRemoteAnalysis } from "@/hooks";
import React from "react";

type SubmitButtonProps = {
    monitoredAnalysis: ReturnType<typeof useRemoteAnalysis<any, any>>;
    disabled: boolean;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    defaultIcon?: React.ReactNode;
    defaultText?: React.ReactNode;
};

export default function SubmitButton({
    monitoredAnalysis: { isRunning, status },
    disabled,
    onClick,
    defaultIcon = <FontAwesomeIcon icon={faPlay} className="me-2" />,
    defaultText = "Run analysis",
}: SubmitButtonProps) {
    return (
        <button className="btn btn-primary btn-lg" disabled={disabled || isRunning} onClick={onClick}>
            {!isRunning && defaultIcon}
            {isRunning && <FontAwesomeIcon icon={faCog} className="me-2 fa-spin" />}
            {(!isRunning || !status) && defaultText}
            {isRunning && status}
        </button>
    );
}
