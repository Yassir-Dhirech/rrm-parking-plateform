import { useState, useEffect } from "react";
import { Drawer, List, Input, Button, Avatar, Tag, Space, Typography, Badge, message as antMessage } from "antd";
import { SendOutlined, MessageOutlined, LinkOutlined, CheckOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getConversationsMock, getMessagesForConversationMock, envoyerMessageMock } from "../../api/messagingMock";
import { useAuth } from "../../context/AuthContext";
import type { ConversationThread } from "../../features/messaging/types";

const { Text } = Typography;

interface MessagerieDrawerProps {
  open: boolean;
  onClose: () => void;
  initialEntityRef?: { type: "DEMANDE" | "RECETTE" | "ABONNEMENT" | "PAIEMENT"; reference: string; link: string };
}

export function MessagerieDrawer({ open, onClose, initialEntityRef }: MessagerieDrawerProps) {
  const { role, userName } = useAuth();
  const queryClient = useQueryClient();
  const [selectedThread, setSelectedThread] = useState<ConversationThread | null>(null);
  const [inputMessage, setInputMessage] = useState("");

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversationsMock,
    enabled: open,
  });

  useEffect(() => {
    if (conversations.length > 0 && !selectedThread) {
      setSelectedThread(conversations[0]);
    }
  }, [conversations, selectedThread]);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedThread?.id],
    queryFn: () => getMessagesForConversationMock(selectedThread?.id || "conv-agent-1"),
    enabled: !!selectedThread?.id && open,
  });

  const sendMutation = useMutation({
    mutationFn: (msg: string) =>
      envoyerMessageMock({
        conversationId: selectedThread?.id,
        destinataireId: selectedThread?.contact.id,
        expediteurRole: role || "AGENT",
        expediteurNom: userName || "Agent Guichet",
        contenu: msg,
        referenceEntite: initialEntityRef,
      }),
    onSuccess: () => {
      setInputMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedThread?.id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      antMessage.success("Message envoyé à l'intervenant !");
    },
  });

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    sendMutation.mutate(inputMessage);
  };

  return (
    <Drawer
      title={
        <Space>
          <MessageOutlined style={{ color: "#0284c7" }} />
          <span>Messagerie Interne & Collaboration RRM</span>
        </Space>
      }
      width={720}
      open={open}
      onClose={onClose}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ display: "flex", height: "100%" }}>
        {/* Left Side: Threads List */}
        <div style={{ width: 260, borderRight: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
          <div style={{ padding: 12, fontWeight: 600, color: "#475569", fontSize: 12, borderBottom: "1px solid #e2e8f0" }}>
            CONVERSATIONS ÉQUIPE ({conversations.length})
          </div>
          <List
            dataSource={conversations}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  backgroundColor: selectedThread?.id === item.id ? "#e0f2fe" : "transparent",
                  borderLeft: selectedThread?.id === item.id ? "4px solid #0284c7" : "none",
                }}
                onClick={() => setSelectedThread(item)}
              >
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text strong style={{ fontSize: 13 }}>{item.contact.nom}</Text>
                    {item.nonLus > 0 && <Badge count={item.nonLus} style={{ backgroundColor: "#0284c7" }} />}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{item.contact.roleLibelle}</div>
                  <div style={{ fontSize: 12, color: "#475569", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: 4 }}>
                    {item.dernierMessage}
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>

        {/* Right Side: Active Chat Window */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#ffffff" }}>
          {selectedThread ? (
            <>
              {/* Header */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#fafafa" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Space>
                    <Avatar style={{ backgroundColor: selectedThread.contact.avatarColor }}>
                      {selectedThread.contact.nom.charAt(0)}
                    </Avatar>
                    <div>
                      <Text strong style={{ display: "block" }}>{selectedThread.contact.nom}</Text>
                      <Tag color="blue" style={{ fontSize: 11 }}>{selectedThread.contact.roleLibelle}</Tag>
                    </div>
                  </Space>
                  <Tag color="green"><CheckOutlined /> En Ligne</Tag>
                </div>

                {initialEntityRef && (
                  <Tag color="purple" style={{ marginTop: 8 }}>
                    <LinkOutlined style={{ marginRight: 4 }} /> Réf. {initialEntityRef.type} : {initialEntityRef.reference}
                  </Tag>
                )}
              </div>

              {/* Message History */}
              <div style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.map((msg) => {
                  const isMe = msg.expediteurRole === role;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: isMe ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                      }}
                    >
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2, textAlign: isMe ? "right" : "left" }}>
                        {msg.expediteurNom} • {msg.timestamp}
                      </div>
                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                          backgroundColor: isMe ? "#0284c7" : "#f1f5f9",
                          color: isMe ? "#ffffff" : "#1e293b",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        }}
                      >
                        {msg.contenu}
                        {msg.referenceEntite && (
                          <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.3)", fontSize: 11 }}>
                            📌 Réf {msg.referenceEntite.type} : <strong>{msg.referenceEntite.reference}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Footer */}
              <div style={{ padding: 12, borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Tapez votre message ou question à l'intervenant..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onPressEnter={handleSend}
                  />
                  <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={sendMutation.isPending}>
                    Envoyer
                  </Button>
                </Space.Compact>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#94a3b8" }}>
              Sélectionnez un interlocuteur pour démarrer l'échange
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
