import { useState, useEffect, useRef } from 'react';
import { FaRegTimesCircle } from 'react-icons/fa';
import { HiChatBubbleLeftRight } from 'react-icons/hi2';
import { MdSend } from 'react-icons/md';
import moment from 'moment';
import { useSpring, animated } from '@react-spring/web';
import './chatbubble.css';
import { chatSocket } from 'src/context/socket';
import { TraderProfile } from 'src/context/profile';

interface IMessage {
  profilePicture: any;
  username: string;
  prevUsername?: string;
  date: string;
  time: string;
  message: string;
}
const Message = ({ profilePicture, username, prevUsername, date, time, message }: IMessage) => {
  return (
    <div style={{ display: 'flex', marginBottom: 5, marginTop: 5 }}>
      {prevUsername !== username ? (
        <div style={{ width: 35, height: 35, borderRadius: 999, background: '#2E3137' }}>
          <img src={profilePicture} alt="Profile" style={{ width: 35, height: 35, borderRadius: 999 }} />
        </div>
      ) : (
        <div style={{ minWidth: 35, height: 1, borderRadius: 999 }}></div>
      )}
      <div style={{ marginLeft: 10 }}>
        {prevUsername !== username && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontWeight: '500', fontSize: '13px' }}>
              {username}
              <span style={{ marginLeft: 10, color: '#8e9297', fontSize: '13px' }}>
                {moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm').format('MMM DD, HH:mm')}
              </span>
            </h4>
          </div>
        )}
        <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '18px', color: '#DCDDDE' }}>
          {message}
        </p>
      </div>
    </div>
  );
};

