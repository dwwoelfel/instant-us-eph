"use client";

import { init, tx, id } from "@instantdb/react";

import randomHandle from "./utils/randomHandle";
import { useState, useRef, useEffect } from "react";

// ---------
// Helpers
// ---------
function Button({ children, onClick }) {
  return (
    <button
      className="px-2 py-1 outline hover:bg-gray-200 focus:outline-amber-500 focus:outline-2"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

const handle = randomHandle();

// ---------
// App
// ---------

// Replace this with your own App ID from https://instantdb.com/dash
const APP_ID = "9070d442-4eb2-48b8-aec0-e640954b6e85";

type Message = {
  id: string;
  text: string;
  handle: string;
  createdAt: number;
};

// Define InstantDB schema
type Schema = {
  messages: Message;
};

type RoomSchema = {
  online: {
    presence: { handle: string };
    topics: {
      reaction: { emoji: string };
    };
  };
};

// Initialize connection to InstantDB app
const db = init<Schema, RoomSchema>({ appId: APP_ID });

function typingInfo(users) {
  if (users.length === 0) return null;
  if (users.length === 1) return `${users[0].handle} is typing...`;
  if (users.length === 2)
    return `${users[0].handle} and ${users[1].handle} are typing...`;

  return `${users[0].handle} and ${users.length - 1} others are typing...`;
}

function Main({ user }: { user: any }) {
  // Read from InstantDB
  const { isLoading, error, data } = db.useQuery({ messages: {} });
  const room = db.room("online", "1");
  const { peers, publishPresence } = room.usePresence();
  const typing = room.useTypingIndicator("chat");

  useEffect(() => {
    publishPresence({ handle });
  });

  console.log("room", room);
  console.log("peers", peers);
  const inputRef = useRef(null);
  const [editId, setEditId] = useState(null);

  if (isLoading) {
    return <div>Fetching data...</div>;
  }
  if (error) {
    return (
      <div className="p-2 font-mono">
        Invalid `APP_ID`. Go to{" "}
        <a
          href="https://instantdb.com/dash"
          className="underline text-blue-500"
        >
          https://instantdb.com/dash
        </a>{" "}
        to get a new `APP_ID`
      </div>
    );
  }
  const { messages } = data;

  const onSubmit = () => {
    addMessage(inputRef.current.value, handle, user.id);
    inputRef.current.value = "";
    inputRef.current.focus();
  };
  const onKeyDown = (e: any) => {
    typing.inputProps.onKeyDown(e);

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="p-4 space-y-6 w-full sm:w-[640px] mx-auto">
      <h1 className="text-2xl font-bold">Logged in as: {handle}</h1>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between border-b border-b-gray-500 pb-2 space-x-2">
          <div className="flex flex-1">
            <input
              ref={inputRef}
              className="flex-1 py-1 px-2 focus:outline-2 focus:outline-amber-500"
              autoFocus
              placeholder="Enter some message..."
              onKeyDown={onKeyDown}
              type="text"
            />
          </div>
          <Button onClick={onSubmit}>Submit</Button>
        </div>
        <div className="truncate text-xs text-gray-500">
          {typing.active.length ? typingInfo(typing.active) : <>&nbsp;</>}
        </div>
      </div>

      <div className="space-y-2">
        {messages.map((message) => (
          <div key={message.id}>
            {editId === message.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  db.transact(
                    tx.message[message.id].update({
                      text: e.target[0].value,
                    })
                  );
                  setEditId(null);
                }}
              >
                <input defaultValue={message.text} autoFocus type="text" />
              </form>
            ) : (
              <div className="flex justify-between">
                <p>
                  {message.handle}: {message.text}
                </p>
                <span className="space-x-4">
                  <Button onClick={() => setEditId(message.id)}>Edit</Button>
                  <Button onClick={() => deleteMessage(message)}>Delete</Button>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="border-b border-b-gray-300 pb-2">
        <div>Friends</div>
        {Object.values(peers).map(({ handle }) => (
          <div>{handle}</div>
        ))}
      </div>
      <Button onClick={() => deleteAllMessages(messages)}>Delete All</Button>
      <div>
        <Button onClick={() => db.auth.signOut()}>Log out</Button>
      </div>
    </div>
  );
}

// Write to InstantDB
// ---------
function addMessage(text: string, handle: string, userId: string) {
  db.transact(
    tx.messages[id()].update({
      userId,
      text,
      handle,
      createdAt: Date.now(),
    })
  );
}

function deleteMessage(message: Message) {
  db.transact(tx.message[message.id].delete());
}

function deleteAllMessages(messages: Message[]) {
  const txs = messages.map((message) => tx.message[message.id].delete());
  db.transact(txs);
}

function Login() {
  const authUrl = db.auth.createAuthorizationURL({
    // The name of the client you chose when you created it on the
    // Instant dashboard
    clientName: "google-web",
    redirectURL: window.location.href,
  });

  return <a href={authUrl}>Log in</a>;
}

function App() {
  const { isLoading, user, error } = db.useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Uh oh! {error.message}</div>;
  }
  if (user) {
    console.log("user", user);
    return <Main user={user} />;
  }

  return <Login />;
}

export default App;
