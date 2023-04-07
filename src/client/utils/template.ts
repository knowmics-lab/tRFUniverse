export default function template<O>(strings: string[], ...keys: (keyof O)[]) {
    return (values: O) => {
        const result = [strings[0]];
        keys.forEach((key, i) => {
            result.push(`${values[key]}`, strings[i + 1]);
        });
        return result.join("");
    };
}
