import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const Detail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleBack = () => navigate("/");

  return (
    <div>
      <h3>#{id}(으)로 라우팅되었습니다.</h3>
      <button onClick={handleBack}>뒤로가기</button>
    </div>
  );
};

export default Detail;
