import socketio from "socket.io-client"
import { toast } from 'react-toastify';

export const oracleSocket = socketio(
    new Date().getTimezoneOffset() > 120 ?
        'https://us1.tigrisoracle.net' :
        'https://eu1.tigrisoracle.net',
    {
        transports: ['websocket', 'polling'],
        timeout: 3000
    }
);

oracleSocket.on('connect', () => {
    console.log('[oracleSocket] Connected');
});

oracleSocket.on('disconnect', (reason) => {
    console.log('[oracleSocket] Disconnected:', reason);
});

oracleSocket.on('data', (data) => {
    oracleData = data;
    lastOracleReceive = Date.now();
});

export const eventSocket = socketio(
    new Date().getTimezoneOffset() > 120
        ? 'https://us1events.tigristrade.info'
        : 'https://eu1events.tigristrade.info',
    {
        transports: ['websocket', 'polling'],
        timeout: 3000
    }
);

let isEventFirstConnection = true;

eventSocket.on('connect', () => {
    console.log('[eventSocket] Connected');
    const isFirstConnection = isEventFirstConnection;
    isEventFirstConnection = false;
    if (isFirstConnection) return;
    toast.dismiss();
    toast.success('Reconnected to events!');
    setTimeout(() => {
        eventSocket.emit("resend");
    }, 1000);
});

eventSocket.on('disconnect', (reason) => {
    console.log('[eventSocket] Disconnected:', reason);
    toast.dismiss();
    toast.warning('Disconnected from events!');
});

eventSocket.on('error', (error) => {
    console.log('[eventSocket] Error:', error);
});

export const priceChangeSocket = socketio('https://24h.tigristrade.info', {transports: ['websocket'] });
priceChangeSocket.on('connect', () => {
    console.log('[priceChangeSocket] Connected');
});

priceChangeSocket.on('disconnect', (reason) => {
    console.log('[priceChangeSocket] Disconnected:', reason);
});

priceChangeSocket.on('error', (error) => {
    console.log('[priceChangeSocket] Error:', error);
});

priceChangeSocket.on('data', (data) => {
    priceChangeData = data;
});

export const chatSocket = socketio('https://chat.tigristrade.info', {transports: ['websocket']});
chatSocket.on('disconnect', (reason) => {
    console.log('[chatSocket] Disconnected:', reason);
});
export let oracleData = "Loading...";

export let priceChangeData = "Loading...";

export let lastOracleReceive = 0;
