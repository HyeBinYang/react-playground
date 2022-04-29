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
  id: "DmAxwnayMTMjTWH5sVNun5db3ls2",
  // id: "4R95r5NS0YbWaw12z3E4Zyuw5aI3", // 약국 id
  email: "skdisk7368@naver.com",
};

const App = () => {
  const [room, setRoom] = useState({});
  const [users, setUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);

  const getUserData = async () => {
    const result = [];
    const snapshot = await getDocs(collection(database, "User"));

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        // console.log(doc.id, " => ", doc.data());
        result.push(doc.data());
      });

      setUsers(result.filter((user) => user.id !== me.id));
    }
  };

  const handleSendToPharmacy = async () => {
    const roomId = "AZe4IiNCOkeazzDZiMdv";
    const response = await addDoc(collection(database, `Chat/${roomId}/Messages`), {
      toId: me.id,
      fromId: "lIKS4CULl1M5S3f1Fi7WRi1FDoG2", // 앱 유저 id
      createdAt: serverTimestamp(),
      text: "소비자로부터 왔습니다",
    });
    let messageId = response.id;

    Promise.all([
      updateDoc(doc(database, `Chat/${roomId}/Messages`, messageId), {
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

    if (snapshot.empty) {
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

        updateDoc(doc(database, `Chat/${chatId}`), {
          id: chatId,
        });

        const result = await getDoc(doc(database, newRoomData.path));

        setRoom({ ...result.data() });
      } catch (err) {
        console.error(err);
        await deleteDoc(doc(database, `Chat/${chatId}`));
      }
    } else {
      setRoom({ ...snapshot.docs[0].data() });
    }
  };

  const handleChatRoomClick = (selectedRoom) => async () => {
    console.log(selectedRoom);
    setRoom({ ...room, ...selectedRoom });
  };

  useEffect(() => {
    getUserData();

    const q = query(collection(database, "Chat"), where("pharmacyId", "==", me.id));
    const unsubscribe = onSnapshot(q, (doc) => {
      const arr = doc.docs.map((d) => d.data());

      doc.docChanges().forEach((change) => {
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
      <button onClick={handleSendToPharmacy}>To 약국</button>
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
            {room.id} {room.pharmacyUnreadCount}
          </div>
        ))}
      </div>

      {room.id && <ChatRoom room={room} />}
    </div>
  );
};

export default App;
