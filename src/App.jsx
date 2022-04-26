import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import "./App.css";
import { database } from "./firebase";
import ChatRoom from "./components/ChatRoom";

const me = {
  id: "", // 약국 id
  email: "skdisk7368@naver.com",
};

const App = () => {
  const [room, setRoom] = useState([]);
  const [users, setUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);

  const getUserData = async () => {
    const result = [];

    const snapshot = await getDocs(collection(database, "User"));
    snapshot.forEach((doc) => {
      // console.log(doc.id, " => ", doc.data());
      result.push(doc.data());
    });

    setUsers(result.filter((user) => user.id !== me.id));
  };

  const handleSendToPharmacy = async () => {
    const roomId = "AZe4IiNCOkeazzDZiMdv";
    let messageId = null;

    const response = await addDoc(collection(database, `Chat/${roomId}/messages`), {
      to: me.id,
      from: "", // 앱 유저 id
      createdAt: serverTimestamp(),
      text: "소비자로부터 왔습니다",
    });

    messageId = response.id;

    Promise.all([
      updateDoc(doc(database, `Chat/${roomId}/messages`, messageId), {
        id: messageId,
      }),
      updateDoc(doc(database, `Chat/${roomId}`), { pharmacyUnreadCount: increment(1) }),
    ])
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleUserClick = (selectedUser) => async () => {
    const q = query(
      collection(database, "Chat"),
      where("pharmacyId", "==", me.id),
      where("customerId", "==", selectedUser.id)
    );
    const snapshot = await getDocs(q);
    const { empty: isEmpty } = snapshot;

    if (!isEmpty) {
      setRoom({ ...snapshot.docs[0].data() });
    } else {
      // 채팅방 생성
      let chatId = null;

      try {
        const newRoomData = await addDoc(collection(database, "Chat"), {
          pharmacyId: me.id,
          customerId: selectedUser.id,
          pharmacyUnreadCount: 0,
          customerUnreadCount: 0,
        });

        chatId = newRoomData.id;

        await updateDoc(doc(database, `Chat/${chatId}`), {
          id: chatId,
        });

        const result = await getDoc(doc(database, newRoomData.path));

        setRoom({ ...result.data() });
      } catch (err) {
        console.error(err);
        await deleteDoc(doc(database, `Chat/${chatId}`));
      }
    }
  };

  const handleChatRoomClick = (selectedRoom) => async () => {
    setRoom({ ...room, ...selectedRoom });
  };

  useEffect(() => {
    getUserData();

    const q = query(collection(database, "Chat"), where("pharmacyId", "==", me.id));
    const unsubscribe = onSnapshot(q, (doc) => {
      const arr = doc.docs.map((d) => d.data());

      doc.docChanges().forEach((change) => {
        console.log(change.type);
        if (change.type === "added") {
          console.log("New Message: ", change.doc.data());
        }
        if (change.type === "modified") {
          console.log("메세지 도착!!");
        }
      });
      setChatRooms([...arr]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div>
      <button onClick={handleSendToPharmacy}>채팅 전송</button>
      <div className="userlist">
        <h1>유저 목록</h1>
        {users.map((user) => (
          <h4 key={user.id} onClick={handleUserClick(user)}>
            {user.email}
          </h4>
        ))}
      </div>
      <div className="chatlist">
        <h1>채팅방 목록</h1>
        {chatRooms.map((room, index) => (
          <div key={index} onClick={handleChatRoomClick(room)}>
            {room.customerId} {room.pharmacyUnreadCount}
          </div>
        ))}
      </div>

      {room.id && <ChatRoom room={room} />}
    </div>
  );
};

export default App;
