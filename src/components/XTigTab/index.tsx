import {useEffect, useState} from "react";
import {useXTIGData} from "../../hook/xtig/useXTIG";
import {styled} from "@mui/system";
import {Button} from "@mui/material";
import { xTIGLogo } from 'src/config/images';
import {formatEther} from "viem";

export const XTigTab = () => {
    const [upcomingXTig, setUpcomingXTig] = useState("0");
    const liveXTigData = useXTIGData(Math.floor(Date.now()/604800000));
    useEffect(() => {
        if (liveXTigData !== undefined) {
            setUpcomingXTig(Number(formatEther(liveXTigData.upcomingXTig as bigint)).toFixed(2));
        }
    }, [liveXTigData]);

    return (
        <TabButton>
            <img
                src={xTIGLogo}
                alt="xTIG"
                style={{
                    border: '1px solid #000000',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    marginRight: '5px'
                }}
            />
            <TabText>{upcomingXTig}</TabText>
        </TabButton>
    );
}

const TabButton = styled(Button)(({ theme }) => ({
    width: '120px',
    height: '45px',
    border: '1px solid #000000',
    borderRadius: '4px',
    // purple and dark blue gradient background
    background: 'linear-gradient(90deg, #2E0045 0%, #090032 100%)',
    // white text
    color: '#FFFFFF',
    textTransform: 'none',
    marginRight: '10px'
}));

const TabText = styled('span')(({ theme }) => ({
    fontSize: '16px'
}));