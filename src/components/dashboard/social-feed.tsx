import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Comment {
  author: string;
  text: string;
}

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    initials: string;
  };
  content: string;
  tags: string[];
  likes: number;
  comments: Comment[];
  timeAgo: string;
  liked: boolean;
}

const samplePosts: Post[] = [
  {
    id: "1",
    author: { name: "Sarah Chen", avatar: "", initials: "SC" },
    content: "Today marks 3 months since I started therapy. It's been challenging but I'm learning to be kinder to myself. Small wins matter. 💚",
    tags: ["therapy", "progress", "self-care"],
    likes: 24,
    comments: [
      { author: "Alex", text: "Proud of you!" },
      { author: "Maya", text: "Keep going!" }
    ],
    timeAgo: "2h",
    liked: false
  },
  {
    id: "2", 
    author: { name: "Alex Rivera", avatar: "", initials: "AR" },
    content: "Anyone else struggle with Sunday anxiety? Looking for coping strategies that have worked for you. We're all in this together. 🌱",
    tags: ["anxiety", "coping", "community"],
    likes: 31,
    comments: [
      { author: "Sarah", text: "Deep breathing helps me." }
    ],
    timeAgo: "4h",
    liked: true
  },
  {
    id: "3",
    author: { name: "Maya Patel", avatar: "", initials: "MP" },
    content: "Grateful for this community. Your support helped me through a tough week. Sometimes just knowing others understand makes all the difference.",
    tags: ["gratitude", "community", "support"],
    likes: 45,
    comments: [],
    timeAgo: "6h",
    liked: false
  }
];

export function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [newPost, setNewPost] = useState("");
  const [showComments, setShowComments] = useState<{[postId: string]: boolean}>({});
  const [commentInputs, setCommentInputs] = useState<{[postId: string]: string}>({});

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handlePost = () => {
    if (newPost.trim()) {
      const post: Post = {
        id: Date.now().toString(),
        author: { name: "You", avatar: "", initials: "YU" },
        content: newPost,
        tags: [],
        likes: 0,
        comments: [],
        timeAgo: "now",
        liked: false
      };
      setPosts([post, ...posts]);
      setNewPost("");
    }
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, { author: "You", text }] }
        : post
    ));
    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  return (
    <div className="space-y-6">
      {/* New Post Card */}
      <Card className="shadow-soft">
        <CardHeader>
          <h3 className="text-lg font-semibold">Share Your Journey</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="How are you feeling today? Share your thoughts, progress, or ask for support..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Your post will be shared anonymously with supportive peers
            </p>
            <Button 
              onClick={handlePost}
              disabled={!newPost.trim()}
              className="shadow-glow"
            >
              <Send className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="shadow-soft hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback className="bg-gradient-wellness text-wellness-foreground">
                      {post.author.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{post.author.name}</p>
                    <p className="text-sm text-muted-foreground">{post.timeAgo} ago</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground leading-relaxed">{post.content}</p>
              
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={post.liked ? "text-primary" : ""}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${post.liked ? "fill-current" : ""}`} />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}>
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {post.comments.length}
                  </Button>
                </div>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="mt-4 space-y-2">
                  <div className="space-y-1">
                    {post.comments.length === 0 && <div className="text-sm text-muted-foreground">No comments yet.</div>}
                    {post.comments.map((comment, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <span className="font-medium text-primary">{comment.author}:</span>
                        <span>{comment.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Textarea
                      value={commentInputs[post.id] || ""}
                      onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      placeholder="Add a comment..."
                      className="min-h-[36px] resize-none"
                    />
                    <Button size="sm" onClick={() => handleAddComment(post.id)} disabled={!(commentInputs[post.id]?.trim())}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}