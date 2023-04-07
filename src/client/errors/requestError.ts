export default class RequestError extends Error {
    status = 0;
    info: {
        message: string;
        exception: string;
        file?: string;
        line?: number;
        trace?: {
            file: string;
            line: number;
            function: string;
            class: string;
            type: string;
        }[];
    } = { message: "", exception: "" };

    toString() {
        if (this.info.message) {
            return `${this.info.message} (${this.info.exception})`;
        }
        if (this.status) {
            return `Request error: ${this.status}`;
        }
        return this.message;
    }
}
