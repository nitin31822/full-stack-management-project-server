import {Redis} from "ioRedis"
import { Server } from "socket.io"
import { ITask,  IMessage  } from "./socket"

type RecievedData = IMessage | ITask

class RedisService {
    private io:Server
    private pub:Redis
    private sub:Redis
    private subscribedChannels: Set<string>;

    constructor(io:Server){
        this.io= io
        this.pub = new Redis()
        this.sub = new Redis()
        this.subscribedChannels = new Set();
    };

    public async publishToRoom(roomName:string,Message:IMessage): Promise<void> {
              await this.pub.publish(roomName,JSON.stringify(Message) ,(err , result)=>{
                if (err) {
                    console.log(`error while publish to channel ${roomName}  `);   
                    return err
                }
                else {
                    console.log(`publish to channel ${roomName} and the message is ${Message}`);   
                }})
    }

    public async publishTaskToRoom(roomName:string,Task:ITask){
        await this.pub.publish(roomName,JSON.stringify(Task),(err , result)=>{
            if (err) {
                console.log(`error while publish to channel ${roomName}  `);   
                return err
            }
            else {
                console.log(`publish to channel ${roomName} and the task is ${Task}`);   
            }})
    }

    public async subscribeToRoom(roomName:string): Promise<void>{

        if (this.subscribedChannels.has(roomName)) {
            console.log(`Already subscribed to Redis channel: ${roomName}`);
            return;
          }

        await this.sub.subscribe(roomName,(err , result)=>{
            if (err) {
                console.log(`error while subscribe to channel ${roomName} `);   
                return err
            }
            else {
                console.log(`subscribe to channel ${roomName}`);   
                this.subscribedChannels.add(roomName);
            }})


            this.sub.on("message",(channel:string,Message:string)=>{
                if (channel===roomName) {
                    const parsedData : RecievedData   = JSON.parse(Message)
                    console.log("parsed item" , parsedData);

                  
                    this.io.to(roomName).emit("RecivedMessage" , parsedData )
                    
                    
                   
                    
                }
            })

            
    }

   
get pubLisher(){
    return this.pub
}
get subscribe(){
    return this.sub
}
}
export{RedisService}