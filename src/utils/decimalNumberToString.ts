export function decimalNumberToString(num: number) {
    let [whole, decimal] = num.toString().split('.');

    if (whole.includes('e+')) {
        const [coef, exp] = whole.split('e+');
        const zeros = Array(+exp - (coef.length - 1)).fill(0).join('');
        whole = coef.replace('.', '') + zeros;
    }

    return decimal ? `${whole}.${decimal}` : whole;
}