import { FC, useEffect, useState } from "react";
import { HandType, increment, Hands, incrementInitCount } from "../reducers/hands";
import { FormControlLabel, FormGroup, Grid, Switch } from "@mui/material";
import { useSelector } from "react-redux";
import { store } from "../reducers/store";
import { GameCounter } from "./game-count";
import { ProbabilityCounter } from "./probability-count";
import { TitleHeader } from "./title-header";
import { HandButton } from "./hand-button";
import { AquiredCoinCounter } from "./aquired-counter";
import { Chart } from './chart';

interface HomeViewProps {

}

export enum InputMode {
  // 初期入力
  inital,
  // 通常入力
  normal,
}

export type Counts = {
  setting1: number[],
  setting2: number[],
  setting3: number[],
  setting4: number[],
  setting5: number[],
  setting6: number[],
}

export const HomeView: FC<HomeViewProps> = (props) => {
  const { } = props;

  // 役一覧
  const hands: Hands = useSelector((state: any) => state.handsState.hands)

  // ゲーム数
  const [gameCount, setGameCount] = useState<number>(0);

  // 開始ゲーム数
  const [startingGameCount, setStartingGameCount] = useState<number>(0);

  // RB回数
  const [regularBonusCount, setRegularBonusCount] = useState<number>(0);

  // BB回数
  const [bigBonusCount, setBigBonusCount] = useState<number>(0);

  // ぶどう回数
  const [grapeCount, setGrapeCount] = useState<number>(0);

  // 入力モード(初期値入力)
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.normal);

  // 初期カウント
  const initialCounts = {
    setting1: [],
    setting2: [],
    setting3: [],
    setting4: [],
    setting5: [],
    setting6: [],
  }

  // シュミレーション結果
  const [counts, setCounts] = useState<{
    rbCounts: Counts,
    bbCounts: Counts,
    sumCounts: Counts,
  }>({
    rbCounts: initialCounts,
    bbCounts: initialCounts,
    sumCounts: initialCounts,
  });

  /**
   * ボタンクリック時のハンドラ
   * @param handType 役の種類
   */
  const handleClick = (handType: HandType) => {
    store.dispatch(increment(handType));
  }

  useEffect(() => {
    const rb = hands[HandType.regularBonus];
    const bb = hands[HandType.bigBonus];
    const grape = hands[HandType.grape]
    setRegularBonusCount(rb.count);
    setBigBonusCount(bb.count);
    setGrapeCount(grape.count);
  }, [hands]);

  // 処理中フラグ
  const [isBusy, setBusy] = useState<boolean>(false);

  useEffect(() => {
    if (gameCount > 10000) return;
    if (isBusy) return;

    //　処理中フラグを立てる
    setBusy(true);

    const setting1Result = bonusSimulator(5000, gameCount, 1 / 273.6, 1 / 409.1);
    const setting2Result = bonusSimulator(5000, gameCount, 1 / 270.8, 1 / 385.5);
    const setting3Result = bonusSimulator(5000, gameCount, 1 / 266.4, 1 / 336.1);
    const setting4Result = bonusSimulator(5000, gameCount, 1 / 254.0, 1 / 290.0);
    const setting5Result = bonusSimulator(5000, gameCount, 1 / 240.1, 1 / 268.6);
    const setting6Result = bonusSimulator(5000, gameCount, 1 / 229.1, 1 / 229.1);

    setCounts({
      rbCounts: {
        setting1: setting1Result.rbCounts,
        setting2: setting2Result.rbCounts,
        setting3: setting3Result.rbCounts,
        setting4: setting4Result.rbCounts,
        setting5: setting5Result.rbCounts,
        setting6: setting6Result.rbCounts,
      },
      bbCounts: {
        setting1: setting1Result.bbCounts,
        setting2: setting2Result.bbCounts,
        setting3: setting3Result.bbCounts,
        setting4: setting4Result.bbCounts,
        setting5: setting5Result.bbCounts,
        setting6: setting6Result.bbCounts,
      },
      sumCounts: {
        setting1: setting1Result.sumCounts,
        setting2: setting2Result.sumCounts,
        setting3: setting3Result.sumCounts,
        setting4: setting4Result.sumCounts,
        setting5: setting5Result.sumCounts,
        setting6: setting6Result.sumCounts,
      },
    });

    //　処理中フラグをおる
    setBusy(false);

  }, [gameCount, hands[HandType.regularBonus, HandType.bigBonus]]);

  /**
   * ゲーム数変更時のハンドラ
   * @param newGameCount ゲーム数
   */
  const handleChangeTotalGameCount = (newGameCount: number) => {
    setGameCount(newGameCount);
  }

  /**
   * 開始ゲーム数変更時のハンドラ
   * @param gameCount ゲーム数
   */
  const handleChangeStartingGameCount = (newGameCount: number) => {
    setStartingGameCount(newGameCount);
  }

  /**
   * ボーナスボタンクリック時のハンドラ
   * @param bonusType ボーナス種別
   */
  const handleClickBonusButton = (bonusType: HandType) => {
    const isInitInput = inputMode === InputMode.inital;
    // 初期入力フラグが立っている場合は初期カウントをインクリメントする
    if (isInitInput) {
      store.dispatch(incrementInitCount(bonusType));
    } else {
      store.dispatch(increment(bonusType));
    }
  }

  /**
   * ボーナスボタン
   * @param bonusName ボーナス名
   * @returns DOM
   */
  const bonusButton = (bonusType: HandType.bigBonus | HandType.regularBonus) => {
    // ボーナス役
    const bonus = hands[bonusType];
    return (
      <Grid
        item
        key={bonus.id}
        xs={4}
        sx={{
          p: 1,
        }}
      >
        <HandButton
          hand={bonus}
          hasInitCaption={true}
          onClick={() => { handleClickBonusButton(bonus.id) }}
        />
      </Grid>
    )
  }

  /**
   * 子役ボタン
   * @param handType 役名
   * @returns DOM
   */
  const handButton = (handType: HandType) => {
    const hand = hands[handType];

    if (!hand) return;

    return (
      <Grid
        item
        key={hand.id}
        xs={4}
        sx={{
          p: 1,
        }}
      >
        <HandButton
          hand={hand}
          onClick={handleClick}
        />
      </Grid>
    )
  }

  /**
   * 入力モード変更スイッチのハンドラ
   */
  const handleChangeInputModeSwitch = () => {
    if (inputMode === InputMode.inital) {
      setInputMode(InputMode.normal)
    } else if (inputMode === InputMode.normal) {
      setInputMode(InputMode.inital)
    }
  }

  /**
   * ボーナスシュミレータ
   * @param loops ループ回数
   * @param tryCount 試行回数
   * @returns RB,BB,合算回数のシュミレーション結果
   */
  const bonusSimulator = (
    loops: number,
    tryCount: number,
    bbProbability: number,
    rbProbability: number,
  ): { bbCounts: number[], rbCounts: number[], sumCounts: number[], } => {
    let bbResult: number[] = [];
    let rbResult: number[] = [];
    let sumResult: number[] = [];

    // 100回分のデータを初期作成する
    for (let i = 0; i < 100; i++) {
      bbResult.push(0)
      rbResult.push(0)
      sumResult.push(0)
    }

    // 規定の回数ループ
    for (let i = 0; i < loops; i++) {
      let rbCount = 0
      let bbCount = 0

      // 0 ~ BB確率
      const bbThreshold = bbProbability;
      // BB確率 ~ 合成確率
      const rbThreshold = bbThreshold + rbProbability;

      // nゲームでの当選回数をカウント
      for (let gameCount = 0; gameCount < tryCount; gameCount++) {
        // 生成乱数
        const generatedNumber = Math.random();

        if (generatedNumber < bbThreshold) {
          // BB当選としてカウントする
          bbCount += 1;
        } else if (generatedNumber < rbThreshold) {
          // RB当選としてカウントする
          rbCount += 1;
        }
      }
      bbResult[bbCount] += 1;
      rbResult[rbCount] += 1;
      sumResult[bbCount + rbCount] += 1;
    }
    return {
      rbCounts: rbResult,
      bbCounts: bbResult,
      sumCounts: sumResult,
    };
  }

  return (
    <>
      <TitleHeader
        title="ジャグラー設定判別ツール"
      />
      <GameCounter
        onChangeTotalGameCount={handleChangeTotalGameCount}
        onChangeStartingGameCount={handleChangeStartingGameCount}
        totalGameCount={gameCount}
        startingGameCount={startingGameCount}
      />
      <AquiredCoinCounter
        gameCount={gameCount - startingGameCount}
        hands={hands}
      />
      <Grid
        container
      >
        {bonusButton(HandType.bigBonus)}
        {bonusButton(HandType.regularBonus)}
        <Grid
          item
          xs={3}
        >
          <FormGroup>
            <FormControlLabel control={
              <Switch
                onClick={handleChangeInputModeSwitch}
                color={'warning'}
                size={'small'}
              />
            }
              label={'ボーナス初期値入力'}
              labelPlacement={'top'}
            />
          </FormGroup>
        </Grid>
      </Grid>
      <ProbabilityCounter
        caption="合計確率"
        gameCount={gameCount}
        occurrence={bigBonusCount + regularBonusCount}
      />
      <ProbabilityCounter
        caption="RB確率"
        gameCount={gameCount}
        occurrence={regularBonusCount}
      />
      <ProbabilityCounter
        caption="BB確率"
        gameCount={gameCount}
        occurrence={bigBonusCount}
      />
      <Grid
        container
      >
        {handButton(HandType.grape)}
        {handButton(HandType.replay)}
        {handButton(HandType.cherry)}
      </Grid>
      <ProbabilityCounter
        caption="ブドウ確率"
        gameCount={gameCount - startingGameCount}
        occurrence={grapeCount}
        significantDigit={2}
      />
      <Chart
        title="設定6 RBシュミレータ(5000回)"
        counts={counts.rbCounts}
        currentValue={hands[HandType.regularBonus].count}
      />
      <Chart
        title="設定6 BBシュミレータ(5000回)"
        counts={counts.bbCounts}
        currentValue={hands[HandType.bigBonus].count}
      />
      <Chart
        title="設定6 合算シュミレータ(5000回)"
        counts={counts.sumCounts}
        currentValue={hands[HandType.regularBonus].count + hands[HandType.bigBonus].count}
      />
    </>
  )
}