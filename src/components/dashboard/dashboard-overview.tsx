import { Activity, Users, Calendar, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function DashboardOverview({ peerConnections = 12 }: { peerConnections?: number }) {
  const stats = [
    {
      title: "Peer Connections",
      value: String(peerConnections),
      icon: Users,
      description: "Active supportive relationships",
      gradient: "bg-gradient-wellness"
    },
    {
      title: "Weekly Check-ins",
      value: "5/7",
      icon: Activity,
      description: "Wellness tracking streak",
      gradient: "bg-gradient-primary"
    },
    {
      title: "Group Activities",
      value: "3",
      icon: Calendar,
      description: "Upcoming community events",
      gradient: "bg-accent"
    },
    {
      title: "Support Messages",
      value: "28",
      icon: MessageCircle,
      description: "Encouraging interactions this week",
      gradient: "bg-gradient-soft"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-soft hover:shadow-glow transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.gradient}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Wellness Journey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mood Tracking</span>
                <span>6/7 days</span>
              </div>
              <Progress value={86} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Peer Interactions</span>
                <span>12 conversations</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Community Participation</span>
                <span>3 activities</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Today's Wellness Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-gradient-wellness text-wellness-foreground">
              <p className="text-sm font-medium">🌸 Mindful Breathing</p>
              <p className="text-xs mt-1">Take 5 deep breaths to center yourself</p>
            </div>
            <div className="p-3 rounded-lg bg-accent text-accent-foreground">
              <p className="text-sm font-medium">🤝 Connect with a Peer</p>
              <p className="text-xs mt-1">Reach out to someone in your support network</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-primary text-primary-foreground">
              <p className="text-sm font-medium">📝 Journal Prompt</p>
              <p className="text-xs mt-1">What's one thing you're grateful for today?</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}