import React, { useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { database } from "../firebase";
import { useEffect } from "react";
import { useRef } from "react";

const ChatRoom = ({ room }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const boxRef = useRef();

  const handleMessage = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!message) return;

    setMessage("");
    const { id: roomId, pharmacyId, customerId } = room;
    let messageId = null;

    try {
      // chat 에 message 추가
      const response = await addDoc(collection(database, `Chat/${roomId}/messages`), {
        to: customerId,
        from: pharmacyId,
        createdAt: serverTimestamp(),
        text: message,
      });

      messageId = response.id;

      const lastMessage = await getDoc(doc(database, `Chat/${roomId}/massages/${messageId}`));

      const batch = writeBatch(database);

      Promise.all([
        updateDoc(doc(database, `Chat/${roomId}/messages`, messageId), {
          id: messageId,
        }),
        batch.update(doc(database, `Chat/${roomId}`), {
          customerUnreadCount: increment(1),
          lastMessage: lastMessage.ref,
          lastMessageAt: serverTimestamp(),
        }),
      ])
        .then((result) => {
          console.log(result);
          batch.commit();
        })
        .catch(async (err) => {
          console.error(err);
          await deleteDoc(doc(database, `Chat/${roomId}/messages/${messageId}`));
        });
    } catch (err) {
      console.error(err);
      await deleteDoc(doc(database, `Chat/${roomId}/messages/${messageId}`));
    }
  };

  useEffect(() => {
    const q = query(collection(database, `Chat/${room.id}/messages`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const arr = snapshot.docs.map((d) => d.data());

      updateDoc(doc(database, `Chat/${room.id}`), {
        pharmacyUnreadCount: 0,
      });

      setMessages([...arr]);

      snapshot.docChanges().forEach((change) => {
        console.log(change.type, change.doc.data());
        if (change.type === "added") {
          console.log("New Message: ", change.doc.data());
          boxRef.current.scrollTop = boxRef.current.scrollHeight;
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [room]);

  return (
    <>
      <h1>채팅방</h1>
      <div className="chat-box" ref={boxRef}>
        <p>
          To: <b>{room.customerId}</b>
        </p>
        <div>
          {messages.map((message, index) => (
            <div style={{ textAlign: message.from === room.pharmacyId ? "right" : "left" }}>
              <p
                key={index}
                style={{
                  padding: "10px",
                  backgroundColor: "white",
                  width: "100px",
                  height: "70px",
                  display: "inline-block",
                  marginRight: "15px",
                  marginLeft: "15px",
                }}
              >
                {message.text}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="textbox">
        <textarea cols="30" rows="10" value={message} onChange={handleMessage}></textarea>
        <button onClick={handleSendMessage}>전송</button>
      </div>
    </>
  );
};

export default ChatRoom;
