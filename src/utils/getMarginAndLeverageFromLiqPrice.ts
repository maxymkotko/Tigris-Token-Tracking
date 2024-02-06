import numeric from "numeric";

function calculate_liquidation_price(_direction: boolean, _entry_price: number, _leverage: number, _margin: number, _acc_interest: number) {
    let _liqPrice: number;
    if (_direction) {
        _liqPrice = _entry_price - _entry_price * (_margin * 0.9 + _acc_interest) / _margin / _leverage;
    } else {
        _liqPrice = _entry_price + _entry_price * (_margin * 0.9 + _acc_interest) / _margin / _leverage;
    }
    return _liqPrice;
}

export function getMarginAndLeverageFromLiqPrice(direction: boolean, entryPrice: number, margin: number, leverage: number, accInterest: number, desired_liqPrice: number) {
    // Normalize entry price and desired liquidation price in case of big or tiny numbers
    const normalization_factor = Math.pow(10, Math.floor(Math.log10(entryPrice)));
    entryPrice /= normalization_factor;
    desired_liqPrice /= normalization_factor;
    const position_size = margin * leverage;

    // This is the objective function we want to minimize
    function objective(params: number[]) {
        const _margin = params[0];
        const _leverage = position_size / _margin;
        const _liqPrice = calculate_liquidation_price(direction, entryPrice, _leverage, _margin, accInterest);
        return Math.pow((_liqPrice - desired_liqPrice), 2);
    }

    const result = numeric.uncmin(objective, [margin]);

    const new_margin = result.solution[0];
    const new_leverage = position_size / new_margin;

    return {
        newMargin: new_margin,
        newLeverage: new_leverage
    };
}
