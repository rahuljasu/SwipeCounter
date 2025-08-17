import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@swipe_counts_v1"; // { todayDate, today, total, history: [ {date, count} * 7 ] }

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function emptyHistory7() {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push({ date: d.toISOString().slice(0,10), count: 0 });
  }
  return days;
}

export async function loadCounts() {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    const hist = emptyHistory7();
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({ todayDate: todayStr(), today: 0, total: 0, history: hist })
    );
    return { today: 0, total: 0, hist };
  }
  try {
    const data = JSON.parse(raw);
    // rollover if saved date != today
    if (data.todayDate !== todayStr()) {
      // shift history, drop oldest, append new today
      const hist = data.history || emptyHistory7();
      const shifted = hist.slice(1).concat({ date: todayStr(), count: 0 });
      const today = 0;
      const total = data.total || 0;
      const newData = { todayDate: todayStr(), today, total, history: shifted };
      await AsyncStorage.setItem(KEY, JSON.stringify(newData));
      return { today, total, hist: shifted };
    }
    return { today: data.today || 0, total: data.total || 0, hist: data.history || emptyHistory7() };
  } catch(e) {
    const hist = emptyHistory7();
    return { today: 0, total: 0, hist };
  }
}

export async function ensureHistoryForToday() {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return loadCounts();
  const data = JSON.parse(raw);
  if (data.todayDate !== todayStr()) {
    const hist = data.history || emptyHistory7();
    const shifted = hist.slice(1).concat({ date: todayStr(), count: 0 });
    const newData = { todayDate: todayStr(), today: 0, total: data.total || 0, history: shifted };
    await AsyncStorage.setItem(KEY, JSON.stringify(newData));
    return { today: 0, total: newData.total, hist: shifted };
  }
  return { today: data.today || 0, total: data.total || 0, hist: data.history || emptyHistory7() };
}

export async function saveCounts(today, total, history) {
  const raw = await AsyncStorage.getItem(KEY);
  const data = raw ? JSON.parse(raw) : { todayDate: todayStr(), today: 0, total: 0, history: emptyHistory7() };
  const newData = { ...data, today, total, history, todayDate: todayStr() };
  await AsyncStorage.setItem(KEY, JSON.stringify(newData));
}