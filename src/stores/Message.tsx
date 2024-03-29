// @ts-nocheck

import { message } from "antd";
import { makeAutoObservable } from "mobx";

export type ContactType = {
  qq: string;
  userName: string;
  lastDate: number;
  unreadCount: number;
  userImg: string;
  isTemporarily?: boolean;
};

type MessageType = {
  qq: string;
  messageList: {
    targetQQ: string;
    fromQQ: string;
    messageContent: string;
    lastDate: string;
  }[];
};
type SystemMessageType = {
  notification: string;
  from: string;
  pageId: string;
  fromQQ: string;
  lastDate: string;
};
export class Message {
  // 联系人
  contactPerson: ContactType[] = [
    {
      qq: "admin",
      userName: "通知",
      lastDate: +new Date(),
      unreadCount: 0,
      userImg: `${import.meta.env.VITE_BASE_URL}/systemImgs/notification.png`,
    },
  ];

  messageList: MessageType[] = [];

  systemMessageList: SystemMessageType[] = [];

  currentChatUser: ContactType = {
    qq: "admin",
    userName: "通知",
    lastDate: +new Date(),
    unreadCount: 0,
    userImg: `${import.meta.env.VITE}/systemImgs/notification.png`,
  };

  unreadAllCount = 0;

  constructor() {
    makeAutoObservable(this);
  }

  // 添加联系人
  addConversation(data: ContactType) {
    // 判断当前是否已经存在消息列表中
    if (this.contactPerson.findIndex((item) => item.qq === data.qq) < 0) {
      // 不存在则添加到其中
      this.contactPerson.push(data);
      this.messageList.push({
        qq: data.qq,
        messageList: [],
      });
    }
    this.setCurrentUserId(data.qq);
  }

  // 切换当前活动的联系人
  setCurrentUserId(userId: string) {
    // this.currentUserId = userId;
    this.currentChatUser = this.contactPerson.find(
      (item) => item.qq === userId
    )!;

    this.contactPerson.forEach((item) => {
      if (item.qq === userId) {
        this.unreadAllCount -= item.unreadCount;
        item.unreadCount = 0;
      }
    });
  }

  // 添加新信息
  addNewMessage(msg: string, lastDate: string, fromQQ: string) {
    // 添加信息
    this.messageList
      .find((item) => item.qq === this.currentChatUser.qq)
      ?.messageList.push({
        messageContent: msg,
        lastDate,
        fromQQ,
        targetQQ: this.currentChatUser.qq,
      });
    // 更新当前联系人的最后发送时间
    this.contactPerson.find(
      (item) => item.qq === this.currentChatUser.qq
    )!.lastDate = Number(lastDate);
    // 更新联系人的顺序
    this.updateContactPersonListSort();
  }

  // 接受到新消息
  addMessage({
    fromQQ,
    targetQQ,
    messageContent,
    lastDate,
  }: {
    targetQQ: string;
    fromQQ: string;
    messageContent: string;
    lastDate: string;
  }) {
    // 在消息页
    this.messageList
      .find((item) => item.qq === fromQQ)!
      .messageList.push({
        targetQQ,
        fromQQ,
        messageContent,
        lastDate,
      });
  }

  // 接收到新消息
  receiveSendMessage(fromQQ: any, data: any, currentUserQQ: string) {
    // 判断来消息的人是否存在于当前联系人列表钟
    if (this.contactPerson.findIndex((item) => item.qq === fromQQ) < 0) {
      message.addConversation({ qq: fromQQ, ...data, unreadCount: 1 });
    }

    // 必须要做的操作
    const sender = this.contactPerson.find((item) => item.qq === fromQQ);
    sender.lastDate = data.lastDate;
    this.addMessage({
      targetQQ: currentUserQQ,
      fromQQ,
      messageContent: data.content,
      lastDate: data.lastDate,
    });

    // 根据当前出在哪个页面，分别进行处理
    if (location.pathname.includes("message")) {
      if (this.currentChatUser.qq === fromQQ) {
        // 收到的消息是否在当前对话
        PubSub.publish("receiveMessage");
      } else {
        sender.unreadCount += 1;
      }
    } else {
      message.success("收到了一条新消息");
      sender.unreadCount += 1;
    }
    this.updateUnreadAllCount();
  }

  // 更新总的未读条数
  updateUnreadAllCount() {
    this.unreadAllCount = this.contactPerson.reduce(
      (pre, cur) => pre + cur.unreadCount,
      0
    );
    // 重新计算顺序
    const [admin, ...lastItem] = this.contactPerson;
    this.contactPerson = [
      admin,
      ...lastItem.sort((a, b) => Number(b.lastDate) - Number(a.lastDate)),
    ];
  }

  // 当发送消息，切换会话都可能会造成排序更改
  updateContactPersonListSort() {
    this.contactPerson = this.contactPerson.slice().sort((a, b) => {
      // 如果 a 是 "admin"，则 a 在 b 前面
      if (a.qq === "admin") {
        return -1;
      }
      // 如果 b 是 "admin"，则 b 在 a 前面
      if (b.qq === "admin") {
        return 1;
      }
      // 如果 unreadCount 不为 0，则 a 在 b 前面
      if (a.unreadCount !== 0 && b.unreadCount === 0) {
        return -1;
      }
      // 如果 unreadCount 为 0，则 b 在 a 前面
      if (a.unreadCount === 0 && b.unreadCount !== 0) {
        return 1;
      }
      // 如果 unreadCount 相同，按照 lastDate 排序
      return b.lastDate - a.lastDate;
    });
  }

  // 对消息进行排序，最新的消息在最下面
  // updateMessageListSort() {
  //   this.messageList = this.messageList
  //     .slice()
  //     .sort((a, b) => Number(a.messageList) - Number(b.lastDate));
  // }

  // 获取当前活动对话的MessageList
  getCurrentMessageList() {
    return this.messageList.find((item) => item.qq === this.currentChatUser.qq)
      ?.messageList;
  }
}
