import { useEffect, useState, useRef, useContext } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/system';
import { TigrisInput } from '../Input';
import { IconDropDownMenu } from '../Dropdown/IconDrop';
import { CommonDropDown } from '../Dropdown';
import { useAccount, useFeeData, useNetwork, useWalletClient } from 'wagmi';
import { getNetwork } from 'src/constants/networks';
import { forwarder, getProxyWalletClients } from 'src/proxy_wallet';
import { toast } from 'react-toastify';
import { oracleData, oracleSocket } from 'src/context/socket';
import { useTokenDetailsData } from '../../hook/tokenDetails/useTokenDetailsData';
import { encodeFunctionData, formatUnits, parseEther } from 'viem';
import { ChartMechanicsContext } from '../../context/ChartMechanics';
import { useTokenBalance } from '../../hook/useToken';
import { LogError } from '../../context/ErrorLogs';
import { NO_PERMIT, NO_PRICE_DATA } from '../../constants/EmptyDataStructs';
import { useTranslation } from 'react-i18next';

const marginArr = ['Add', 'Remove'];

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

function BootstrapDialogTitle(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle
      sx={{ m: 0, p: '24px', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.1em' }}
      {...other}
    >
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

interface EditModalProps {
  isState: boolean;
  setState: (value: boolean) => void;
  position: any;
}

export const EditModal = (props: EditModalProps) => {
  const { address: userAddress, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { isState, setState, position } = props;
  const partialArr = getNetwork(chain?.id ?? 42161).marginAssets;
  const positionRef = useRef<any>(position);
  const { data: walletClient } = useWalletClient();
  const { setExecutionPrice, tradingStatus } = useContext(ChartMechanicsContext);
  const { data: feeData } = useFeeData();
  const { t } = useTranslation();
  const initialState = {
    stopLoss: '',
    profit: '',
    partial: partialArr[0],
    addMenu: partialArr[0],
    partialPro: '100',
    addNum: '',
    addDrop: 'Add',
    posDrop: partialArr[0],
    addToPositionMargin: ''
  };
  const [editState, setEditState] = useState(initialState);

  const liveAddMarginBalance = useTokenBalance(editState.addMenu.address);
  const liveAddToPositionBalance = useTokenBalance(editState.posDrop.address);
  const [addMarginBalance, setAddMarginBalance] = useState<any>('0');
  const [addToPositionBalance, setAddToPositionBalance] = useState<any>('0');
  useEffect(() => {
    if (liveAddMarginBalance) {
      setAddMarginBalance(formatUnits(liveAddMarginBalance, editState.addMenu.decimals));
    }
  }, [liveAddMarginBalance]);
  useEffect(() => {
    if (liveAddToPositionBalance) {
      setAddToPositionBalance(formatUnits(liveAddToPositionBalance, editState.posDrop.decimals));
    }
  }, [liveAddToPositionBalance]);

  const handleClose = () => {
    setState(false);
  };

  const [referral, setReferral] = useState<any>({});
  const [openFees, setOpenFees] = useState<any>({});
  const [closeFees, setCloseFees] = useState<any>({});
  const [pairData, setPairData] = useState<any>({});
  const liveTokenDetailsData = useTokenDetailsData(position ? position.asset : 0);
  const addressZero = '0x0000000000000000000000000000000000000000';
  useEffect(() => {
    if (liveTokenDetailsData) {
      setPairData(liveTokenDetailsData.pairData);
      setOpenFees(liveTokenDetailsData.openFees);
      setCloseFees(liveTokenDetailsData.closeFees);
      setReferral(liveTokenDetailsData.referral);
    }
  }, [liveTokenDetailsData]);

  const [openPrice, setOpenPrice] = useState(0);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    [oracleSocket].forEach((socket) => {
      socket.on('data', (data: any) => {
        if (positionRef.current) {
          setOpenPrice(
            data[positionRef.current.asset].price / 1e18 +
              (data[positionRef.current.asset].price / 1e18) *
                (data[positionRef.current.asset].spread / 1e10) *
                (positionRef.current.direction ? 1 : -1)
          );
        }
      });
    });
  }, []);

  useEffect(() => {
    if (isState) {
      setEditState({
        ...editState,
        stopLoss: position?.slPrice === '0' ? '' : parseFloat(position?.slPrice).toPrecision(7),
        profit: position?.tpPrice === '0' ? '' : parseFloat(position?.tpPrice).toPrecision(7),
        partialPro: '100',
        addNum: '',
        partial: partialArr[0],
        addMenu: partialArr[0],
        posDrop: partialArr[0],
        addToPositionMargin: ''
      });
    }
  }, [isState]);

  const handleEditState = (prop: string, value: string | number | boolean) => {
    setEditState({ ...editState, [prop]: value });
  };

  const handleEditSL = (value: any) => {
    setEditState({ ...editState, stopLoss: value });
  };

  const handleEditTP = (value: any) => {
    setEditState({ ...editState, profit: value });
  };

  const handleEditPartialPro = (value: any) => {
    setEditState({ ...editState, partialPro: value });
  };

  const handleEditAddNum = (value: any) => {
    setEditState({ ...editState, addNum: value });
  };

  const handleEditAddToPositionMargin = (value: any) => {
    setEditState({ ...editState, addToPositionMargin: value });
  };

  function handleUpdateSL() {
    updateSL();
  }
  async function updateSL() {
    if (tradingStatus === 'APPROVE PROXY' || tradingStatus === 'FUND PROXY' || tradingStatus === 'UNLOCK PROXY') {
      const message = tradingStatus.charAt(0) + tradingStatus.substring(1).toLowerCase() + '!';
      toast.warn(message);
      return;
    }
    const currentNetwork = getNetwork(chain?.id ?? 42161);
    const slInput = parseEther(editState.stopLoss === '' ? '0' : (editState.stopLoss as `${number}`));
    // const tradingContract = await getTradingContract();

    const _oracleData: any = oracleData[position.asset];
    if (_oracleData.is_closed) {
      toast.dismiss();
      toast.warning(t('Market is closed!'));
      return;
    }

    if (
      position.direction &&
      parseInt(slInput.toString()) > parseInt(_oracleData.price) &&
      parseInt(slInput.toString()) !== 0
    ) {
      toast.warn(t('Stop loss too high'));
      return;
    } else if (
      !position.direction &&
      parseInt(slInput.toString()) < parseInt(_oracleData.price) &&
      parseInt(slInput.toString()) !== 0
    ) {
      toast.warn(t('Stop loss too low'));
      return;
    }

    try {
      toast.loading(`${t('Updating stop loss')}...`);
      setState(false);
      if (userAddress === undefined) return;
      const tradingABI = currentNetwork.abis.trading;
      const chainId = chain?.id;
      const inputDataParams = [false, position.id, slInput, userAddress, NO_PRICE_DATA];
      const inputData = encodeFunctionData({
        abi: tradingABI,
        functionName: 'updateTpSl',
        args: inputDataParams
      });
      await forwarder(chainId, inputData, 'updateTpSl', undefined, position.asset);
    } catch (err: any) {
      toast.dismiss();
      toast.error(`${t('Updating stop loss failed!')} ${String(err.response.data.reason)}`);
      LogError(userAddress, err.response.data.reason, 0, 0, 'UPDATE_SL_MODAL');
      console.log(err);
    }
  }

  function handleUpdateTP() {
    updateTP();
  }
  async function updateTP() {
    if (tradingStatus === 'APPROVE PROXY' || tradingStatus === 'FUND PROXY' || tradingStatus === 'UNLOCK PROXY') {
      const message = tradingStatus.charAt(0) + tradingStatus.substring(1).toLowerCase() + '!';
      toast.warn(message);
      return;
    }
    const currentNetwork = getNetwork(chain?.id ?? 42161);
    const tpInput = parseEther(editState.profit === '' ? '0' : (editState.profit as `${number}`));

    const _oracleData: any = oracleData[position.asset];
    if (_oracleData.is_closed) {
      toast.dismiss();
      toast.warning(t('Market is closed!'));
      return;
    }

    if (
      position.direction &&
      parseInt(tpInput.toString()) < parseInt(_oracleData.price) &&
      parseInt(tpInput.toString()) !== 0
    ) {
      toast.warn(t('Take profit too low'));
      return;
    } else if (
      !position.direction &&
      parseInt(tpInput.toString()) > parseInt(_oracleData.price) &&
      parseInt(tpInput.toString()) !== 0
    ) {
      toast.warn(t('Take profit too high'));
      return;
    }

    try {
      toast.loading('Updating take profit...');
      setState(false);
      if (userAddress === undefined) return;
      const tradingABI = currentNetwork.abis.trading;
      const chainId = chain?.id;
      const inputDataParams = [true, position.id, tpInput, userAddress, NO_PRICE_DATA];
      const inputData = encodeFunctionData({
        abi: tradingABI,
        functionName: 'updateTpSl',
        args: inputDataParams
      });
      await forwarder(chainId, inputData, 'updateTpSl', undefined, position.asset);
    } catch (err: any) {
      toast.dismiss();
      toast.error('Updating take profit failed! ' + String(err.response.data.reason));
      LogError(userAddress, err.response.data.reason, 0, 0, 'UPDATE_TP_MODAL');
      console.log(err);
    }
  }

  function handlePartialClose() {
    partialClose();
  }
  async function partialClose() {
    if (tradingStatus === 'APPROVE PROXY' || tradingStatus === 'FUND PROXY' || tradingStatus === 'UNLOCK PROXY') {
      const message = tradingStatus.charAt(0) + tradingStatus.substring(1).toLowerCase() + '!';
      toast.warn(message);
      return;
    }
    const currentNetwork = getNetwork(chain?.id ?? 42161);

    const _oracleData: any = oracleData[position.asset];
    if (_oracleData.is_closed) {
      toast.dismiss();
      toast.warning('Market is closed!');
      return;
    }

    try {
      if (feeData === undefined || chain === undefined || walletClient === undefined || userAddress === undefined)
        return;
      toast.loading('Closing position...');
      setState(false);
      setExecutionPrice(_oracleData.price / 1e18);
      const tradingABI = currentNetwork.abis.trading;
      const chainId = chain?.id;
      const inputDataParams = [
        position.id,
        parseFloat(editState.partialPro) * 1e8,
        editState.partial.stablevault,
        editState.partial.address,
        userAddress,
        NO_PRICE_DATA
      ];
      const inputData = encodeFunctionData({
        abi: tradingABI,
        functionName: 'marketClose',
        args: inputDataParams
      });
      await forwarder(chainId, inputData, 'marketClose', undefined, position.asset);
      setExecutionPrice(0);
    } catch (err: any) {
      setExecutionPrice(0);
      toast.dismiss();
      toast.error('Closing position failed! ' + String(err.response.data.reason));
      LogError(userAddress, err.response.data.reason, 0, 0, 'CLOSE_POSITION_MODAL');
      console.log(err);
    }
  }

  function handleModifyMargin() {
    editState.addDrop === 'Add' ? addMargin() : removeMargin();
  }
  async function addMargin() {
    if (tradingStatus === 'APPROVE PROXY' || tradingStatus === 'FUND PROXY' || tradingStatus === 'UNLOCK PROXY') {
      const message = tradingStatus.charAt(0) + tradingStatus.substring(1).toLowerCase() + '!';
      toast.warn(message);
      return;
    }
    const currentNetwork = getNetwork(chain?.id ?? 42161);
    if (Number(editState.addNum) > Number(addMarginBalance)) {
      toast.dismiss();
      toast.warning('Balance too low!');
      return;
    }
    const addMarginInput = parseEther(editState.addNum === '' ? '0' : (editState.addNum as `${number}`));

    const _oracleData: any = oracleData[position.asset];
    if (_oracleData.is_closed) {
      toast.dismiss();
      toast.warning('Market is closed!');
      return;
    }

    try {
      if (userAddress === undefined) return;
      toast.loading('Adding margin...');
      setState(false);
      const tradingABI = currentNetwork.abis.trading;
      const chainId = chain?.id;
      const inputDataParams = [
        position.id,
        editState.addMenu.stablevault,
        editState.addMenu.address,
        addMarginInput,
        NO_PERMIT,
        userAddress,
        NO_PRICE_DATA
      ];
      const inputData = encodeFunctionData({
        abi: tradingABI,
        functionName: 'addMargin',
        args: inputDataParams
      });
      await forwarder(chainId, inputData, 'addMargin', undefined, position.asset);
    } catch (err: any) {
      toast.dismiss();
      toast.error('Adding margin failed! ' + String(err.response.data.reason));
      LogError(userAddress, err.response.data.reason, 0, 0, 'ADD_MARGIN');
      console.log(err);
    }
  }

  async function removeMargin() {
    if (tradingStatus === 'APPROVE PROXY' || tradingStatus === 'FUND PROXY' || tradingStatus === 'UNLOCK PROXY') {
      const message = tradingStatus.charAt(0) + tradingStatus.substring(1).toLowerCase() + '!';
      toast.warn(message);
      return;
    }
    const currentNetwork = getNetwork(chain?.id ?? 42161);
    const removeMarginInput = parseEther(editState.addNum === '' ? '0' : (editState.addNum as `${number}`));

    const _oracleData: any = oracleData[position.asset];
    if (_oracleData.is_closed) {
      toast.dismiss();
      toast.warning('Market is closed!');
      return;
    }

    try {
      if (userAddress === undefined) return;
      toast.loading('Removing margin...');
      setState(false);
      const tradingABI = currentNetwork.abis.trading;
      const chainId = chain?.id;
      const inputDataParams = [
        position.id,
        editState.addMenu.stablevault,
        editState.addMenu.address,
        removeMarginInput,
        userAddress,
        NO_PRICE_DATA
      ];
      const inputData = encodeFunctionData({
        abi: tradingABI,
        functionName: 'removeMargin',
        args: inputDataParams
      });
      await forwarder(chainId, inputData, 'removeMargin', undefined, position.asset);
    } catch (err: any) {
      toast.dismiss();
      toast.error('Removing margin failed! ' + String(err.response.data.reason));
      LogError(userAddress, err.response.data.reason, 0, 0, 'ADD_TO_POSITION');
      console.log(err);
    }
  }

  function handleAddToPosition() {
    addToPosition();
  }
  async function addToPosition() {
    if (tradingStatus === 'APPROVE PROXY' || tradingStatus === 'FUND PROXY' || tradingStatus === 'UNLOCK PROXY') {
      const message = tradingStatus.charAt(0) + tradingStatus.substring(1).toLowerCase() + '!';
      toast.warn(message);
      return;
    }
    const currentNetwork = getNetwork(chain?.id ?? 42161);
    if (Number(editState.addToPositionMargin) > Number(addToPositionBalance)) {
      toast.dismiss();
      toast.warning('Balance too low!');
      return;
    }
    const addMarginInput = parseEther(
      editState.addToPositionMargin === '' ? '0' : (editState.addToPositionMargin as `${number}`)
    );

    const _oracleData: any = oracleData[position.asset];
    if (_oracleData.is_closed) {
      toast.dismiss();
      toast.warning('Market is closed!');
      return;
    }

    const spreadPrices = {
      ask:
        (parseFloat(_oracleData.price) + (parseFloat(_oracleData.price) * parseFloat(_oracleData.spread)) / 1e10) /
        1e18,
      bid:
        (parseFloat(_oracleData.price) - (parseFloat(_oracleData.price) * parseFloat(_oracleData.spread)) / 1e10) / 1e18
    };

    try {
      if (feeData === undefined || chain === undefined || walletClient === undefined || userAddress === undefined)
        return;
      toast.loading('Adding to position...');
      setState(false);
      setExecutionPrice(position.direction ? spreadPrices.ask : spreadPrices.bid);
      const tradingABI = currentNetwork.abis.trading;
      const chainId = chain?.id;
      const inputDataParams = [
        position.id,
        editState.posDrop.stablevault,
        editState.posDrop.address,
        addMarginInput,
        NO_PERMIT,
        userAddress,
        NO_PRICE_DATA
      ];
      const inputData = encodeFunctionData({
        abi: tradingABI,
        functionName: 'addToPosition',
        args: inputDataParams
      });
      await forwarder(chainId, inputData, 'addToPosition', undefined, position.asset);
      setExecutionPrice(0);
    } catch (err: any) {
      setExecutionPrice(0);
      toast.dismiss();
      toast.error('Adding to position failed! ' + String(err.response.data.reason));
      LogError(userAddress, err.response.data.reason, 0, 0, 'ADD_TO_POSITION');
      console.log(err);
    }
  }

  return (
    <BootstrapDialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={isState}>
      <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
        {t('Edit Position')}
      </BootstrapDialogTitle>
      <EditDialogContent>
        <FeeLabelGroup>
          <FeeLabel>
            <TextLabel>{t('Funding fees paid')}</TextLabel>
            <FeeLabelValue>{(-parseFloat(position?.accInterest)).toFixed(2)}</FeeLabelValue>
          </FeeLabel>
        </FeeLabelGroup>
        <EditField>
          <TextLabel>{t('Stop loss')}</TextLabel>
          <StopLossAction>
            <TigrisInput width="100%" label="SL" placeholder="-" value={editState.stopLoss} setValue={handleEditSL} />
            {isConnected ? (
              <>
                <ApplyButton
                  disabled={
                    (editState.stopLoss === '' && position?.slPrice === '0') ||
                    (position?.direction
                      ? Number(editState.stopLoss) > Number(openPrice)
                      : Number(editState.stopLoss) < Number(openPrice))
                      ? true
                      : editState.stopLoss === parseFloat(position?.slPrice).toPrecision(7)
                  }
                  variant="contained"
                  onClick={() => handleUpdateSL()}
                >
                  Apply
                </ApplyButton>
              </>
            ) : (
              ''
            )}
          </StopLossAction>
        </EditField>
        <EditField>
          <TextLabel>{t('Take profit')}</TextLabel>
          <StopLossAction>
            <TigrisInput width="100%" label="TP" placeholder="-" value={editState.profit} setValue={handleEditTP} />
            {isConnected ? (
              <>
                <ApplyButton
                  disabled={
                    editState.profit === '' && position?.tpPrice === '0'
                      ? true
                      : editState.profit === parseFloat(position?.tpPrice).toPrecision(7)
                  }
                  variant="contained"
                  onClick={() => handleUpdateTP()}
                >
                  {t('Apply')}
                </ApplyButton>
              </>
            ) : (
              ''
            )}
          </StopLossAction>
        </EditField>
        <EditField>
          <FieldLabel>
            <TextLabel>{t('Partial closing')}</TextLabel>
          </FieldLabel>
          <FieldAction>
            <IconDropDownMenu
              arrayData={partialArr}
              name="partial"
              state={editState.partial}
              setState={handleEditState}
            />
            <TigrisInput width="100%" label="%" value={editState.partialPro} setValue={handleEditPartialPro} />
            {Number(editState.partialPro) > 100 ? (
              <ClosePositionButton disabled={true}>{t('Max')} 100%</ClosePositionButton>
            ) : editState.partialPro !== '100' &&
              (position.margin * position.leverage * (100 - Number(editState.partialPro))) / 100 < 500 ? (
              <ClosePositionButton disabled={true}>{t('Min position size')}</ClosePositionButton>
            ) : (
              <ClosePositionButton onClick={() => handlePartialClose()}>{t('Close Position')}</ClosePositionButton>
            )}
          </FieldAction>
        </EditField>
        <EditField>
          <FieldLabel>
            <TextLabel>{t('Add/remove margin')}</TextLabel>
          </FieldLabel>
          <FieldAction>
            <IconDropDownMenu
              arrayData={partialArr}
              name="addMenu"
              state={editState.addMenu}
              setState={handleEditState}
            />
            <CommonDropDown arrayData={marginArr} name="addDrop" state={editState.addDrop} setState={handleEditState} />
            <TigrisInputContainer>
              <TigrisInput
                width="100%"
                label="Margin"
                placeholder="-"
                value={editState.addNum}
                setValue={handleEditAddNum}
              />
            </TigrisInputContainer>
          </FieldAction>
        </EditField>
        <FieldLabel>
          <TextLabel>
            {t('orderForm.balance')}: {Number(addMarginBalance).toFixed(2)}
          </TextLabel>
        </FieldLabel>
        <FieldLabel>
          <TextLabel>{t('New margin')}</TextLabel>
          <SecondaryLabel>
            {isState
              ? editState.addNum !== ''
                ? (editState.addDrop === 'Add'
                    ? parseFloat(position.margin) + parseFloat(editState.addNum)
                    : parseFloat(position.margin) - parseFloat(editState.addNum)
                  ).toFixed(2)
                : parseFloat(position.margin).toFixed(2)
              : ''}
          </SecondaryLabel>
        </FieldLabel>
        <FieldLabel>
          <TextLabel>{t('New leverage')}</TextLabel>
          <SecondaryLabel>
            {isState
              ? editState.addNum !== ''
                ? editState.addDrop === 'Add'
                  ? (
                      (parseFloat(position.margin) * parseFloat(position.leverage)) /
                      (parseFloat(position.margin) + parseFloat(editState.addNum))
                    ).toFixed(2)
                  : (
                      (parseFloat(position.margin) * parseFloat(position.leverage)) /
                      (parseFloat(position.margin) - parseFloat(editState.addNum))
                    ).toFixed(2)
                : parseFloat(position.leverage).toFixed(2)
              : ''}
          </SecondaryLabel>
        </FieldLabel>
        <AddMarginButton variant="outlined" onClick={() => handleModifyMargin()}>
          {editState.addDrop + ' margin'}
        </AddMarginButton>
        <EditField>
          <FieldLabel>
            <TextLabel>{t('Add to position')}</TextLabel>
          </FieldLabel>
          <FieldAction>
            <IconDropDownMenu
              arrayData={partialArr}
              name="posDrop"
              state={editState.posDrop}
              setState={handleEditState}
            />
            <TigrisInput
              width="100%"
              label={t('Margin')}
              placeholder="-"
              value={editState.addToPositionMargin}
              setValue={handleEditAddToPositionMargin}
            />
            <OpenButton variant="outlined" onClick={handleAddToPosition}>
              {t('Open')}
            </OpenButton>
          </FieldAction>
        </EditField>
        <FieldLabel>
          <TextLabel>
            {'orderForm.balance'}: {Number(addToPositionBalance).toFixed(2)}
          </TextLabel>
        </FieldLabel>
        <FieldLabel>
          <TextLabel>{t('New margin')}</TextLabel>
          <SecondaryLabel>
            {(
              parseFloat(position?.margin) +
              (parseFloat(editState.addToPositionMargin === '' ? '0' : editState.addToPositionMargin) -
                parseFloat(editState.addToPositionMargin === '' ? '0' : editState.addToPositionMargin) *
                  parseFloat(position?.leverage) *
                  (openFees
                    ? ((Number(openFees[0]) +
                        Number(openFees[1]) -
                        (referral !== addressZero ? Number(openFees[2]) / 1e10 : 0)) *
                        (Number(pairData?.feeMultiplier) / 1e10)) /
                      1e10
                    : 0))
            ).toFixed(2)}
          </SecondaryLabel>
        </FieldLabel>
        <FieldLabel>
          <TextLabel>{t('New position size')}</TextLabel>
          <SecondaryLabel>
            {(
              (parseFloat(position?.margin) +
                (parseFloat(editState.addToPositionMargin === '' ? '0' : editState.addToPositionMargin) -
                  parseFloat(editState.addToPositionMargin === '' ? '0' : editState.addToPositionMargin) *
                    parseFloat(position?.leverage) *
                    (openFees
                      ? ((Number(openFees[0]) +
                          Number(openFees[1]) -
                          (referral !== addressZero ? Number(openFees[2]) / 1e10 : 0)) *
                          (Number(pairData?.feeMultiplier) / 1e10)) /
                        1e10
                      : 0))) *
              parseFloat(position?.leverage)
            ).toFixed(2)}
          </SecondaryLabel>
        </FieldLabel>
        <FieldLabel>
          <TextLabel>{t('New open price')}</TextLabel>
          <SecondaryLabel>
            {(
              (parseFloat(position?.price) *
                openPrice *
                (parseFloat(position?.margin) +
                  (parseFloat(editState.addToPositionMargin === '' ? '0' : editState.addToPositionMargin) -
                    parseFloat(editState.addToPositionMargin === '' ? '0' : editState.addToPositionMargin) *
                      parseFloat(position?.leverage) *
                      (openFees
                        ? ((Number(openFees[0]) +
                            Number(openFees[1]) -
                            (referral !== addressZero ? Number(openFees[2]) / 1e10 : 0)) *
                            (Number(pairData?.feeMultiplier) / 1e10)) /
                          1e10
                        : 0)))) /
              (parseFloat(position?.margin) * openPrice +
                (parseFloat(editState.addToPositionMargin === '' ? '0' : editState.addToPositionMargin) -
                  parseFloat(editState.addToPositionMargin === '' ? '0' : editState.addToPositionMargin) *
                    parseFloat(position?.leverage) *
                    (openFees
                      ? ((Number(openFees[0]) +
                          Number(openFees[1]) -
                          (referral !== addressZero ? Number(openFees[2]) / 1e10 : 0)) *
                          (Number(pairData?.feeMultiplier) / 1e10)) /
                        1e10
                      : 0)) *
                  parseFloat(position?.price))
            ).toPrecision(6)}
          </SecondaryLabel>
        </FieldLabel>
      </EditDialogContent>
    </BootstrapDialog>
  );
};

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: '0 24px',
    width: '100%',
    paddingBottom: '24px'
  },
  '& .MuiDialogActions-root': {
    padding: '24px'
  },
  '& .MuiPaper-root': {
    backgroundImage: 'none',
    backgroundColor: '#161221'
  }
}));

