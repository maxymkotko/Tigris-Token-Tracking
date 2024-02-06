import {useState, createContext, useRef, useEffect} from 'react';
import {getAccount, getNetwork} from "@wagmi/core";
import {eventSocket} from "./socket";

interface SocketEventHandlers {
    [event: string]: (data: any) => void;
}

interface ChartMechanicsContextType {
    tradingStatus: string;
    setTradingStatus: (status: string) => void;
    executionPrice: number;
    setExecutionPrice: (price: number) => void;
    expectingClick: ExpectedClick;
    setExpectingClick: (isExpecting: boolean, type: string, callback?: (...args: unknown[]) => void) => void;
    openPrice: string;
    setOpenPrice: (price: string) => void;
    isLong: boolean;
    setIsLong: (isLong: boolean) => void;
    orderType: string;
    setOrderType: (orderType: string) => void;
    margin: bigint;
    setMargin: (margin: bigint) => void;
    leverage: bigint;
    setLeverage: (leverage: bigint) => void;
    takeProfitPrice: bigint;
    setTakeProfitPrice: (tp: bigint) => void;
    stopLossPrice: bigint;
    setStopLossPrice: (sl: bigint) => void;
    takeProfitPriceDisplay: string;
    stopLossPriceDisplay: string;
    setTakeProfitPriceDisplay: (tp: string) => void;
    setStopLossPriceDisplay: (sl: string) => void;
    isTpFixed: boolean;
    setTpFixed: (isTpFixed: boolean) => void;
    isSlFixed: boolean;
    setSlFixed: (isSlFixed: boolean) => void;
    takeProfitPercent: string;
    stopLossPercent: string;
    setTakeProfitPercent: (tp: string) => void;
    setStopLossPercent: (sl: string) => void;
}

export const ChartMechanicsContext = createContext<ChartMechanicsContextType>({
    tradingStatus: "",
    setTradingStatus: (status: string) => {console.log("Clicked dummy function")},
    executionPrice: 0,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setExecutionPrice: (price: number) => {console.log("Clicked dummy function")},
    expectingClick: {
        isExpecting: false as boolean,
        type: "",
        callback: undefined
    },
    setExpectingClick: (isExpecting: boolean, type: string, callback?: (...args: unknown[]) => void) => {console.log("Clicked dummy function")},
    openPrice: '0',
    setOpenPrice: (price: string) => {console.log("Clicked dummy function")},
    isLong: true,
    setIsLong: (isLong: boolean) => {console.log("Clicked dummy function")},
    orderType: "Market",
    setOrderType: (orderType: string) => {console.log("Clicked dummy function")},
    margin: BigInt(5e18),
    setMargin: (margin: bigint) => {console.log("Clicked dummy function")},
    leverage: BigInt(100e18),
    setLeverage: (leverage: bigint) => {console.log("Clicked dummy function")},
    takeProfitPrice: BigInt(0),
    setTakeProfitPrice: (tp: bigint) => {console.log("Clicked dummy function")},
    stopLossPrice: BigInt(0),
    setStopLossPrice: (sl: bigint) => {console.log("Clicked dummy function")},
    takeProfitPriceDisplay: '',
    stopLossPriceDisplay: '',
    setTakeProfitPriceDisplay: (tp: string) => {console.log("Clicked dummy function")},
    setStopLossPriceDisplay: (sl: string) => {console.log("Clicked dummy function")},
    isTpFixed: false,
    setTpFixed: (isTpFixed: boolean) => {console.log("Clicked dummy function")},
    isSlFixed: false,
    setSlFixed: (isSlFixed: boolean) => {console.log("Clicked dummy function")},
    takeProfitPercent: '500',
    stopLossPercent: '',
    setTakeProfitPercent: (tp: string) => {console.log("Clicked dummy function")},
    setStopLossPercent: (sl: string) => {console.log("Clicked dummy function")}
});

