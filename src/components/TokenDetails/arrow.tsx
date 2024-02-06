import React from 'react';

import { VisibilityContext } from 'react-horizontal-scrolling-menu';
import { NavigateNext, NavigateBefore } from '@mui/icons-material';

function ArrowRight({
  children,
  disabled,
  onClick
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: VoidFunction;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        position: 'absolute',
        flexDirection: 'column',
        justifyContent: 'center',
        opacity: disabled ? '0' : '0.6',
        userSelect: 'none',
        background: 'none',
        border: 'none',
        color: '#FFFFFF',
        minWidth: '30px',
        minHeight: '30px',
        alignItems: 'center',
        zIndex: '1000',
        right: '1%'
      }}
    >
      {children}
    </button>
  );
}

function ArrowLeft({
  children,
  disabled,
  onClick
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: VoidFunction;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        position: 'absolute',
        flexDirection: 'column',
        justifyContent: 'center',
        opacity: disabled ? '0' : '0.8',
        userSelect: 'none',
        background: 'none',
        border: 'none',
        color: '#FFFFFF',
        minWidth: '30px',
        minHeight: '30px',
        alignItems: 'center',
        zIndex: '1000'
      }}
    >
      {children}
    </button>
  );
}

export function LeftArrow() {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { isFirstItemVisible, scrollPrev, visibleElements, initComplete } = React.useContext(VisibilityContext);

  const [isDisabled, setDisabled] = React.useState(!initComplete || (initComplete && isFirstItemVisible));
  React.useEffect(() => {
    // NOTE: detect if whole component visible
    if (visibleElements.length > 0) {
      setDisabled(isFirstItemVisible);
    }
  }, [isFirstItemVisible, visibleElements]);

  return (
    <ArrowLeft disabled={isDisabled} onClick={() => scrollPrev()}>
      <NavigateBefore />
    </ArrowLeft>
  );
}

export function RightArrow() {
  const { isLastItemVisible, scrollNext, visibleElements } = React.useContext(VisibilityContext);

  const [isDisabled, setDisabled] = React.useState(visibleElements.length === 0 && isLastItemVisible);
  React.useEffect(() => {
    if (visibleElements.length > 0) {
      setDisabled(isLastItemVisible);
    }
  }, [isLastItemVisible, visibleElements]);

  return (
    <ArrowRight disabled={isDisabled} onClick={() => scrollNext()}>
      <NavigateNext />
    </ArrowRight>
  );
}
