import {
  useSessionId,
  useSessionIdArg,
  useSessionMutation,
  useSessionQuery,
} from "convex-helpers/react/sessions";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { useStableQuery } from "../hooks/useStableQuery";
// import { useLocalStorage } from "usehooks-ts";

export default () => {
  const [sessionId, refreshSessionId] = useSessionId();
  const login = useSessionMutation(api.sessionsExample.logIn);
  const logout = useSessionMutation(api.sessionsExample.logOut);
  const myPresence = useSessionQuery(api.sessionsExample.myPresence);
  const joinRoom = useSessionMutation(
    api.sessionsExample.joinRoom,
  ).withOptimisticUpdate((store, args) => {
    if (!sessionId) return;
    const roomPresence = store.getQuery(api.sessionsExample.myPresence, {
      sessionId,
    });
    store.setQuery(
      api.sessionsExample.myPresence,
      { sessionId },
      roomPresence ? [...roomPresence, args.room] : undefined,
    );
  });
  const [room, setRoom] = useState("");
  const roomData = useStableQuery(
    api.sessionsExample.roomPresence,
    useSessionIdArg(room ? { room } : "skip"),
  );
  return (
    <div>
      <h2>Sessions Example</h2>
      <span>{sessionId}</span>
      <button
        onClick={() =>
          refreshSessionId((newSessionId) => login({ new: newSessionId }))
        }
      >
        Refresh Session Id on Log In
      </button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (room) joinRoom({ room });
          setRoom("");
        }}
      >
        <label>Join a room</label>
        <input
          type="text"
          placeholder="Room name"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
      </form>
      <p>{JSON.stringify(roomData)}</p>
      <ul>{myPresence && myPresence.map((room) => <li>{room}</li>)}</ul>

      <button onClick={() => refreshSessionId((newSessionId) => logout())}>
        Delete Session Data on Log Out
      </button>
    </div>
  );
};
