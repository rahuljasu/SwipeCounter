import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, PanResponder, AppState } from "react-native";
import { StatusBar } from "expo-status-bar";
import { saveCounts, loadCounts, ensureHistoryForToday } from "./utils/storage";
import { VictoryBar, VictoryChart, VictoryAxis } from "victory-native";

export default function App() {
  const [todayCount, setTodayCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [history, setHistory] = useState([]); // [{date: 'YYYY-MM-DD', count: n}, ...]
  const appState = useRef(AppState.currentState);

  // Load persisted counts
  useEffect(() => {
    (async () => {
      const { today, total, hist } = await loadCounts();
      setTodayCount(today);
      setTotalCount(total);
      setHistory(hist);
    })();
  }, []);

  // Prepare responders for UP swipe only
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => {
        // significant vertical move
        return Math.abs(g.dy) > 30 && Math.abs(g.dy) > Math.abs(g.dx);
      },
      onPanResponderRelease: async (_, g) => {
        if (g.dy < -50) {
          // swipe up
          const { today, total, hist } = await ensureHistoryForToday();
          const newToday = today + 1;
          const newTotal = total + 1;
          // update today's entry in history
          const updated = hist.map(h =>
            h.date === new Date().toISOString().slice(0,10)
              ? { ...h, count: h.count + 1 }
              : h
          );
          setTodayCount(newToday);
          setTotalCount(newTotal);
          setHistory(updated);
          await saveCounts(newToday, newTotal, updated);
        }
      },
    })
  ).current;

  // Handle day rollover when returning to foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (next) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        const { today, total, hist } = await ensureHistoryForToday();
        setTodayCount(today);
        setTotalCount(total);
        setHistory(hist);
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  const chartData = history.map((h, idx) => ({
    x: new Date(h.date).toLocaleDateString(),
    y: h.count
  }));

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar style="light" />
      <Text style={styles.title}>Swipe-Up Counter</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Today's swipes</Text>
        <Text style={styles.big}>{todayCount}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Total swipes</Text>
        <Text style={styles.big}>{totalCount}</Text>
      </View>

      <Text style={[styles.label, { marginTop: 16 }]}>Last 7 days</Text>
      <View style={styles.chartBox}>
        {chartData.length > 0 ? (
          <VictoryChart domainPadding={{ x: 16, y: 10 }}>
            <VictoryAxis fixLabelOverlap />
            <VictoryAxis dependentAxis />
            <VictoryBar data={chartData} />
          </VictoryChart>
        ) : (
          <Text style={styles.muted}>Start swiping up to see your history.</Text>
        )}
      </View>

      <Text style={styles.hint}>Swipe UP anywhere on screen ↑</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    paddingTop: 64,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#1b1b1b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 4,
  },
  big: {
    color: "#4caf50",
    fontSize: 40,
    fontWeight: "800",
  },
  chartBox: {
    backgroundColor: "#1b1b1b",
    borderRadius: 16,
    padding: 8,
    height: 260,
    justifyContent: "center",
  },
  hint: {
    textAlign: "center",
    color: "#888",
    marginTop: 16,
    fontSize: 14,
  },
  muted: {
    color: "#666",
    textAlign: "center"
  }
});