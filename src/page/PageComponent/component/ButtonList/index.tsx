import { useState } from "react";
import {
  CommentOutlined,
  FrownOutlined,
  SmileOutlined,
  VerticalAlignTopOutlined,
} from "@ant-design/icons";
import { FloatButton } from "antd";
import "./index.less";
import Comment from "../Comment";

export default function ButtonList() {
  const [isShowComment, setIsShowComment] = useState<boolean>(false);
  return (
    <>
      <FloatButton.Group
        className=" flex flex-col items-start"
        style={{ right: "15%" }}
        type="primary"
      >
        {location.pathname === "/page" && (
          <>
            <FloatButton
              icon={<CommentOutlined />}
              className="icon-button"
              tooltip={<span>评论</span>}
              badge={{ count: 5, color: "#282c34" }}
              onClick={() => setIsShowComment(true)}
            />
            <FloatButton
              icon={<SmileOutlined />}
              className="icon-button"
              tooltip={<span>顶</span>}
              badge={{ count: 5, color: "blue" }}
            />
            <FloatButton
              icon={<FrownOutlined />}
              className="icon-button"
              tooltip={<span>踩</span>}
              badge={{ count: 5, color: "red" }}
            />
          </>
        )}
        <FloatButton.BackTop
          icon={<VerticalAlignTopOutlined />}
          visibilityHeight={400}
          target={() => document.querySelector(".container-snow") as any}
          className="icon-button"
          tooltip={<span>回到顶部</span>}
        />
      </FloatButton.Group>
      <Comment
        isShowComment={isShowComment}
        setIsShowComment={setIsShowComment}
      />
    </>
  );
}