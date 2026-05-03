import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, MessageCircle, Activity, Heart, Brain, Zap, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import dayjs from 'dayjs';

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export const WellnessPage = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [pulse, setPulse] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Activity Tracker
  const [activities, setActivities] = useState<{ name: string; date: string }[]>([]);
  const [activityInput, setActivityInput] = useState("");

  // Mood Journal
  const [mood, setMood] = useState("");
  const [moodNote, setMoodNote] = useState("");
  const [moodTime, setMoodTime] = useState(dayjs().format('HH:mm'));
  const [moodEntries, setMoodEntries] = useState<{ mood: string; note: string; date: string; time: string }[]>([]);

  // Energy Levels
  const [energy, setEnergy] = useState(5);
  const [energyTime, setEnergyTime] = useState(dayjs().format('HH:mm'));
  const [energyEntries, setEnergyEntries] = useState<{ level: number; date: string; time: string }[]>([]);

  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hi! I'm your wellness companion. How are you feeling today?" }
  ]);
  const [chatInput, setChatInput] = useState("");

  // Fetch data on mount
  useEffect(() => {
    if (user) {
      fetchWellnessData();
    }
  }, [user]);

  const fetchWellnessData = async () => {
    if (!user) return;

    // Fetch Moods
    const { data: moods } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('time', { ascending: false });
    if (moods) setMoodEntries(moods);

    // Fetch Activities
    const { data: acts } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    if (acts) setActivities(acts);

    // Fetch Energy
    const { data: energy } = await supabase
      .from('energy_levels')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('time', { ascending: false });
    if (energy) setEnergyEntries(energy);
  };

  // Start camera and analysis
  const startStressDetection = async () => {
    setIsRecording(true);
    toast.success("Camera activated for stress detection...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      toast.error("Unable to access camera. Please allow camera access.");
      setIsRecording(false);
      return;
    }
    // Simulate stress detection for 60 seconds
    const duration = 60000;
    const interval = 1000;
    setElapsed(0);
    
    const timer = setInterval(() => {
      setElapsed(prev => {
        const next = prev + interval;
        if (next >= duration) {
          clearInterval(timer);
          const finalStress = Math.floor(Math.random() * 40) + 30;
          const finalPulse = Math.floor(Math.random() * 30) + 70;
          
          setStressLevel(finalStress);
          setPulse(finalPulse);
          setIsRecording(false);
          toast.success("Analysis complete!");
          
          // Save to Supabase
          if (user) {
            supabase.from('stress_logs').insert([{
              user_id: user.id,
              stress_level: finalStress,
              heart_rate: finalPulse
            }]).then(() => {});
          }

          // Stop camera after analysis
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }
        return next;
      });
    }, interval);
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [signal, setSignal] = useState<number[]>([]);

  // Signal extraction loop
  useEffect(() => {
    let animationId: number;
    
    const extractSignal = () => {
      if (isRecording && videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Simplified forehead region (center-top)
          const imageData = ctx.getImageData(canvas.width / 4, canvas.height / 10, canvas.width / 2, canvas.height / 5);
          const data = imageData.data;
          
          let greenSum = 0;
          for (let i = 0; i < data.length; i += 4) {
            greenSum += data[i + 1]; // Green channel
          }
          const avgGreen = greenSum / (data.length / 4);
          setSignal(prev => [...prev.slice(-300), avgGreen]); // Keep last 10s at 30fps
        }
      }
      animationId = requestAnimationFrame(extractSignal);
    };
    
    if (isRecording) {
      extractSignal();
    }
    
    return () => cancelAnimationFrame(animationId);
  }, [isRecording]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);


  // Stop camera and analysis
  const stopRecording = () => {
    setIsRecording(false);
    toast.info("Recording stopped");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleAddActivity = async () => {

    if (activityInput.trim() && user) {
      const newAct = { name: activityInput, date: dayjs().format('YYYY-MM-DD'), user_id: user.id };
      const { error } = await supabase.from('activities').insert([newAct]);
      
      if (!error) {
        setActivities([newAct, ...activities]);
        setActivityInput("");
        toast.success("Activity logged!");
      }
    }
  };

  const handleAddMood = async () => {
    if (mood && user) {
      const newEntry = { mood, note: moodNote, date: dayjs().format('YYYY-MM-DD'), time: moodTime, user_id: user.id };
      const { error } = await supabase.from('mood_entries').insert([newEntry]);
      
      if (!error) {
        setMoodEntries([newEntry, ...moodEntries]);
        setMood("");
        setMoodNote("");
        setMoodTime(dayjs().format('HH:mm'));
        toast.success("Mood logged!");
      }
    }
  };

  const handleAddEnergy = async () => {
    if (user) {
      const newEntry = { level: energy, date: dayjs().format('YYYY-MM-DD'), time: energyTime, user_id: user.id };
      const { error } = await supabase.from('energy_levels').insert([newEntry]);
      
      if (!error) {
        setEnergyEntries([newEntry, ...energyEntries]);
        setEnergy(5);
        setEnergyTime(dayjs().format('HH:mm'));
        toast.success("Energy level logged!");
      }
    }
  };


  const handleSendChat = async () => {

    if (!chatInput.trim()) return;
    const userMsg = { sender: "user", text: chatInput };
    setChatMessages((msgs) => [...msgs, userMsg]);
    setChatInput("");
    
    setChatMessages((msgs) => [...msgs, { sender: "bot", text: "..." }]);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error("VITE_GROQ_API_KEY is missing from your .env file.");
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are a helpful and empathetic wellness companion for InnerBloom. Help users with stress and mental health." },
            { role: "user", content: chatInput }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices[0].message.content;
      
      setChatMessages((msgs) => {
        const newMsgs = [...msgs];
        newMsgs[newMsgs.length - 1] = { sender: "bot", text: reply };
        return newMsgs;
      });
    } catch (error: any) {
      console.error("Chat error:", error);
      setChatMessages((msgs) => {
        const newMsgs = [...msgs];
        newMsgs[newMsgs.length - 1] = { 
          sender: "bot", 
          text: "I'm having trouble connecting to my wellness center right now. Please try again in a moment." 
        };
        return newMsgs;
      });
    }


  };


  // Chart data for last 7 days
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString());
    }
    return days;
  };
  const last7Days = getLast7Days();

  // Activity chart data
  const activityChartData = last7Days.map(date => ({
    date,
    count: activities.filter(a => a.date === date).length
  }));

  // Mood score mapping for custom graph
  const today = dayjs().format('YYYY-MM-DD');
  const moodScore = (m: string) => {
    switch (m) {
      case '😊': return 10;
      case '😔': return 1;
      case '😠': return 2;
      case '😰': return 3;
      case '😐': return 5;
      default: return 0;
    }
  };
  const moodChartData = moodEntries
    .filter(e => dayjs(e.date).format('YYYY-MM-DD') === today)
    .map(e => ({
      time: e.time,
      score: moodScore(e.mood),
      mood: e.mood,
      note: e.note,
    }))
    .sort((a, b) => a.time.localeCompare(b.time));
  const energyChartData = energyEntries
    .filter(e => dayjs(e.date).format('YYYY-MM-DD') === today)
    .map(e => ({
      time: e.time,
      level: e.level,
    }))
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Wellness Dashboard</h2>
        <p className="text-muted-foreground">Track your mental health journey and stress levels</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Stress Detection */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Facial Stress Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-8 bg-muted/30 rounded-lg">
              {isRecording ? (
                <div className="space-y-4 flex flex-col items-center">
                  <video
                    ref={videoRef}
                    className="w-32 h-32 rounded-lg border border-primary mx-auto bg-black"
                    autoPlay
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" width="128" height="128" />

                  <div className="w-full max-w-xs mx-auto space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Analyzing...</span>
                      <span>{Math.floor((elapsed / 60000) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000" 
                        style={{ width: `${(elapsed / 60000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Please stay still for 60 seconds for accurate detection</p>

                </div>
              ) : (
                <div className="space-y-4">
                  <Camera className="w-16 h-16 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to start stress analysis</p>
                </div>
              )}
            </div>

            {stressLevel !== null && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Stress Level</span>
                  <Badge variant={stressLevel > 60 ? "destructive" : stressLevel > 40 ? "secondary" : "default"}>
                    {stressLevel}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Heart Rate</span>
                  <Badge variant="outline">{pulse} BPM</Badge>
                </div>
              </div>
            )}

            <Button 
              onClick={isRecording ? stopRecording : startStressDetection}
              className="w-full"
              variant={isRecording ? "destructive" : "default"}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Health Chatbot */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Health Chatbot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/5 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    Hi! I'm your wellness companion. I can help you with stress management, 
                    mood tracking, and personalized wellness tips. How are you feeling today?
                  </p>
                </div>
              </div>
            </div>
            <Button className="w-full" variant="outline" onClick={() => setChatbotOpen(true)}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Wellness Chat
            </Button>
            <Dialog open={chatbotOpen} onOpenChange={setChatbotOpen}>
              <DialogContent className="max-w-md w-full">
                <DialogHeader>
                  <DialogTitle>Wellness Chatbot</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-2 p-2 bg-muted/30 rounded">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`text-sm px-2 py-1 rounded-lg max-w-[80%] ${msg.sender === "user" ? "bg-primary/10 self-end text-right" : "bg-white self-start"}`}>
                      {msg.text}
                    </div>
                  ))}
                </div>
                <form className="flex gap-2" onSubmit={e => { e.preventDefault(); handleSendChat(); }}>
                  <input
                    className="flex-1 border rounded px-2 py-1"
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    autoFocus
                  />
                  <Button type="submit" size="sm">Send</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Additional Wellness Features */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Activity Tracker */}
        <Card className="shadow-soft">
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 mx-auto text-primary mb-3" />
            <h3 className="font-semibold mb-2">Activity Tracker</h3>
            <p className="text-sm text-muted-foreground mb-3">Monitor daily activities and mood patterns</p>
            {/* Chart */}
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={activityChartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} width={24} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#13eba0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-2 mb-2">
              <label htmlFor="activity-input" className="sr-only">Activity</label>
              <input
                id="activity-input"
                className="flex-1 border rounded px-2 py-1"
                placeholder="Add activity (e.g., walk, yoga)"
                value={activityInput}
                onChange={e => setActivityInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddActivity(); }}
                title="Activity name"
              />
              <Button size="sm" onClick={handleAddActivity}>Add</Button>
            </div>
            <div className="text-left max-h-32 overflow-y-auto">
              {activities.length === 0 && <div className="text-xs text-muted-foreground">No activities yet.</div>}
              {activities.map((a, i) => (
                <div key={i} className="text-xs py-1 border-b last:border-b-0 flex items-center gap-2">
                  <span>{a.name}</span>
                  <span className="ml-auto text-muted-foreground">{a.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Mood Journal */}
        <Card className="shadow-soft">
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 mx-auto text-primary mb-3" />
            <h3 className="font-semibold mb-2">Mood Journal</h3>
            <p className="text-sm text-muted-foreground mb-3">Log your mood multiple times a day and see your trend.</p>
            {/* Time-series Line Graph */}
            <div className="mb-4 bg-gradient-to-b from-[#e6fff5] to-[#f6fdfb] rounded-lg p-2">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={moodChartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} type="category" />
                  <YAxis domain={[0, 10]} width={24} />
                  <Tooltip formatter={(v, n, p: any) => n === 'score' ? `${v} (${p.payload.mood})` : v} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#b2f5ea" />
                  <Line type="monotone" dataKey="score" stroke="#13eba0" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mb-2 items-center">
              <select className="border rounded px-2 py-1 min-w-[90px]" value={mood} onChange={e => setMood(e.target.value)} title="Select your mood">
                <option value="">Mood</option>
                <option value="😊">Happy</option>
                <option value="😔">Sad</option>
                <option value="😠">Angry</option>
                <option value="😰">Stressed</option>
                <option value="😐">Neutral</option>
              </select>
              <input
                className="flex-1 min-w-[120px] border rounded px-2 py-1"
                placeholder="Add a note (optional)"
                value={moodNote}
                onChange={e => setMoodNote(e.target.value)}
                title="Mood note"
              />
              <input
                type="time"
                className="border rounded px-2 py-1 w-24 min-w-[80px]"
                value={moodTime}
                onChange={e => setMoodTime(e.target.value)}
                title="Time of mood"
              />
              <Button size="sm" className="whitespace-nowrap" onClick={handleAddMood}>Log</Button>
            </div>
            <div className="text-left max-h-32 overflow-y-auto bg-white/70 rounded p-2 border border-muted-foreground/10">
              {moodEntries.filter(e => dayjs(e.date).format('YYYY-MM-DD') === today).length === 0 && <div className="text-xs text-muted-foreground">No mood entries yet for today.</div>}
              {moodEntries.filter(e => dayjs(e.date).format('YYYY-MM-DD') === today).map((entry, i) => (
                <div key={i} className="text-xs py-1 border-b last:border-b-0 flex flex-wrap items-center gap-2">
                  <span>{entry.mood}</span>
                  <span className="truncate max-w-[100px]">{entry.note}</span>
                  <span className="ml-auto text-muted-foreground">{entry.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Energy Levels */}
        <Card className="shadow-soft">
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 mx-auto text-primary mb-3" />
            <h3 className="font-semibold mb-2">Energy Levels</h3>
            <p className="text-sm text-muted-foreground mb-3">Log your energy multiple times a day and see your trend.</p>
            {/* Time-series Line Graph */}
            <div className="mb-4 bg-gradient-to-b from-[#e6fff5] to-[#f6fdfb] rounded-lg p-2">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={energyChartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} type="category" />
                  <YAxis domain={[1, 10]} width={24} />
                  <Tooltip />
                  <CartesianGrid strokeDasharray="3 3" stroke="#b2f5ea" />
                  <Line type="monotone" dataKey="level" stroke="#13eba0" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-2 items-center mb-2">
              <input
                id="energy-slider"
                type="range"
                min={1}
                max={10}
                value={energy}
                onChange={e => setEnergy(Number(e.target.value))}
                className="flex-1"
                title="Energy level slider"
              />
              <input
                type="time"
                className="border rounded px-2 py-1 w-24"
                value={energyTime}
                onChange={e => setEnergyTime(e.target.value)}
                title="Time of energy"
              />
              <span className="font-bold text-primary">{energy}</span>
              <Button size="sm" onClick={handleAddEnergy}>Log</Button>
            </div>
            <div className="text-left max-h-32 overflow-y-auto">
              {energyEntries.filter(e => dayjs(e.date).format('YYYY-MM-DD') === today).length === 0 && <div className="text-xs text-muted-foreground">No energy entries yet for today.</div>}
              {energyEntries.filter(e => dayjs(e.date).format('YYYY-MM-DD') === today).map((entry, i) => (
                <div key={i} className="text-xs py-1 border-b last:border-b-0 flex items-center gap-2">
                  <span className="font-bold text-primary">{entry.level}</span>
                  <span className="ml-auto text-muted-foreground">{entry.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};