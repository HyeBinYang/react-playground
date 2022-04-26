import React from "react";
import { useNavigate } from "react-router-dom";

const Item = ({ id }) => {
  const navigate = useNavigate();

  const handleRouting = (id) => () => {
    navigate(`/detail/${id}`);
    localStorage.setItem("scroll_pos", document.documentElement.scrollTop);
  };

  return (
    <div className="item" onClick={handleRouting(id)}>
      <img src={`https://picsum.photos/200/300?random=${id}`} alt="" />
    </div>
  );
};

export default React.memo(Item);
