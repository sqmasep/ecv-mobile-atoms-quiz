# ⚛️ Atom Quiz

A fast-paced periodic table quiz app built with **Expo** and **React Native**. Test your knowledge of element names, symbols, and atomic numbers — with real-time reaction tracking and achievements.

---

## Features

### Gameplay

- **3 guess modes** — identify elements by their **Name**, **Symbol**, or **Atomic Number**
- **9 category filters** — quiz yourself on all 118 elements or focus on a specific group (alkali metals, noble gases, lanthanides, etc.)
- **3 order modes** — **Random**, **Atomic Number** order, or **Alphabetical**
- **Auto-send** — submit answers automatically as soon as they're typed correctly
- **Skip & Reset** — skip tricky elements or restart mid-game with a confirmation prompt

### Stats & Timing

- Live elapsed timer and score counter during gameplay
- Per-element **reaction time** badge that animates in/out after each answer
- Full **reaction time recap** at the end of the game, color-coded by speed
- Skip and error counts tracked throughout

### Achievements

15 unlockable achievements rewarding speed, accuracy, and completionism:

| Achievement        | Description                                            |
| ------------------ | ------------------------------------------------------ |
| ⚡ Reflex          | Answer any element in under 700 ms                     |
| 🔬 Deep Focus      | Answer any element in under 300 ms                     |
| 🔥 On Fire         | Answer 3 consecutive elements each under 500 ms        |
| 📚 Scholar         | Complete a game without any wrong answers              |
| 🎯 Perfect         | Complete a game without skipping a single element      |
| 💎 Flawless        | Complete a game with zero errors and zero skips        |
| 💨 Blitz           | Finish any full-score game in under 60 seconds         |
| 🌍 Completionist   | Complete a game with all 118 elements in the pool      |
| 🏎️ Speed Run       | Beat all 118 elements in under 3 minutes               |
| 👑 Noble Blood     | Complete the Noble Gas category without skipping       |
| 🔤 Symbol Master   | Complete a game in Symbol mode without skipping        |
| 🔢 Number Cruncher | Complete a game in Atomic Number mode without skipping |
| 📖 Alphabetist     | Complete any game sorted A→Z                           |
| …                  | and more                                               |

---

## Tech Stack

| Layer         | Library                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| Framework     | [Expo](https://expo.dev) ~54 / React Native 0.81                                                         |
| Navigation    | [Expo Router](https://expo.dev/router) v6 (file-based)                                                   |
| State         | [Zustand](https://zustand-demo.pmnd.rs/)                                                                 |
| Data fetching | [TanStack Query](https://tanstack.com/query) v5                                                          |
| Auth storage  | [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) |
| Icons         | [@expo/vector-icons](https://icons.expo.fyi/) (MaterialCommunityIcons, Ionicons)                         |
| Language      | TypeScript                                                                                               |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- [Expo Go](https://expo.dev/go) on your phone, or a configured iOS/Android simulator

### Install

```bash
bun install
# or: npm install
```

### Run

```bash
bun start
# or: npx expo start
```

Then scan the QR code with Expo Go, or press:

- `a` — Android emulator
- `i` — iOS simulator
- `w` — browser (web)

---

## Project Structure

```
app/
  (tabs)/
    index.tsx        # Main quiz screen (idle → playing → finished)
    explore.tsx      # Explore tab
  auth/
    sign-in.tsx      # Sign in screen
    sign-up.tsx      # Sign up screen
  achievements.tsx   # Achievements list modal
  modal.tsx          # Generic modal
components/          # Reusable UI components
constants/           # Achievements, palette, game constants, theme
context/             # React contexts (achievements, settings)
hooks/               # use-game, use-elements, use-theme-color, …
stores/              # Zustand stores (auth)
types/               # TypeScript types (game, achievement)
utils/               # Game logic, achievement checks
data.json            # Local periodic table dataset (118 elements)
```

---

## Scripts

| Command           | Description               |
| ----------------- | ------------------------- |
| `bun start`       | Start the Expo dev server |
| `bun run android` | Open on Android emulator  |
| `bun run ios`     | Open on iOS simulator     |
| `bun run web`     | Open in browser           |
| `bun run lint`    | Run ESLint                |
