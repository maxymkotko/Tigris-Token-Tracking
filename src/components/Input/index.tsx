import { Box, Slider } from '@mui/material';
import { styled } from '@mui/system';
import { useState, useEffect, useRef } from 'react';

interface containerProps {
  visited: number;
}

export const TigrisSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#6513E2' : '#6513E2',
  height: 2,
  padding: '15px 0',
  '& .MuiSlider-thumb': {
    height: 16,
    width: 16,
    backgroundColor: '#fff'
  },
  '& .MuiSlider-valueLabel': {
    fontSize: 14,
    fontWeight: 'normal',
    top: -6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: theme.palette.text.primary,
    '&:before': {
      display: 'none'
    },
    '& *': {
      background: 'transparent',
      color: theme.palette.mode === 'dark' ? '#fff' : '#000'
    }
  },
  '& .MuiSlider-markLabel': {
    fontSize: '11px'
  },
  '& .MuiSlider-track': {
    border: 'none',
    backgroundImage: 'linear-gradient(.25turn, #910ABC, #0249DD)'
  },
  '& .MuiSlider-rail': {
    opacity: 1,
    backgroundColor: '#353945'
  },
  '& .MuiSlider-mark': {
    backgroundColor: '#bfbfbf',
    height: 8,
    width: 1,
    '&.MuiSlider-markActive': {
      opacity: 1,
      backgroundColor: '#bfbfbf'
    }
  }
}));

interface InputProps {
  label: string;
  value: string;
  placeholder?: string;
  defaultValue?: string;
  setValue: (value: any) => void;
  component?: React.ReactNode;
  width?: string;
  onClick?: () => void;
}

export const TigrisInput = (props: InputProps) => {
  const { label, value, setValue, placeholder, defaultValue, component, width: widthLength, onClick } = props;
  const inputRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);
  const [isVisit, setVisit] = useState(false);
  const handleClickOutside = (event: React.MouseEvent<HTMLElement>) => {
    if (inputRef.current && !inputRef.current.contains(event.target as any)) {
      setVisit(false);
    }
  };

  const handleClickInside = () => {
    setVisit(true);
    valueRef.current?.focus();
  };

  useEffect(() => {
    document.addEventListener('mousedown', (event) => handleClickOutside(event as any));
  }, [inputRef]);
  return (
    <InputContainer
      style={{ width: widthLength }}
      ref={inputRef}
      visited={isVisit ? 1 : 0}
      onMouseUp={() => handleClickInside()}
      onClick={onClick}
    >
      <InputLabel>{label}</InputLabel>
      <InputArea>
        <InputValue
          visited={isVisit ? 1 : 0}
          value={value}
          type="text"
          ref={valueRef}
          placeholder={placeholder !== undefined ? placeholder : ''}
          defaultValue={defaultValue}
          onChange={(e: React.FormEvent<HTMLInputElement>) =>
            setValue(
              e.currentTarget.value
                .replace(/[^0-9.]/g, '')
                .replace(/(\..*?)\..*/g, '$1')
                .replace(/^0[^.]/, '0')
            )
          }
        />
        {component}
      </InputArea>
    </InputContainer>
  );
};

interface TimeInputProps {
  label: string;
  duration: number;
  setDuration: (value: any) => void;
  width?: string;
  onClick?: () => void;
}

