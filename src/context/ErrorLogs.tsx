export const LogError = (
  address: any = '0x0',
  message: any = 'no_message',
  is_gasless: any = 0,
  tx: any = 0,
  action: any
) => {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: address,
      message: message,
      is_gasless: is_gasless,
      tx: tx,
      action: action
    })
  };
  fetch('https://error.tigristrade.info/log', requestOptions).then((response) =>
    console.log('Error logged')
  );
};
