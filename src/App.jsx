import React from "react";
import { Button } from "@oj-onjourney/ymyd-atomic";

const App = () => {
  return (
    <div>
      <Button
        size={"Medium"}
        type={"IconWithText"}
        variant={"Contained"}
        color={"Primary"}
        left
        icon={"Plus"}
        onClick={() => {}}
      >
        Text
      </Button>
    </div>
  );
};

export default App;