export const TigrisTimeInput = (props: TimeInputProps) => {
  const { label, duration, setDuration, width: widthLength, onClick } = props;
  const inputRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);
  const [isVisit, setVisit] = useState(false);
  const [isMinuteVisit, setMinuteVisit] = useState(false);
  const [isSecondVisit, setSecondVisit] = useState(false);
  // const [minutesValue, setMinutesValue] = useState('0');
  // const [secondsValue, setSecondsValue] = useState('0');
  const minutesValue = Math.floor(duration / 60).toString();
  const secondsValue = (duration % 60).toString();
  const handleClickOutside = (event: React.MouseEvent<HTMLElement>) => {
    if (inputRef.current && !inputRef.current.contains(event.target as any)) {
      setVisit(false);
      setMinuteVisit(false);
      setSecondVisit(false);
    }
  };

  // useEffect(() => {
  //   const minute = Number(minutesValue); // 3
  //   const second = Number(secondsValue); // 5
  //   setDuration(60 * minute + second);
  // }, [minutesValue, secondsValue]);

  const handleTimeChange = (_minutes: string, _seconds: string) => {
    const minute = Number(_minutes);
    const second = Number(_seconds);
    setDuration(60 * minute + second);
  };

  const handleClickInside = () => {
    setVisit(true);
  };

  const handleMinuteClickInside = () => {
    setMinuteVisit(true);
    setSecondVisit(false);
  };

  const handleSecondClickInside = () => {
    setSecondVisit(true);
    setMinuteVisit(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', (event) => handleClickOutside(event as any));
  }, [inputRef]);
  return (
    <InputContainer
      style={{ width: widthLength }}
      ref={inputRef}
      visited={isVisit ? 1 : 0}
      onMouseUp={() => handleClickInside()}
      onClick={onClick}
    >
      <InputLabel>{label}</InputLabel>
      <TimeInputArea>
        <TimeInputValue
          visited={isMinuteVisit ? 1 : 0}
          value={minutesValue === '0' ? '' : minutesValue}
          type="text"
          ref={valueRef}
          placeholder={'mm'}
          onMouseUp={handleMinuteClickInside}
          onChange={(e: React.FormEvent<HTMLInputElement>) =>
            handleTimeChange(
              e.currentTarget.value
                .replace(/[^0-9.]/g, '')
                .replace(/(\..*?)\..*/g, '$1')
                .replace(/^0[^.]/, '0'),
              secondsValue
            )
          }
        />
        <InputLabel>:</InputLabel>
        <TimeInputValue
          visited={isSecondVisit ? 1 : 0}
          value={secondsValue === '0' ? '' : secondsValue}
          type="text"
          ref={valueRef}
          placeholder={'0'}
          onMouseUp={handleSecondClickInside}
          onChange={(e: React.FormEvent<HTMLInputElement>) =>
            handleTimeChange(
              minutesValue,
              e.currentTarget.value
                .replace(/[^0-9.]/g, '')
                .replace(/(\..*?)\..*/g, '$1')
                .replace(/^0[^.]/, '0')
            )
          }
        />
      </TimeInputArea>
    </InputContainer>
  );
};

interface VaultInputProps {
  value: any;
  setValue: any;
  type: string;
  name: string;
  placeholder: string;
  component: React.ReactNode;
}

export const VaultInput = (props: VaultInputProps) => {
  const { value, setValue, type, name, placeholder, component } = props;
  const [isVisit, setVisit] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);
  const handleClickOutside = (event: React.MouseEvent<HTMLElement>) => {
    if (inputRef.current && !inputRef.current.contains(event.target as any)) {
      setVisit(false);
    }
  };

  const handleClickInside = () => {
    setVisit(true);
    valueRef.current?.focus();
  };

  useEffect(() => {
    document.addEventListener('mousedown', (event) => handleClickOutside(event as any));
  }, [inputRef]);
  return (
    <InputFieldContainer ref={inputRef} visited={isVisit ? 1 : 0} onMouseUp={() => handleClickInside()}>
      <InputFieldArea>
        <InputFieldValue
          value={value}
          type={type}
          name={name}
          ref={valueRef}
          placeholder={placeholder}
          onChange={(e: React.FormEvent<HTMLInputElement>) => setValue(name, e.currentTarget.value)}
        />
        {component}
      </InputFieldArea>
    </InputFieldContainer>
  );
};

const InputContainer = styled(Box)<containerProps>(({ visited, theme }) => ({
  width: '100%',
  height: '36px',
  backgroundColor: '#222630',
  padding: '4px 16px',
  borderRadius: '0px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: visited === 1 ? '1px solid #3772FF' : '1px solid #222630',
  [theme.breakpoints.down('xs')]: {
    padding: '8px'
  }
}));

const InputLabel = styled(Box)(({ theme }) => ({
  fontSize: '12px',
  color: '#B1B5C3',
  fontWeight: 400
}));

const InputArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100%',
  gap: '2px',
  fontSize: '12px',
  color: '#B1B5C3'
}));

const TimeInputArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  color: '#B1B5C3'
}));

const InputValue = styled('input')<containerProps>(({ visited, theme }) => ({
  outline: 'none',
  height: '100%',
  width: '77px',
  maxWidth: '100%',
  background: 'none',
  textAlign: 'right',
  border: 'none',
  color: visited === 1 ? '#FFFFFF' : '#B1B5C3',
  letterSpacing: '0.05em',

  [theme.breakpoints.down(390)]: {
    width: '50px'
  },
  [theme.breakpoints.down(350)]: {
    width: '40px'
  }
}));

