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
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const redis_1 = require("./redis");
class SocketService {
    constructor() {
        this._io = new socket_io_1.Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*",
            },
        });
        this.redisPubSub = new redis_1.RedisService(this.io);
        console.log("init Socket Server...");
    }
    initializeSocketEvents() {
        const io = this.io;
        io.on("connect", (socket) => {
            console.log(`New Socket connected ${socket.id}`);
            socket.on("joinRoom", (roomName, callback) => __awaiter(this, void 0, void 0, function* () {
                yield this.joinRoom(socket, roomName);
                callback({
                    status: true,
                });
            }));
            socket.on("sendtask", (roomName, task, callback) => __awaiter(this, void 0, void 0, function* () {
                yield this.redisPubSub.publishTaskToRoom(roomName, task);
                callback({
                    status: true,
                });
            }));
            socket.on("sendMessage", (roomName, message, callback) => __awaiter(this, void 0, void 0, function* () {
                const res = yield this.publish(roomName, message);
                callback({
                    status: res,
                });
            }));
        });
        console.log("InIt Socket Listners");
    }
    joinRoom(socket, roomName) {
        return __awaiter(this, void 0, void 0, function* () {
            socket.join(roomName);
            yield this.redisPubSub.subscribeToRoom(roomName);
            this.io.to(roomName).emit("userjoined", `new SocketID emit ${socket.id}`);
            console.log("with custom hook");
            // this.io.to(roomName).emit("userJoined" , socket.id , roomName)
            console.log(` socketid is  ${socket.id} joined room: ${roomName}`);
        });
    }
    publish(roomName, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.redisPubSub.publishToRoom(roomName, message);
            return res;
        });
    }
    get io() {
        return this._io;
    }
}
exports.SocketService = SocketService;