export const Chatbox = () => {
  // ================================================================================================================
  // MESSAGES
  // ================================================================================================================
  const messageTracker = useRef(0);
  const messagesFinished = useRef(false);
  const latest = useRef(0);

  useEffect(() => {
    const x = async () => {
      if (messageTracker.current > 0) return;
      const result = await fetch('https://chat.tigristrade.info/latest');
      const res = await result.json();
      messageTracker.current = parseInt(res.id);
      latest.current = parseInt(res.id);
      fetchMessages();
    };
    x();
  }, []);

  const [fetchTimeout, setFetchTimeout] = useState(0);

  const [message, setMessage] = useState('');
  const [isNotifiable, setIsNotifiable] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  async function fetchMessages() {
    if (fetchTimeout > Date.now()) return;
    setFetchTimeout(Date.now() + 200);
    const toFetch =
      'https://chat.tigristrade.info/messages?start=' +
      (messageTracker.current - 19).toString() +
      '&end=' +
      (messageTracker.current + 1).toString();
    messageTracker.current -= 20;
    const response = await fetch(toFetch);
    const newMessages = await response.json();
    if (newMessages.length === 0) messagesFinished.current = true;
    if (messagesListRef.current) {
      // Get the total height of the messages list
      totalHeightBefore.current = messagesListRef.current.scrollHeight;
    }
    setMessages((prevMessages) => [...newMessages.slice().reverse(), ...prevMessages]);
  }
  const totalHeightBefore = useRef(0);
  const [isHistoryFetched, setIsHistoryFetched] = useState(false);
  useEffect(() => {
    if (messagesListRef.current && isHistoryFetched) {
      // Get the total height of the messages list
      const totalHeightAfter = messagesListRef.current.scrollHeight;
      messagesListRef.current.scrollTop = totalHeightAfter - totalHeightBefore.current;
      if (messageTracker.current === latest.current) {
        scrollToBottom();
      }
    }
    return () => {
      setIsHistoryFetched(false);
    };
  }, [isHistoryFetched]);

  // Listen for new messages
  useEffect(() => {
    chatSocket.off('message');
    chatSocket.on('message', (data: any) => {
      setMessages([
        ...messages,
        {
          profilePicture: data.profilePicture,
          username: data.username,
          date: data.date,
          time: data.time,
          message: data.message
        }
      ]);
      setIsNotifiable(true);
    });
  }, [messages]);

  const messagesListRef = useRef<any>(null);
  const scrollToBottomIfNeeded = () => {
    if (messagesListRef.current) {
      // Get the last child element of the messages list
      const lastMessage = messagesListRef.current.lastChild;

      // Get the total height of the messages list
      const totalHeight = messagesListRef.current.scrollHeight;

      // Get the current scroll position of the messages list
      const scrollPosition = messagesListRef.current.scrollTop;

      // Calculate the height of the visible portion of the messages list
      const visibleHeight = messagesListRef.current.offsetHeight;

      // Check if the scroll position is at the bottom of the list
      if ((scrollPosition as number) + (visibleHeight as number) + 300 >= totalHeight) {
        lastMessage.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' });
      }
    }
  };

  const handleSend = () => {
    // Send message logic goes here
    if (message !== '') {
      const profile = TraderProfile();
      chatSocket.emit('receive', {
        username: profile.username,
        profilePicture: profile.profilePicture,
        date: new Date().toISOString().slice(0, 10),
        time: new Date().getHours().toString() + ':' + new Date().getMinutes().toString(),
        message: message
      });
      setMessage('');
      userSent.current = true;
      setMessages([
        ...messages,
        {
          username: profile.username,
          profilePicture: profile.profilePicture,
          date: new Date().toISOString().slice(0, 10),
          time: new Date().getHours().toString() + ':' + new Date().getMinutes().toString(),
          message: message
        }
      ]);
    }
  };

  const handleChange = (event: any) => {
    setMessage(event.target.value);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  const userSent = useRef(false);

  useEffect(() => {
    if (userSent.current) {
      userSent.current = false;
      scrollToBottom();
    } else {
      scrollToBottomIfNeeded();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEnd.current.scrollTop = 2;
    messagesEnd.current.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' });
  };

  const handleScroll = () => {
    if (
      messagesListRef.current.scrollHeight - messagesListRef.current.scrollTop - messagesListRef.current.clientHeight <=
      2
    ) {
      messagesListRef.current.scrollTop -= 0.5;
    }
    if (messagesListRef.current.scrollTop <= 2) {
      // eslint-disable-next-line
      messagesListRef.current.scrollTop += 0.5;
    }
    if (fetchTimeout > Date.now()) return;
    if (!messagesFinished.current) {
      // Check if the user has scrolled near the top of the messages list
      if (messagesListRef.current.scrollTop <= 150) {
        // Query more messages from the server
        fetchMessages().then(() => {
          setIsHistoryFetched(true);
        });
      }
    }
  };

  // ================================================================================================================
  // CHATBOX
  // ================================================================================================================
  const [isDragging, setIsDragging] = useState(false);
  const [initialPosition, setInitialPosition] = useState({ x: 10, y: 200 });
  const [currentPosition, setCurrentPosition] = useState({ x: 10, y: 200 });
  const messagesEnd = useRef<any>();

  const [isClosed, setClosed] = useState(true);

  const getClientPos = (event: any) => {
    if (event.touches) {
      return {
        clientX: event.touches[0].clientX,
        clientY: event.touches[0].clientY
      };
    }
    return {
      clientX: event.clientX,
      clientY: event.clientY
    };
  };

  useEffect(() => {
    const handleMouseMove = (event: any) => {
      if (isDragging) {
        event.preventDefault();
        const { clientX, clientY } = getClientPos(event);
        setCurrentPosition({
          x: clientX - initialPosition.x,
          y: clientY - initialPosition.y
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleMouseMove);
    };
  }, [isDragging, initialPosition]);

  const handleMouseDown = (event: any) => {
    const { clientX, clientY } = getClientPos(event);
    setInitialPosition({
      x: clientX - currentPosition.x,
      y: clientY - currentPosition.y
    });
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const [springs, api] = useSpring(() => ({
    from: {
      x: 0,
      y: 0
    },
    to: {
      x: window.innerWidth,
      y: window.innerHeight
    }
  }));

  useEffect(() => {
    if (isClosed) {
      api.start({
        from: {
          x: currentPosition.x,
          y: 0
        },
        to: {
          x: 5,
          y: 0
        }
      });
    }
    if (!isClosed) {
      messagesListRef.current.scrollTop = 3;
      scrollToBottom();
    }
  }, [isClosed]);

  // ================================================================================================================
  // BUBBLE
  // ================================================================================================================
  const [isBubbleDragging, setIsBubbleDragging] = useState(false);
  const [initialBubblePosition, setInitialBubblePosition] = useState({ x: 5, y: window.innerHeight - 85 });
  const [currentBubblePosition, setCurrentBubblePosition] = useState({ x: 5, y: window.innerHeight - 85 });
  const [beforeBubblePosition, setBeforeBubblePosition] = useState({ x: 5, y: window.innerHeight - 85 });

  useEffect(() => {
    const handleBubbleMouseMove = (event: any) => {
      if (isBubbleDragging) {
        event.preventDefault();
        const { clientX, clientY } = getClientPos(event);
        setCurrentBubblePosition({
          x: clientX - initialBubblePosition.x,
          y: clientY - initialBubblePosition.y
        });
      }
    };

    document.addEventListener('mousemove', handleBubbleMouseMove);
    document.addEventListener('touchmove', handleBubbleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleBubbleMouseMove);
      document.removeEventListener('touchmove', handleBubbleMouseMove);
    };
  }, [isBubbleDragging, initialBubblePosition]);

  const handleBubbleMouseDown = (event: any) => {
    const { clientX, clientY } = getClientPos(event);
    setInitialBubblePosition({
      x: clientX - currentBubblePosition.x,
      y: clientY - currentBubblePosition.y
    });
    setBeforeBubblePosition({
      x: currentBubblePosition.x,
      y: currentBubblePosition.y
    });
    setIsBubbleDragging(true);
  };

  const handleBubbleMouseUp = () => {
    setIsBubbleDragging(false);
    if (currentBubblePosition.x === beforeBubblePosition.x && currentBubblePosition.y === beforeBubblePosition.y) {
      setClosed(false);
      setIsNotifiable(false);
    }
    const storeX = currentBubblePosition.x;
    setCurrentBubblePosition({
      x: 10,
      y: currentBubblePosition.y
    });
    api.start({
      from: {
        x: storeX,
        y: 0
      },
      to: {
        x: 5,
        y: 0
      }
    });
  };

  return (
    <div
      style={{
        zIndex: 1,
        position: 'fixed'
      }}
    >
      {isClosed ? (
        <animated.div
          style={{
            touchAction: 'none',
            position: 'fixed',
            cursor: 'pointer',
            left: currentBubblePosition.x,
            top: currentBubblePosition.y,
            ...springs
          }}
          onMouseDown={handleBubbleMouseDown}
          onMouseUp={handleBubbleMouseUp}
          onTouchStart={handleBubbleMouseDown}
          onTouchEnd={handleBubbleMouseUp}
        >
          <div style={{ position: 'relative' }}>
            <HiChatBubbleLeftRight
              size={20}
              style={{
                position: 'absolute',
                top: 16,
                left: 15,
                zIndex: 1,
                color: '#FFFFFF',
                pointerEvents: 'none'
              }}
            />
            <div className="spinner" />
            {isNotifiable && <div className="notifier" />}
          </div>
        </animated.div>
      ) : (
        <div
          style={{
            touchAction: 'none',
            position: 'fixed',
            left: currentPosition.x,
            top: currentPosition.y,
            width: 300,
            minWidth: 250,
            height: 400,
            minHeight: 300,
            backgroundColor: '#36393f',
            borderRadius: 0,
            boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.75)',
            zIndex: 1000,
            resize: 'both',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto'
          }}
        >
          {/* Top bar of the chatbox */}
          <div
            style={{
              width: '100%',
              height: 40,
              backgroundColor: '#2f3136',
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0px 10px',
              cursor: isDragging ? 'grabbing' : 'grab',
              flexShrink: 0
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
          >
            <div style={{ margin: 0, fontWeight: '400', fontSize: 14, color: '#72767d' }}>Open Chat</div>
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#72767d'
              }}
              onClick={() => {
                setCurrentBubblePosition({
                  x: 5,
                  y: currentPosition.y
                });
                setClosed(true);
              }}
            >
              <FaRegTimesCircle size={20} style={{ marginBottom: '-3px' }} />
            </button>
          </div>
          {/* List of messages */}
          <div
            className="logs"
            style={{
              width: '100%',
              paddingLeft: 10,
              color: 'white',
              flexGrow: 1,
              overflowY: 'hidden'
            }}
          >
            <div style={{ overflowY: 'scroll', height: '100%' }} ref={messagesListRef} onScroll={() => handleScroll()}>
              {messages.map((message, index) => (
                <Message
                  key={index}
                  profilePicture={message.profilePicture}
                  username={message.username}
                  prevUsername={index > 0 && messages[index - 1].username}
                  date={message.date}
                  time={message.time}
                  message={message.message}
                />
              ))}
              <div style={{ paddingBottom: '5px' }} />
              <div
                ref={(el) => {
                  messagesEnd.current = el;
                }}
                style={{ float: 'left', clear: 'both' }}
              />
            </div>
          </div>
          {/* Bottom bar for sending message */}
          <div
            style={{
              width: '100%',
              height: 40,
              backgroundColor: '#2f3136',
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              padding: '0px 10px',
              flexShrink: 0
            }}
          >
            <input
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'white'
              }}
              placeholder="Send a message..."
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#43b581',
                marginBottom: -5
              }}
              onClick={handleSend}
            >
              <MdSend size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
