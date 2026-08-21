import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MissionProgressRing, MissionScreenFrame, MissionStatsRow, MissionSummaryCard, MissionTopBar, formatMinSec, repsSessionStats } from '../components/MissionSession';
import { MissionRewardDialog } from '../components/MissionRewardDialog';
import { PrimaryButton } from '../components/PrimaryButton';
import { getCharacter } from '../data/characters';
import { useApp } from '../store/AppProvider';
import { space } from '../theme';

const REP_MS = 5000;

export function PushupMissionScreen() {
  const { go, previousTab, completeMission, saveMissionProgress, characterId, level, xp, activeMission, missions } = useApp();
  const mission = activeMission?.kind === 'reps' ? activeMission : missions.find((item) => item.kind === 'reps');
  const character = getCharacter(characterId);
  const target = mission?.goal ?? 20;
  const title = mission?.title.replace(/\s+\d+\S*$/, '') || '근력';
  const [current, setCurrent] = useState(() => Math.floor(mission?.current ?? 0));
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const currentRef = useRef(current);
  currentRef.current = current;
  const done = current >= target;

  useEffect(() => {
    if (!mission) go('home');
  }, [mission, go]);

  useEffect(() => {
    if (!mission) return;
    setCurrent(Math.floor(mission.current ?? 0));
  }, [mission?.id]);

  useEffect(() => {
    if (!mission || mission.done) return;
    saveMissionProgress(mission.id, current);
  }, [current, mission?.id]);

  useEffect(() => {
    if (paused || done || !mission || mission.done) return;
    const id = setInterval(() => {
      setElapsed((ms) => {
        if (ms + 100 >= REP_MS) {
          setCurrent((n) => Math.min(target, n + 1));
          return 0;
        }
        return ms + 100;
      });
    }, 100);
    return () => clearInterval(id);
  }, [paused, done, mission, target]);

  const leave = () => {
    if (mission && !mission.done) saveMissionProgress(mission.id, currentRef.current);
    go(previousTab === 'quest' ? 'quest' : 'home');
  };

  const remaining = Math.max(0, (target - current) * (REP_MS / 1000) - elapsed / 1000);
  if (!mission) return null;

  return (
    <MissionScreenFrame>
      <SafeAreaView style={{ flex: 1, width: '100%' }} edges={['top']}>
        <MissionTopBar title={title} onBack={leave} onClose={leave} />
        <View style={{ marginTop: space[16] }}>
          <MissionSummaryCard
            iconSrc={require('../../assets/ui/icon-lift.png')}
            taskLabel={mission.title}
            statusLabel={mission.done || done ? '완료' : current > 0 ? '진행중' : '대기'}
            progress={current / target}
            progressText={`${current}/${target}${mission.unit}`}
          />
        </View>
        <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <MissionProgressRing
            progress={elapsed / REP_MS}
            topLabel="현재 횟수"
            centerValue={`${current}/${target}`}
            bottomLabel={done ? '미션 완료!' : `남은 시간 ${formatMinSec(remaining)}`}
          />
        </View>
        <MissionStatsRow stats={repsSessionStats(title, current, target)} />
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
