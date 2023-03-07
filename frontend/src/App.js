import React, { Component, useEffect, useRef, useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Button, Container, Card, Form, InputGroup, Row, Col } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css';


export default function App() {
  const [chatinfo, setchatinfo] = useState()
  const [open, setopen] = useState(false)
  const [socket, setsocket] = useState()
  const [chat, setchat] = useState([])
  const [count, setcount] = useState(0);
  const [userlist, setuserlist] = useState(['all']);
  var u = useRef(null);
  var r = useRef(null);
  var s = useRef(null);
  var l = useRef(null)

  var submitchat = (event) => {
    event.preventDefault();
    var info = {
      username: u.current.value,
      room: r.current.value
    }
    setchatinfo(info);
  }

  useEffect(() => {
    if (chatinfo) {
      var ws = new W3CWebSocket('ws://127.0.0.1:8000/ws/chat/' + chatinfo.room + '/');
      ws.onopen = () => {
        console.log("WebSocket Client Connected");
        ws.send(
          JSON.stringify({
            type: "login",
            username: chatinfo.username,
          })
        )
      };


      setsocket(ws);
    }
  }, [chatinfo])



  useEffect(() => {
    if (socket) {
      if (!open) {
        socket.onmessage = (message) => {
          console.log(message)
          const dataFromServer = JSON.parse(message.data);

          setcount(count + 1)
          if (dataFromServer) {
            if (dataFromServer.type === 'message') {
              dataFromServer.key = dataFromServer.sender + count + Math.random();
              chat.push(dataFromServer)
              setchat([...chat])
            } else if (dataFromServer.type === 'login') {
              var list = ['all'];
              var users = dataFromServer.list
              for (var i = 0; i < users.length; i++) {
                list.push(users[i]);
              }
              setuserlist(list);
              console.log(list);
            }

          }
        };
        setopen(true)
      }

    }
  }, [socket])

  useEffect(() => {

  }, [open])

  useEffect(() => {
    setcount(count + 1)
  }, [chat])

  return !open ? (
    <Container style={{ height: '100%' }}>
      <Row className='justify-content-center align-items-center' style={{ height: '100%' }}>
        <Col lg={4}>
          <Card>
            <Card.Header>
              set up chat
            </Card.Header>
            <Card.Body>
              <Form id='chat' onSubmit={submitchat}>
                <Row>
                  <Col>
                    <InputGroup className="mb-3">
                      <Form.Control
                        ref={u}
                        placeholder="Enter username"
                        aria-label="Enter username"
                        aria-describedby="basic-addon2"
                        required
                      />
                      {/* <Button variant="outline-secondary" id="button-addon2">
                      Button
                    </Button> */}
                    </InputGroup>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <InputGroup className="mb-3">
                      <Form.Control
                        ref={r}
                        placeholder="Enter roomname"
                        aria-label="Enter roomname"
                        aria-describedby="basic-addon2"
                        required
                      />
                      {/* <Button variant="outline-secondary" id="button-addon3">
                      Button
                    </Button> */}
                    </InputGroup>
                  </Col>
                </Row>
              </Form>

            </Card.Body>
            <Card.Footer>
              <Row style={{ float: 'right' }}>
                <Col>
                  <Button type='submit' form='chat'>
                    submit
                  </Button>
                </Col>
              </Row>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

    </Container>
  ) : (
    <Container>
      <Card>
        <Card.Header>
          <Row>
            <Col>
              {chatinfo.username + ' in ' + chatinfo.room}
            </Col>
            <Col>
              <Form.Select ref={l}>
                {userlist.map(val => {
                  return <option key={val} value={val}>{val}</option>
                })}
              </Form.Select>
            </Col>
          </Row>

        </Card.Header>
        <Card.Body>
          {chat.map(val => {
            return <Row key={val.key} >
              <Col style={{ textAlign: val.sender === chatinfo.username ? 'right' : 'left' }}>
                {val.sender + ' to ' + val.to + ' : ' + val.text}
              </Col>
            </Row>
          })}
        </Card.Body>
        <Card.Footer>
          <Row>
            <Col>
              <Form.Control ref={s} type='input' />
            </Col>
            <Col>
              <Button onClick={() => {
                socket.send(
                  JSON.stringify({
                    type: "message",
                    text: s.current.value,
                    sender: chatinfo.username,
                    to: l.current.value
                  })
                );
              }}>send</Button>
            </Col>
          </Row>
        </Card.Footer>
      </Card>
    </Container>
  )
}



