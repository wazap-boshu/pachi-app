import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { FC } from "react";
import { Hands, HandType } from "../reducers/hands";

interface AquiredCoinCounterProps {
  gameCount: number;
  hands: Hands;
}

export const AquiredCoinCounter: FC<AquiredCoinCounterProps> = (props) => {
  const { 
    gameCount,
    hands,
  } = props;

  const regularBonus = hands[HandType.regularBonus];
  const bigBonus = hands[HandType.bigBonus];
  const grape = hands[HandType.grape];
  const cherry = hands[HandType.cherry];
  const replay = hands[HandType.replay];

  const reglarBonusCoinCount = (regularBonus.count - regularBonus.initCount) * 96;
  const bigBonusCoinCount = (bigBonus.count - bigBonus.initCount) * 240;
  const grapeCoinCount = grape.count * 8;
  const cherryCoinCount = cherry.count * 2;
  const replayCoinCount = replay.count * 3;

  const gameCoinCount = gameCount * 3;

  // 獲得枚数
  const aquiredCount = reglarBonusCoinCount + bigBonusCoinCount + grapeCoinCount + replayCoinCount + cherryCoinCount - gameCoinCount;

  return (
    <Box
      display='flex'
    >
      <Typography
        width="100px"
      >
        獲得枚数
      </Typography>
      <Typography
        width="10px"
      >
        :
      </Typography>
      <Typography
        fontWeight="bold"
        fontSize="20px"
      >
        {aquiredCount}枚
      </Typography>
    </Box>
  );
}