const EditDialogContent = styled(DialogContent)(({ theme }) => ({
  width: '500px',
  display: 'flex',
  gap: '24px',
  flexDirection: 'column'
}));

const FeeLabelGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '14px',
  lineHeight: '12px',
  fontWeight: '400'
}));

const FeeLabel = styled(Box)(({ theme }) => ({
  minWidth: '160px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  [theme.breakpoints.down(400)]: {
    minWidth: '60px'
  }
}));

const TextLabel = styled(Box)(({ theme }) => ({
  fontSize: '12px',
  lineHeight: '12px',
  color: '#B1B5C3'
}));

const FeeLabelValue = styled(Box)(({ theme }) => ({
  fontSize: '14px',
  lineHeight: '16px',
  fontWeight: '400',
  color: '#B1B5C3'
}));

const EditField = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '8px'
}));

const StopLossAction = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  gap: '5px',
  alignItems: 'center'
}));

const FieldAction = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  width: '100%',
  gap: '5px',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)'
  }
}));

const ApplyButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#3772FF',
  borderRadius: '2px',
  color: '#FFF',
  height: '36px',
  width: '150px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#3772FF'
  }
}));

const FieldLabel = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between'
}));

const SecondaryLabel = styled(Box)(({ theme }) => ({
  fontSize: '12px',
  lineHeight: '12px',
  color: '#B1B5C3'
}));

const ClosePositionButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'none',
  width: '100%',
  fontSize: '12px',
  borderRadius: '2px',
  border: '1px solid #3772FF',
  textTransform: 'none',
  [theme.breakpoints.down('sm')]: {
    gridColumn: '1 / 3',
    marginTop: '18px'
  }
}));

const AddMarginButton = styled(Button)(({ theme }) => ({
  width: '100%',
  textTransform: 'none',
  border: '1px solid #3772FF',
  '&:hover': {
    border: '1px solid #3772FF'
  }
}));

const OpenButton = styled(Button)(({ theme }) => ({
  width: '100%',
  textTransform: 'none',
  border: '1px solid #3772FF',
  '&:hover': {
    border: '1px solid #3772FF'
  },
  [theme.breakpoints.down('sm')]: {
    gridColumn: '1 / 3',
    marginTop: '18px'
  }
}));

const TigrisInputContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    gridColumn: '1 / 3',
    marginTop: '10px'
  }
}));
