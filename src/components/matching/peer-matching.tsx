import { useState } from "react";
import { Heart, MessageCircle, Calendar, MapPin, Star, Filter, Search, Users, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface Peer {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  age: number;
  location: string;
  interests: string[];
  challenges: string[];
  matchScore: number;
  bio: string;
  onlineStatus: "online" | "away" | "offline";
  responseTime: string;
}

interface ChatMessage {
  sender: string;
  text: string;
}

const samplePeers: Peer[] = [
  {
    id: "1",
    name: "Jamie Thompson",
    avatar: "",
    initials: "JT",
    age: 24,
    location: "Seattle, WA",
    interests: ["Reading", "Hiking", "Mindfulness"],
    challenges: ["Anxiety", "Social situations"],
    matchScore: 95,
    bio: "Recently started therapy and looking for supportive peers to share the journey with. Love outdoor activities and finding peace in nature.",
    onlineStatus: "online",
    responseTime: "Usually responds within 2 hours"
  },
  {
    id: "2",
    name: "Alex Chen",
    avatar: "",
    initials: "AC",
    age: 28,
    location: "Austin, TX",
    interests: ["Art therapy", "Music", "Cooking"],
    challenges: ["Depression", "Creative blocks"],
    matchScore: 89,
    bio: "Artist working through creative challenges and mental health. Believe in the healing power of creativity and community support.",
    onlineStatus: "away",
    responseTime: "Usually responds within 4 hours"
  },
  {
    id: "3",
    name: "Morgan Rivera",
    avatar: "",
    initials: "MR",
    age: 22,
    location: "Portland, OR",
    interests: ["Yoga", "Journaling", "Plant care"],
    challenges: ["Social anxiety", "Self-esteem"],
    matchScore: 87,
    bio: "Finding strength through mindfulness practices. Looking for understanding peers to share experiences and grow together.",
    onlineStatus: "online",
    responseTime: "Usually responds within 1 hour"
  }
];

export function PeerMatching({ onConnect }: { onConnect?: () => void }) {
  const [peers] = useState<Peer[]>(samplePeers);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);
  const [connectedPeerId, setConnectedPeerId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{[peerId: string]: ChatMessage[]}>({});
  const [chatInput, setChatInput] = useState("");
  const [search, setSearch] = useState("");

  const getStatusColor = (status: Peer["onlineStatus"]) => {
    switch (status) {
      case "online": return "bg-success";
      case "away": return "bg-warning";
      case "offline": return "bg-muted-foreground";
    }
  };

  const handleConnect = (peerId: string) => {
    setConnectedPeerId(peerId);
    if (onConnect) onConnect();
    setTimeout(() => setConnectedPeerId(null), 2000);
  };

  const handleOpenChat = (peerId: string) => {
    setShowChat(true);
    if (!chatMessages[peerId]) {
      setChatMessages({ ...chatMessages, [peerId]: [] });
    }
  };

  const handleSendMessage = (peerId: string) => {
    if (!chatInput.trim()) return;
    setChatMessages({
      ...chatMessages,
      [peerId]: [...(chatMessages[peerId] || []), { sender: "You", text: chatInput }]
    });
    setChatInput("");
  };

  const filteredPeers = peers.filter(peer => {
    const q = search.toLowerCase();
    return (
      peer.name.toLowerCase().includes(q) ||
      peer.interests.some(i => i.toLowerCase().includes(q)) ||
      peer.challenges.some(c => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Find Your Support Network</h2>
          <p className="text-muted-foreground">Connect with peers who understand your journey</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search interests..." className="pl-10 w-64" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peer List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredPeers.map((peer) => (
            <Card 
              key={peer.id} 
              className={`shadow-soft cursor-pointer transition-smooth hover:shadow-glow ${
                selectedPeer?.id === peer.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPeer(peer)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={peer.avatar} />
                        <AvatarFallback className="bg-gradient-wellness text-wellness-foreground">
                          {peer.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(peer.onlineStatus)}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{peer.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground space-x-2">
                        <span>{peer.age} years old</span>
                        <span>•</span>
                        <MapPin className="w-3 h-3" />
                        <span>{peer.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-semibold text-primary">{peer.matchScore}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-relaxed">{peer.bio}</p>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Shared Interests</p>
                    <div className="flex flex-wrap gap-1">
                      {peer.interests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Similar Challenges</p>
                    <div className="flex flex-wrap gap-1">
                      {peer.challenges.map((challenge) => (
                        <Badge key={challenge} className="text-xs bg-wellness text-wellness-foreground">
                          {challenge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">{peer.responseTime}</p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); handleConnect(peer.id); }}>
                      <Heart className="w-4 h-4 mr-1" />
                      Connect
                    </Button>
                    <Button size="sm" onClick={e => { e.stopPropagation(); handleOpenChat(peer.id); }}>
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </div>
                {connectedPeerId === peer.id && (
                  <div className="mt-2 text-green-600 text-sm">You have connected with this user.</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed View */}
        <div className="space-y-4">
          {selectedPeer ? (
            <Card className="shadow-soft sticky top-20">
              <CardHeader>
                <div className="text-center space-y-4">
                  <div className="relative mx-auto w-20 h-20">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={selectedPeer.avatar} />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                        {selectedPeer.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-background ${getStatusColor(selectedPeer.onlineStatus)}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedPeer.name}</h3>
                    <p className="text-muted-foreground">{selectedPeer.age} years old • {selectedPeer.location}</p>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="w-5 h-5 fill-primary text-primary" />
                    <span className="text-lg font-bold text-primary">{selectedPeer.matchScore}% Match</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <p className="text-sm leading-relaxed">{selectedPeer.bio}</p>
                <Separator />
                <div className="space-y-3">
                  <Button className="w-full shadow-glow" onClick={() => handleOpenChat(selectedPeer.id)}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Conversation
                  </Button>
                  <div className="w-full text-center py-2 rounded border mt-2">
                    {connectedPeerId === selectedPeer.id ? (
                      <span className="text-green-600 font-medium">You are connected to this user.</span>
                    ) : (
                      <span className="text-muted-foreground">You are not connected to this user.</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  {selectedPeer.responseTime}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-soft">
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a peer to view their profile</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {/* Chat Modal */}
      {showChat && selectedPeer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button className="absolute top-2 right-2 text-muted-foreground" onClick={() => setShowChat(false)} title="Close chat">
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedPeer.avatar} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                  {selectedPeer.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-lg text-primary">{selectedPeer.name}</div>
                <div className="text-xs text-muted-foreground">Chat</div>
              </div>
            </div>
            <div className="h-64 overflow-y-auto border rounded p-3 mb-3 bg-muted/20">
              {(chatMessages[selectedPeer.id] || []).length === 0 && (
                <div className="text-muted-foreground text-sm text-center mt-20">No messages yet. Say hello!</div>
              )}
              {(chatMessages[selectedPeer.id] || []).map((msg, idx) => (
                <div key={idx} className={`mb-2 flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
                  <div className={`px-3 py-2 rounded-lg max-w-[70%] ${msg.sender === "You" ? "bg-primary text-white" : "bg-white border"}`}>
                    <span className="text-sm">{msg.text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(selectedPeer.id); }}
              />
              <Button onClick={() => handleSendMessage(selectedPeer.id)} disabled={!chatInput.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}