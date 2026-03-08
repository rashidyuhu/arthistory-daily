import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CountdownTimerProps {
  size?: number;
  variant?: 'circle' | 'text';
}

export function CountdownTimer({ size = 60, variant = 'circle' }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0 });
  const progress = useSharedValue(0);

  const calculateTimeUntilMidnight = () => {
    const now = new Date();
    
    // Get next midnight in local time
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // Tomorrow
      0, // Hours: midnight
      0, // Minutes
      0, // Seconds
      0  // Milliseconds
    );

    const diff = nextMidnight.getTime() - now.getTime();
    const totalMinutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Calculate progress (0 to 1) for the circular indicator
    const totalMinutesInDay = 24 * 60;
    const minutesElapsed = totalMinutesInDay - totalMinutes;
    const progressValue = minutesElapsed / totalMinutesInDay;

    return { hours, minutes, progress: progressValue };
  };

  useEffect(() => {
    const updateTimer = () => {
      const { hours, minutes, progress: progressValue } = calculateTimeUntilMidnight();
      setTimeRemaining({ hours, minutes });
      progress.value = withTiming(progressValue, {
        duration: 1000,
        easing: Easing.linear,
      });
    };

    // Update immediately
    updateTimer();

    // Update every minute
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, []);

  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedCircleProps = useAnimatedProps(() => {
    const offset = circumference * (1 - progress.value);
    return {
      strokeDashoffset: offset,
    };
  });

  const hoursStr = String(timeRemaining.hours).padStart(2, '0');
  const minutesStr = String(timeRemaining.minutes).padStart(2, '0');

  if (variant === 'text') {
    return (
      <Text style={styles.textVariant} numberOfLines={1}>
        <Text style={styles.textVariantBold}>{hoursStr}</Text>
        {' hours '}
        <Text style={styles.textVariantBold}>{minutesStr}</Text>
        {' minutes'}
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.timerContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.countdownBackground}
            strokeWidth={4}
            fill="none"
          />
          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.countdownForeground}
            strokeWidth={4}
            fill="none"
            strokeDasharray={circumference}
            strokeLinecap="round"
            animatedProps={animatedCircleProps}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.timeTextContainer}>
          <Text style={styles.timeText}>
            {hoursStr}:{minutesStr}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  timeTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    ...theme.typography.caption,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.countdownText,
  },
  textVariant: {
    ...theme.typography.caption,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
    color: theme.colors.countdownText,
  },
  textVariantBold: {
    fontWeight: '700',
  },
});
