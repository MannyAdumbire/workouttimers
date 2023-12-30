import React, { useContext } from "react";
import styled, { css } from "styled-components";
import Timer from "../timers/Timer.js";
import * as ws from "../../WorkoutStyles";

// Contexts.
import { WorkoutContext } from "../../WorkoutContext.js";

// Styled components.
import Button from "./Button.js";

const StyledTimers = styled(ws.Container)`
  flex-direction: column;
  align-items: flex-start;
  align-self: center;
`;
const TimerWrap = styled(ws.Container)`
  align-self: flex-start;
  cursor: pointer;
  span{
    visibility: hidden;
  }
  :hover span{
    visibility: visible;
  }
  &:hover::after {
    visibility: visible;
  }
  ${(props) =>
    props.isEditing &&
    css`
      border: solid 1px green;
    `}
  ${(props) =>
    props.canEdit &&
    css`
      :hover {
      }
    `}
  ${(props) =>
    props.status === "completed" &&
    css`
      color: grey;
      text-decoration: line-through;
      display: none;
    `}
  ${(props) => props.status === "running" && css``}
`;
const SwapButton = styled(ws.Button)`
  padding: 0rem;
  margin: 0rem;
  border: none;
  width: 16px;
  height: 16px;
`;
const TimersPanel = ({
  timers,
  hideCancelBtn = false,
  hideSwapBtn = false,
  ...props
}) => {
  const { workoutFns } = useContext(WorkoutContext);

  const timersArr = Array.from(timers.entries());
  // Keep the current mode in sync with the parent component that passed it in.
  return (
    <StyledTimers {...props}>
      {/* TODO - Why empty fn error is so difficult to pinpoint ? */}
      {/* {(()=>{ */}
      {/* })} */}
      {timersArr.map(([id, timer]) => (
        <TimerWrap
          status={timer.status}
          key={`button-${id}`}
          onClick={() => {
            props.editTimerIdSetter && props.editTimerIdSetter(timer.timerId);
            // Set all the other timers to not editing.
            timersArr.forEach(([id, timer]) => {
              timer.isEditing = false;
            }); // Added closing parenthesis here
            timer.isEditing = true;
          }}
          isEditing={timer.isEditing}
          {...props}
        >
          {/* add remove when not timer "running" */}
          {!hideCancelBtn && (
            <ws.Container>
              <Button
                type="remove"
                label=""
                title="Remove Timer"
                img="❌"
                hover="lightcoral"
                onClick={() => workoutFns.removeTimer(timer.timerId)}
              />
            </ws.Container>
          )}
          {!hideSwapBtn && (
            <ws.Container style={{ flexDirection: "column" }}>
              {timer.isFirst ||
                (!timer.isPrevCompleted && (
                  <SwapButton
                    type="swapprev"
                    label=""
                    title="Swap Previous"
                    hover="silver"
                    img="⤴️"
                    onClick={() => workoutFns.swapTimers(timer.timerId, false)}
                  />
                ))}
              {!timer.isLast && (
                <SwapButton
                  type="swapnext"
                  label=""
                  title="Swap Next"
                  hover="silver"
                  img="⤵️"
                  onClick={() => workoutFns.swapTimers(timer.timerId, true)}
                />
              )}
            </ws.Container>
          )}
          <Timer key={`timer-${id}`} {...timer} />
              <span>
                ✏️️ Edit
              </span>
        </TimerWrap>
      ))}
    </StyledTimers>
  );
};
export default TimersPanel;
