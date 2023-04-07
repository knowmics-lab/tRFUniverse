const typeOf = (val: any, type = "undefined") => type === typeof val;
const isNull = (val: any) => val === null || typeOf(val);
const appendPrefix = (prefix: string, key: string) => {
    if (prefix === "") return key;
    return `${prefix}[${key}]`;
};
const encodeObject = (val: any, prefix = "", params: URLSearchParams, excludeKeys: string[]) => {
    if (excludeKeys.includes(prefix)) return;
    if (isNull(val)) return;
    if (Array.isArray(val)) {
        val.forEach((v, i) => {
            encodeObject(v, appendPrefix(prefix, `${i}`), params, excludeKeys);
        });
        return;
    }
    if (typeOf(val, "object")) {
        Object.entries(val).forEach(([k, v]) => {
            encodeObject(v, appendPrefix(prefix, k), params, excludeKeys);
        });
        return;
    }
    params.append(prefix, `${val}`);
};

export default function querySerialize(params: any, excludeKeys: any[] = []) {
    const urlParams = new URLSearchParams();
    encodeObject(params, "", urlParams, excludeKeys);
    return urlParams;
}
