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
import { database, storage } from "../firebase";
import { useEffect } from "react";
import { useRef } from "react";
import { useCallback } from "react";
import { ref, uploadBytes, uploadBytesResumable } from "firebase/storage";

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
      const response = await addDoc(collection(database, `Chat/${roomId}/Messages`), {
        toId: customerId,
        fromId: pharmacyId,
        createdAt: serverTimestamp(),
        text: message,
      });

      messageId = response.id;

      const lastMessage = await getDoc(doc(database, `Chat/${roomId}/Messages/${messageId}`));
      const batch = writeBatch(database);

      Promise.all([
        updateDoc(doc(database, `Chat/${roomId}/Messages`, messageId), {
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
          await deleteDoc(doc(database, `Chat/${roomId}/Messages/${messageId}`));
        });
    } catch (err) {
      console.error(err);
      await deleteDoc(doc(database, `Chat/${roomId}/Messages/${messageId}`));
    }
  };

  useEffect(() => {
    const q = query(collection(database, `Chat/${room.id}/Messages`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const arr = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));

      console.log(arr);

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
  const [items, setItems] = useState([
    99,
    99,
    "qwrwegyrhkertohbopertgl,wegebmermbropegre ertj weriotjk pworqwerwewrwerkweoprkweop owerqwerowekorpkwe ",
    "qweqwewqewqeqweqweqwewqewqeqweqweqwewqewqeqweqweqwewqewqeqweqweqwewqewqeqwe",
    "qweqwewqewqeqweqweqwewqewqeqweqweqwewqewqeqweqweqwewqewqeqweqweqwewqewqeqwe",
    "qweqwewqewqeqweqweqwewqewqeqweqweqwewqewqeqweqweqwewqewqeqweqweqwewqewqeqwe",
    "qweqwewqewqeqweqweqwewqewqeqweqweqwewqewqeqweqweqwewqewqeqweqweqwewqewqeqwe",
  ]);
  const [target, setTarget] = useState(null);
  const [file, setFile] = useState(null);
  const prevScrollHeight = useRef(0);

  const getMoreItem = async () => {
    setIsLoaded(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    // setItems((items) => [...arr, ...items]);
    setIsLoaded(false);
  };

  const onIntersect = async ([entry], observer) => {
    console.log(entry.isIntersecting, observer);
    console.log(boxRef.current.scrollHeight, prevScrollHeight.current, boxRef.current.offsetHeight);
    if (entry.isIntersecting && !isLoaded && boxRef.current.scrollHeight > boxRef.current.offsetHeight) {
      console.log("감지!");
      observer.unobserve(entry.target);
      await getMoreItem();
      observer.observe(entry.target);
    }
  };

  useEffect(() => {
    if (target) {
      const observer = new IntersectionObserver(onIntersect, {
        threshold: 1,
        root: boxRef.current,
        rootMargin: `0px 0px 0px 0px`,
      });

      observer.observe(target);
    }
  }, [target]);

  useEffect(() => {
    boxRef.current.scrollTop = boxRef.current.scrollHeight - prevScrollHeight.current;
    prevScrollHeight.current = boxRef.current.scrollHeight;
    console.log(items);
  }, [items]);

  const handleUploadFile = async (e) => {
    const [file] = e.target.files;

    if (file) {
      console.log(file);
      console.log(new FileReader());

      const uploadTask = uploadBytesResumable(ref(storage, `Chat/${file.name}`), file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          console.log(snapshot);
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${Math.floor(progress)}% done`);
        },
        (error) => {
          console.error(error);
        },
        () => {
          console.log("전송 완료");
        }
      );
    }
  };

  return (
    <>
      <h1>채팅방 ({room.customerId})</h1>
      <div className="chat-box" ref={boxRef}>
        {/* <p style={{ position: "sticky", top: "0", backgroundColor: "orange", margin: "0", height: "50px" }}>
          To: <b>{room.customerId}</b>
        </p> */}
        <div style={{}} ref={setTarget}></div>
        <div>
          {messages.map((message) => (
            <div style={{ textAlign: message.fromId === room.pharmacyId ? "right" : "left" }}>
              <p
                key={message.id}
                style={{
                  // padding: "10px",
                  backgroundColor: "white",
                  width: "250px",
                  height: "250px",
                  display: "inline-block",
                  marginRight: "15px",
                  marginLeft: "15px",
                }}
              >
                <img
                  src={message.imageURL}
                  alt=""
                  style={{ width: "100%", height: "100%", cursor: "zoom-in" }}
                  onClick={() => {
                    window.open(message.imageURL, "__blank");
                  }}
                />
                {/* {message.text} */}
              </p>
            </div>
          ))}
          {/* {items.map((item, index) => (
            <div>
              <pre
                key={index}
                style={{
                  padding: "10px",
                  backgroundColor: "white",
                  width: "100px",
                  // height: "70px",
                  display: "inline-block",
                  marginRight: "15px",
                  marginLeft: "15px",
                  whiteSpace: "break-spaces",
                  wordBreak: "break-all",
                }}
              >
                {item}
              </pre>
            </div>
          ))} */}
        </div>
      </div>
      <div className="textbox">
        <textarea cols="30" rows="10" value={message} onChange={handleMessage}></textarea>
        <button onClick={handleSendMessage}>전송</button>
        <label
          htmlFor="input-file"
          style={{
            padding: "5px 25px",
            color: "white",
            backgroundColor: "blue",
            display: "inline",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          첨부파일
        </label>
        <input type="file" id="input-file" style={{ display: "none" }} onChange={handleUploadFile} />
      </div>
    </>
  );
};

export default ChatRoom;
