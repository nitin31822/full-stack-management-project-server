"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const ioRedis_1 = require("ioRedis");
class RedisService {
    constructor(io) {
        this.io = io;
        this.pub = new ioRedis_1.Redis();
        this.sub = new ioRedis_1.Redis();
        this.subscribedChannels = new Set();
    }
    ;
    publishToRoom(roomName, Message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pub.publish(roomName, JSON.stringify(Message), (err, result) => {
                if (err) {
                    console.log(`error while publish to channel ${roomName}  `);
                    return err;
                }
                else {
                    console.log(`publish to channel ${roomName} and the message is ${Message}`);
                }
            });
        });
    }
    publishTaskToRoom(roomName, Task) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pub.publish(roomName, JSON.stringify(Task), (err, result) => {
                if (err) {
                    console.log(`error while publish to channel ${roomName}  `);
                    return err;
                }
                else {
                    console.log(`publish to channel ${roomName} and the task is ${Task}`);
                }
            });
        });
    }
    subscribeToRoom(roomName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.subscribedChannels.has(roomName)) {
                console.log(`Already subscribed to Redis channel: ${roomName}`);
                return;
            }
            yield this.sub.subscribe(roomName, (err, result) => {
                if (err) {
                    console.log(`error while subscribe to channel ${roomName} `);
                    return err;
                }
                else {
                    console.log(`subscribe to channel ${roomName}`);
                    this.subscribedChannels.add(roomName);
                }
            });
            this.sub.on("message", (channel, Message) => {
                if (channel === roomName) {
                    const parsedData = JSON.parse(Message);
                    console.log("parsed item", parsedData);
                    this.io.to(roomName).emit("RecivedMessage", parsedData);
                }
            });
        });
    }
    get pubLisher() {
        return this.pub;
    }
    get subscribe() {
        return this.sub;
    }
}
exports.RedisService = RedisService;
