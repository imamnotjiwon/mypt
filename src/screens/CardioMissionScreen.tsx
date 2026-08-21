import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MissionProgressRing, MissionScreenFrame, MissionStatsRow, MissionSummaryCard, MissionTopBar, cardioSessionStats, formatMinSec } from '../components/MissionSession';
import { MissionRewardDialog } from '../components/MissionRewardDialog';
import { PrimaryButton } from '../components/PrimaryButton';
import { getCharacter } from '../data/characters';
import { useApp } from '../store/AppProvider';
import { space } from '../theme';

export function CardioMissionScreen() {
  const { go, previousTab, completeMission, saveMissionProgress, characterId, level, xp, activeMission, missions } = useApp();
  const mission = activeMission?.kind === 'cardio' ? activeMission : missions.find((item) => item.kind === 'cardio');
  const character = getCharacter(characterId);
  const targetMin = mission?.goal ?? 20;
  const targetMs = targetMin * 60 * 1000;
  const title = mission?.title.replace(/\s+\d+\S*$/, '') || '유산소';
  const [elapsedMs, setElapsedMs] = useState(() => Math.min(targetMs, Math.round((mission?.current ?? 0) * 60 * 1000)));
  const [paused, setPaused] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const elapsedMsRef = useRef(elapsedMs);
  elapsedMsRef.current = elapsedMs;
  const elapsedSec = Math.floor(elapsedMs / 1000);
  const targetSec = targetMin * 60;
  const elapsedMin = elapsedMs / 60000;
  const done = elapsedMs >= targetMs;

  useEffect(() => {
    if (!mission) go('home');
  }, [mission, go]);

  useEffect(() => {
    if (!mission) return;
    setElapsedMs(Math.min(targetMs, Math.round((mission.current ?? 0) * 60 * 1000)));
  }, [mission?.id]);

  useEffect(() => {
    if (!mission || mission.done) return;
    saveMissionProgress(mission.id, elapsedMs / 60000);
  }, [elapsedSec, mission?.id]);

  useEffect(() => {
    if (paused || done || !mission || mission.done) return;
    let last = typeof performance !== 'undefined' ? performance.now() : Date.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = now - last;
      if (dt >= 32) {
        last = now;
        setElapsedMs((ms) => Math.min(targetMs, ms + dt));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, done, mission, targetMs]);

  const leave = () => {
    if (mission && !mission.done) saveMissionProgress(mission.id, elapsedMsRef.current / 60000);
    go(previousTab === 'quest' ? 'quest' : 'home');
  };

  if (!mission) return null;

  return (
    <MissionScreenFrame>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <MissionTopBar title={title} onBack={leave} onClose={leave} />
        <View style={{ marginTop: space[16] }}>
          <MissionSummaryCard
            iconSrc={require('../../assets/ui/icon-cardio.png')}
            taskLabel={mission.title}
            statusLabel={mission.done || done ? '완료' : elapsedMs > 0 ? '진행중' : '대기'}
            progress={elapsedMs / targetMs}
            progressText={`${formatMinSec(elapsedSec)} / ${formatMinSec(targetSec)}`}
          />
        </View>
        <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <MissionProgressRing
            progress={elapsedMs / targetMs}
            topLabel="현재 시간"
            centerValue={formatMinSec(elapsedSec)}
            bottomLabel={done ? '미션 완료!' : `남은 시간 ${formatMinSec(targetSec - elapsedSec)}`}
          />
        </View>
        <MissionStatsRow stats={cardioSessionStats(title, elapsedMin, targetMin)} />
        <View style={{ marginTop: space[16], marginBottom: space[16] }}>
          {done ? (
            <PrimaryButton label="운동 완료하기" onPress={() => setShowReward(true)} />
          ) : (
            <PrimaryButton label={paused ? '다시 시작하기' : '잠시 멈추기'} onPress={() => setPaused((p) => !p)} />
          )}
        </View>
      </SafeAreaView>
      {showReward ? (
        <MissionRewardDialog
          character={character.body}
          coinReward={mission.coinReward}
          xpReward={mission.xpReward}
          level={level}
          currentXp={xp}
          onConfirm={() => completeMission(mission.id, mission.coinReward, mission.xpReward)}
        />
      ) : null}
    </MissionScreenFrame>
  );
}
