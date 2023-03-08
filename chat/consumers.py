# chat/consumers.py
import json

from channels.generic.websocket import WebsocketConsumer

aaa = []


class listnode:
    def __init__(self, socket, username):
        self.socket = socket
        self.username = username
        self.next = None
        self.prev = None

    def haveNext(self):
        return self.next != None


class mylist:
    def __init__(self):
        self.head = listnode(None, None)
        self.end = listnode(None, None)
        self.head.next = self.end
        self.end.prev = self.head
        self.current = self.head

    def add(self, data):
        data.prev = self.end.prev
        data.next = self.end
        self.end.prev.next = data
        self.end.prev = data

    def remove(self, data):
        current = self.head
        while current.next != self.end:
            current = current.next
            if current.socket == data:
                cp = current.prev
                cn = current.next
                cp.next = cn
                cn.prev = cp

    def userlist(self):
        userlist = []
        current = self.head
        while current.next != self.end:
            current = current.next
            userlist.append(current.username)
        return userlist

    def sendtoall(self, data):
        current = self.head
        while current.next != self.end:
            current = current.next
            current.socket.send(data)


mlist = mylist()


class ChatConsumer(WebsocketConsumer):

    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        print(self)
        mlist.remove(self)
        mlist.sendtoall(json.dumps(
            {"type": "login", "list": mlist.userlist()}))
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if text_data_json['type'] == "login":
            newnode = listnode(self, text_data_json['username'])
            mlist.add(newnode)
            mlist.sendtoall(json.dumps(
                {"type": "login", "list": mlist.userlist()}))

        elif text_data_json['type'] == "message":
            if text_data_json['to'] == "all":
                mlist.sendtoall(json.dumps(text_data_json))
            else:
                current = mlist.head.next
                while current.next != None:
                    if current.username == text_data_json['to']:
                        current.socket.send(json.dumps(text_data_json))
                    current = current.next
                self.send(json.dumps(text_data_json))
