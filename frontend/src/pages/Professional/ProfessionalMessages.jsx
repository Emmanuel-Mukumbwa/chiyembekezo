import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, ListGroup, Spinner, Badge } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Button, Input, EmptyState } from '../../components/ui';

const ProfessionalMessages = () => {
  const { showModal } = useModal();
  const [conversations, setConversations] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (selectedPatient) fetchMessages(selectedPatient.user_id);
  }, [selectedPatient]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/professional/messages/conversations');
      setConversations(res.data);
      if (res.data.length > 0) setSelectedPatient(res.data[0]);
    } catch (err) {
      showModal('Error', 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (patientId) => {
    try {
      const res = await api.get(`/professional/messages/patient/${patientId}`);
      setMessages(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load messages.');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedPatient) return;
    setSending(true);
    try {
      await api.post('/professional/messages', {
        patientId: selectedPatient.user_id,
        content: messageText,
      });
      setMessageText('');
      await fetchMessages(selectedPatient.user_id);
      fetchConversations();
    } catch (err) {
      showModal('Error', 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;

  return (
    <Container fluid className="px-4">
      <h4>Messages</h4>
      <Row>
        {/* Conversation list – collapses on mobile to horizontal scroll */}
        <Col xs={12} md={4} className="mb-3 mb-md-0">
          <Card className="p-2">
            <h6>Conversations</h6>
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <ListGroup variant="flush">
                {conversations.length === 0 ? (
                  <ListGroup.Item>No conversations</ListGroup.Item>
                ) : (
                  conversations.map(c => (
                    <ListGroup.Item
                      key={c.user_id}
                      action
                      active={selectedPatient?.user_id === c.user_id}
                      onClick={() => setSelectedPatient(c)}
                    >
                      <strong>{c.first_name} {c.last_name}</strong>
                      <div className="small text-muted">{c.last_message?.substring(0, 30)}...</div>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card className="p-3" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            {selectedPatient ? (
              <>
                <h6>Chat with {selectedPatient.first_name} {selectedPatient.last_name}</h6>
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
                  {messages.map((m, idx) => (
                    <div key={idx} className={`mb-2 ${m.sender_id === selectedPatient.user_id ? 'text-start' : 'text-end'}`}>
                      <span className={`badge ${m.sender_id === selectedPatient.user_id ? 'bg-secondary' : 'bg-primary'}`}>
                        {m.content}
                      </span>
                      <div className="small text-muted">{new Date(m.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} className="d-flex">
                  <Input
                    name="message"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="flex-grow-1"
                  />
                  <Button variant="primary" type="submit" disabled={sending} className="ms-2">
                    {sending ? 'Sending...' : 'Send'}
                  </Button>
                </form>
              </>
            ) : (
              <p className="text-muted">Select a conversation to start chatting.</p>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfessionalMessages;