const TimeInputValue = styled('input')<containerProps>(({ visited, theme }) => ({
  outline: 'none',
  height: '100%',
  width: '45px',
  background: '#161221',
  textAlign: 'center',
  // border: visited === 1 ? '1px solid #3772FF' : '1px solid #222630',
  border: 'none',
  color: visited === 1 ? '#FFFFFF' : '#B1B5C3',
  letterSpacing: '0.05em',

  [theme.breakpoints.down(390)]: {
    width: '50px'
  },
  [theme.breakpoints.down(350)]: {
    width: '40px'
  }
}));

// InputField

const InputFieldContainer = styled(Box)<containerProps>(({ visited, theme }) => ({
  width: '100%',
  height: '36px',
  backgroundColor: '#222630',
  padding: '4px 9px',
  borderRadius: '2px',
  border: visited === 1 ? '1px solid #3772FF' : '1px solid #222630',
  [theme.breakpoints.down('xs')]: {
    padding: '8px'
  }
}));

const InputFieldArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100%',
  gap: '2px',
  fontSize: '12px',
  color: '#B1B5C3'
}));

const InputFieldValue = styled('input')(({ theme }) => ({
  outline: 'none',
  height: '100%',
  width: '100%',
  background: 'none',
  border: 'none',
  color: '#FFFFFF',
  letterSpacing: '0.05em'

  // [theme.breakpoints.down(390)]: {
  //   width: '50px'
  // },
  // [theme.breakpoints.down(350)]: {
  //   width: '40px'
  // }
}));

interface OrderInputProps {
  label: string;
  value: number | string;
  setValue: (value: number | string) => void;
  currency: string;
  onClick?: () => void;
}

export const OrderInput = (props: OrderInputProps) => {
  const { label, value, setValue, currency, onClick } = props;
  return (
    <OrderInputContainer onClick={onClick}>
      <OrderInputWrapper>
        <OrderInputLabel>{label}</OrderInputLabel>
        <OrderInputBody>
          <OrderInputSuffix>≈</OrderInputSuffix>
          <OrderInputBox value={value} onChange={(e) => setValue(e.currentTarget.value)} />
        </OrderInputBody>
      </OrderInputWrapper>
      <OrderInputCurrency>{currency}</OrderInputCurrency>
    </OrderInputContainer>
  );
};

const OrderInputContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: '8px 10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '4px',
  background: '#1C1929'
}));

const OrderInputWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '1px'
}));

const OrderInputLabel = styled(Box)(({ theme }) => ({
  color: '#9497A9',
  fontSize: '12px',
  fontWeight: '400',
  textTransform: 'capitalize'
}));

const OrderInputBody = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  color: '#82808A'
}));

const OrderInputSuffix = styled(Box)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: '500'
}));

const OrderInputBox = styled('input')(({ theme }) => ({
  border: 'none',
  outline: 'none',
  background: 'none',
  minWidth: '100px',
  color: '#82808A',
  fontWeight: '500'
}));

const OrderInputCurrency = styled(Box)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: '500',
  color: '#82808A'
}));

interface OrderDurationInputProps {
  label: string;
  value: number;
  setValue: (value: number) => void;
}

export const OrderDurationInput = (props: OrderDurationInputProps) => {
  const { label, value, setValue } = props;
  return (
    <OrderDurationInputContainer>
      <OrderDurationInputArea value={value} onChange={(e) => setValue(Number(e.currentTarget.value))} />
      <OrderDurationLabel>{label}</OrderDurationLabel>
    </OrderDurationInputContainer>
  );
};

const OrderDurationInputContainer = styled(Box)(({ theme }) => ({
  padding: '7px 11px',
  borderRadius: '4px',
  background: '#1F1F2A',
  fontSize: '14px',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%'
}));

const OrderDurationInputArea = styled('input')(({ theme }) => ({
  border: 'none',
  outline: 'none',
  background: 'none',
  width: '100%',
  color: '#EEEFF3'
}));

const OrderDurationLabel = styled(Box)(({ theme }) => ({
  color: '#9497A9',
  fontSize: '12px',
  fontWeight: '400',
  lineHeight: '16px'
}));
