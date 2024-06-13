import { Server, Socket } from "socket.io";
import { RedisService } from "./redis";

interface Companies {
  sokcetRoomName: string;
  createdAt: Date;
  name: string;
  email: string | null;
  id: string;
  avatar: string | null
  headline: string | null
}

interface user {
  createdAt: Date;
  name: string;
  email: string | null;
  id: string;
  avatar: string | null;
  headline: string | null;
}

export interface ITask {
  Company : Companies 
  title : string
  sender : user
  content : string
  createdAt : Date
  isCompleted : boolean
}

export interface IMessage {
  content: string,
  sender: user ,
  createdAt : Date
}


class SocketService {
  private _io: Server;
  private redisPubSub: RedisService;
  constructor() {
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });

    this.redisPubSub = new RedisService(this.io);
    console.log("init Socket Server...");
  }

  public initializeSocketEvents() {
    const io = this.io;

    io.on("connect", (socket: Socket) => {
      console.log(`New Socket connected ${socket.id}`);

      socket.on("joinRoom", async (roomName: string, callback: Function) => {
        await this.joinRoom(socket, roomName);
        callback({
          status: true,
        });
      });

      socket.on(
        "sendtask",
        async (roomName: string, task: ITask, callback: Function) => {
          await this.redisPubSub.publishTaskToRoom(roomName, task);
          callback({
            status: true,
          });
        }
      );

      socket.on(
        "sendMessage",
        async (roomName: string, message: IMessage, callback: Function) => {
          const res = await this.publish(roomName, message);

          callback({
            status: res,
          });
        }
      );

      
    });

    console.log("InIt Socket Listners");
  }

  private async joinRoom(socket: Socket, roomName: string): Promise<void> {
    socket.join(roomName);
    await this.redisPubSub.subscribeToRoom(roomName);

    this.io.to(roomName).emit("userjoined", `new SocketID emit ${socket.id}`);

    console.log("with custom hook");

    // this.io.to(roomName).emit("userJoined" , socket.id , roomName)
    console.log(` socketid is  ${socket.id} joined room: ${roomName}`);
  }

  private async publish(roomName: string, message: IMessage) {
    const res = await this.redisPubSub.publishToRoom(roomName, message);
    return res;
  }

  get io() {
    return this._io;
  }
}

export { SocketService };
