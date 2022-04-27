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
import { useCallback } from "react";

const ChatRoom = ({ room }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const boxRef = useRef();

  const handleMessage = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!message) return;

    const { id: roomId, pharmacyId, customerId } = room;
    let messageId = null;

    setMessage("");

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

  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState(Array.from({ length: 10 }));
  const [target, setTarget] = useState(null);
  const prevScrollHeight = useRef(0);

  const getMoreItem = async () => {
    setIsLoaded(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const arr = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    setItems((items) => [...arr, ...items]);
    setIsLoaded(false);
  };

  const onIntersect = async ([entry], observer) => {
    console.log(entry.isIntersecting, observer);
    if (entry.isIntersecting && !isLoaded) {
      console.log("감지!");
      observer.unobserve(entry.target);
      await getMoreItem();
      // boxRef.current.scrollTop = boxRef.current.scrollHeight - prevScrollHeight;
      observer.observe(entry.target);
    }
  };

  useEffect(() => {
    if (target) {
      console.log("we");
      const observer = new IntersectionObserver(onIntersect, {
        threshold: 0.3,
        root: boxRef.current,
        rootMargin: `${boxRef.current.scrollHeight / 2}px 0px 0px 0px`,
      });

      observer.observe(target);
    }
  }, [target]);

  useEffect(() => {
    boxRef.current.scrollTop = boxRef.current.scrollHeight - prevScrollHeight.current;
    prevScrollHeight.current = boxRef.current.scrollHeight;
    console.log(items);
  }, [items]);

  return (
    <>
      <h1>채팅방</h1>
      <div className="chat-box" ref={boxRef}>
        <p style={{ position: "sticky", top: "0", backgroundColor: "orange", margin: "0", height: "50px" }}>
          To: <b>{room.customerId}</b>
        </p>
        <div style={{}} ref={setTarget}></div>
        <div>
          {/* {messages.map((message) => (
            <div style={{ textAlign: message.from === room.pharmacyId ? "right" : "left" }}>
              <p
                key={message.id}
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
          ))} */}
          {items.map((item, index) => (
            <div>
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
                text
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