export const ChartMechanicsProvider = (props: any) => {
    // Trading status
    const [tradingStatus, setTradingStatus] = useState("");
    // Blue line on the chart to show the execution price
    const [executionPrice, setExecutionPrice] = useState(0);
    // Trading inputs
    const [openPrice, setOpenPrice] = useState('0');
    const [isLong, setIsLong] = useState(true);
    const [orderType, setOrderType] = useState("Market");
    const [margin, setMargin] = useState(BigInt(5e18));
    const [leverage, setLeverage] = useState(BigInt(100e18));
    const [takeProfitPrice, setTakeProfitPrice] = useState(BigInt(0));
    const [stopLossPrice, setStopLossPrice] = useState(BigInt(0));
    const [takeProfitPriceDisplay, setTakeProfitPriceDisplay] = useState('');
    const [stopLossPriceDisplay, setStopLossPriceDisplay] = useState('');
    const [isTpFixed, setTpFixed] = useState(false);
    const [isSlFixed, setSlFixed] = useState(false);
    const [takeProfitPercent, setTakeProfitPercent] = useState('');
    const [stopLossPercent, setStopLossPercent] = useState('');

    // Point & click trading
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const [expectingClick, setExpectingClickState] = useState<ExpectedClick>(
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        {isExpecting: false, type: ""}
    );
    const timeout = useRef<NodeJS.Timeout>();
    const setExpectingClick = (isExpecting: boolean, type: string, callback?: (...args: unknown[]) => void) => {
        setExpectingClickState({isExpecting: isExpecting, type: type, callback: callback});
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            setExpectingClickState({isExpecting: false, type: "", callback: callback});
        }, 5000);
    }

    useEffect(() => {
        if (!expectingClick.isExpecting) {
            clearTimeout(timeout.current);
        }
    }, [expectingClick]);

    useEffect(() => {

        const handlers: SocketEventHandlers = {
            'AddressEvent': (data) => {
                if (getNetwork().chain?.id === data.chainId && data.trader === getAccount().address) {
                    setExecutionPrice(0);
                }
            },
            'AddressOptionsEvent': (data) => {
                if (getNetwork().chain?.id === data.chainId && data.trader === getAccount().address) {
                    setExecutionPrice(0);
                }
            }
        }

        Object.keys(handlers).forEach((event) => {
            eventSocket.on(event, handlers[event]);
        });

        return () => {
            Object.keys(handlers).forEach((event) => {
                eventSocket.off(event, handlers[event]);
            });
        };
    }, []);

    return (
        <ChartMechanicsContext.Provider
            value={{
                tradingStatus: tradingStatus,
                setTradingStatus: setTradingStatus,
                executionPrice: executionPrice,
                setExecutionPrice: setExecutionPrice,
                expectingClick: expectingClick,
                setExpectingClick: setExpectingClick,
                openPrice: openPrice,
                setOpenPrice: setOpenPrice,
                isLong: isLong,
                setIsLong: setIsLong,
                orderType: orderType,
                setOrderType: setOrderType,
                margin: margin,
                setMargin: setMargin,
                leverage: leverage,
                setLeverage: setLeverage,
                takeProfitPrice: takeProfitPrice,
                setTakeProfitPrice: setTakeProfitPrice,
                stopLossPrice: stopLossPrice,
                setStopLossPrice: setStopLossPrice,
                takeProfitPriceDisplay: takeProfitPriceDisplay,
                stopLossPriceDisplay: stopLossPriceDisplay,
                setTakeProfitPriceDisplay: setTakeProfitPriceDisplay,
                setStopLossPriceDisplay: setStopLossPriceDisplay,
                isTpFixed: isTpFixed,
                setTpFixed: setTpFixed,
                isSlFixed: isSlFixed,
                setSlFixed: setSlFixed,
                takeProfitPercent: takeProfitPercent,
                stopLossPercent: stopLossPercent,
                setTakeProfitPercent: setTakeProfitPercent,
                setStopLossPercent: setStopLossPercent
            }}
        >
            {props.children}
        </ChartMechanicsContext.Provider>
    );
};

interface ExpectedClick {
    isExpecting: boolean;
    type: string;
    callback?: ((...args: unknown[]) => void) | undefined;
}