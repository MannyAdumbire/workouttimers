// WorkoutContext.js
import React, { useEffect, useState } from "react";

export const WorkoutContext = React.createContext();

const WorkoutContextWrap = ({ children }) => {
  // use a map
  const [timersMap, setTimersMap] = useState(new Map());
  // Id of the active timer.
  const [activeTimer, setActiveTimer] = useState(null);
  // States "ready", "running", "stopped", "reset
  const [mode, setMode] = useState("stopped");

  /**
   * @param {Object} options
   * @param {Map} options.timersMap - for accessing timer directly by id.
   * @param {Object} options.timersObj - for timers persistence(JSON).
   * @param {boolean} options.isRunning - Whether the workout is running.
   * @param {string} options.activeTimer - The id of the active timer.
   * @param {number} options.secondsTotal - set time on all timers totalled.
   * @param {number} options.secondsLeft - time left on all timers totalled.
   */
  const [options, setOptions] = useState({
    timersObj: {},
    isRunning: false,
    activeTimer: null,
    secondsTotal: 0,
    secondsLeft: 0,
  });
  const [workout, setWorkout] = useState({
    mode: mode,
    options: options,
    timers: timersMap,
  });
  const workoutFns = { addTimer, removeTimer, nextTimer, setMode };

  const workoutProps = {
    workout,
    setWorkout,
    options,
    timers: timersMap,
    workoutFns,
    addTimer,
  };

  useEffect(() => {
    if (mode === "running") {
      // If active timer is missing/deleted, replace it.
      if (!activeTimer || !timersMap.has(activeTimer)) {
        resetActiveTimer();
      }
    } else if (mode === "stopped") {
      stopAllTimers();
    } else if (mode === "reset") {
      resetWorkout();
    }
    function stopAllTimers() {
      for (let [, timer] of timersMap.entries()) {
        // stop any timers that are running.
        timer.status === "running" && (timer.status = "stopped");
        // if this is a reset, stop any timers that are completed.
        mode === "reset" &&
          timer.status === "completed" &&
          (timer.status = "stopped");
      }
      setTimersMap(new Map(timersMap));
    }
    function resetWorkout() {
      // Reset all timers to "stopped" so that "completed" timers will also be reset.
      setMode("stopped");
      stopAllTimers();
      resetActiveTimer();
    }
    // if (!undefined)  // TODO - causes error that is difficult to pinpoint
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Keep the options in sync with mode.
  useEffect(() => {
    options.mode = mode;
    options.activeTimer = activeTimer;
    setOptions({ ...options });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, activeTimer]);

  // Set update the status of the active timer to match the workout mode.
  useEffect(() => {
    const timerM = timersMap.get(activeTimer);
    if (timerM) {
      timerM.status = mode;
      setTimersMap(new Map(timersMap));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTimer]);

  // Logic to add a timer and update the total times.
  function addTimer(timer) {
    const newTimersMap = new Map(timersMap);
    // Set the active timer if there isn't one already.
    (activeTimer && timersMap.get(activeTimer)) || resetActiveTimer();
    // Add the new time.
    newTimersMap.set(timer.timerId, timer);
    setTimersMap(newTimersMap);
    setWorkout({
      mode: mode,
      options: options,
      timers: newTimersMap,
      fns: { ...workout.fns },
    });
  }
  // Reset the active timer to the first timer in the queue that isn't completed.
  function resetActiveTimer() {
    for (let [id, timer] of timersMap) {
      if (timer.status !== "completed") {
        setActiveTimer(id);
        break;
      }
    }
  }

  // eslint-disable-next-line no-unused-vars
  function getRemainingTime() {
    // Get the total time for all timers that aren't completed.
    // Loop through the timers and add up the total time.
    let total = 0;
    const timersIterator = timersMap.entries();
    for (let [, value] of timersIterator) {
      if (value.status !== "completed") {
        total +=
          (value.minutesPerRound * 60 + value.secondsPerRound) *
            value.roundsTotal +
          (value.minutesRest * 60 + value.secondsRest) * value.roundsTotal;
      }
    }
    return total;
  }
  // Move to the next timer.
  function nextTimer() {
    if (activeTimer === null || timersMap.size === 0) {
      setMode("reset");
      return;
    }
    let timersIterator = timersMap.entries();
    for (let [key, value] of timersIterator) {
      value.status = "completed";
      if (key === activeTimer) {
        const nextTimer = timersIterator.next().value;
        if (nextTimer) {
          // If there is another timer, set it as the active timer.
          setActiveTimer(nextTimer[0]);
          return;
        } else {
          // No "next" timers left.
          setMode("reset");
        }
      }
    }
  }

  // remove a timer by id.
  function removeTimer(timerId) {
    // account for removed active timer.
    if (activeTimer === timerId) {
      nextTimer();
    }
    let hasUncompletedTimers = false;
    // if no more timers, reset the workout.
    for (let [, timer] of timersMap.entries()) {
      if (timer.status !== "completed") {
        hasUncompletedTimers = true;
      }
    }
    // remove the timer.
    timersMap.delete(timerId);
    // save updated state.
    setTimersMap(new Map(timersMap));
    if (!hasUncompletedTimers) {
      setMode("reset");
    }
  }

  return (
    <WorkoutContext.Provider value={workoutProps}>
      {children}
    </WorkoutContext.Provider>
  );
};
export default WorkoutContextWrap;
