import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Users, UserPlus, Copy, Check, UserMinus, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import { useFriends } from "@/hooks/useFriends";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Social = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [friendCodeInput, setFriendCodeInput] = useState("");
  const [copied, setCopied] = useState(false);
  const {
    friends,
    pendingRequests,
    myFriendCode,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend
  } = useFriends();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
    };
    checkAuth();
  }, [navigate]);

  const copyFriendCode = async () => {
    if (myFriendCode) {
      await navigator.clipboard.writeText(myFriendCode);
      setCopied(true);
      toast({
        title: "Code copié",
        description: "Ton code ami a été copié dans le presse-papier"
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendRequest = async () => {
    if (!friendCodeInput.trim()) return;
    const success = await sendFriendRequest(friendCodeInput.trim());
    if (success) {
      setFriendCodeInput("");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
      {/* Header */}
      <header className="glass-strong border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Social</h1>
              <p className="text-xs text-muted-foreground">{friends.length} ami(s)</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/premium')}
              className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
            >
              <Crown className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* My Friend Code */}
        <Card className="glass-strong border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Copy className="w-4 h-4 text-primary" />
              </div>
              Mon code ami
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-background/50 rounded-xl px-4 py-3 font-mono text-lg tracking-widest text-center border border-white/10">
                {myFriendCode || "..."}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyFriendCode}
                className="h-12 w-12 rounded-xl border-white/10"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Partage ce code avec tes amis pour qu'ils puissent t'ajouter
            </p>
          </CardContent>
        </Card>

        {/* Add Friend */}
        <Card className="glass-strong border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-green-500" />
              </div>
              Ajouter un ami
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Entre le code ami"
                value={friendCodeInput}
                onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())}
                className="flex-1 bg-background/50 border-white/10 font-mono tracking-wider"
                maxLength={8}
              />
              <Button 
                onClick={handleSendRequest}
                disabled={!friendCodeInput.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card className="glass-strong border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-500" />
                </div>
                Demandes en attente
                <Badge variant="secondary" className="ml-auto bg-amber-500/20 text-amber-400">
                  {pendingRequests.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingRequests.map((request) => (
                <div 
                  key={request.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-white/5"
                >
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={request.profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {request.profile?.full_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {request.profile?.full_name || "Utilisateur"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Veut devenir ton ami
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => rejectFriendRequest(request.id)}
                      className="h-8 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      Refuser
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => acceptFriendRequest(request.id)}
                      className="h-8 px-3 bg-primary hover:bg-primary/90"
                    >
                      Accepter
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Friends List */}
        <Card className="glass-strong border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              Mes amis
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-auto bg-blue-500/20 text-blue-400">
                  {friends.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Chargement...
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm mb-2">
                  Tu n'as pas encore d'amis
                </p>
                <p className="text-xs text-muted-foreground">
                  Partage ton code ami ou ajoute quelqu'un avec son code
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {friends.map((friend) => (
                  <div 
                    key={friend.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-white/5 group hover:bg-background/70 transition-colors"
                  >
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={friend.profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {friend.profile?.full_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {friend.profile?.full_name || "Utilisateur"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        #{friend.profile?.friend_code}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFriend(friend.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Groups Coming Soon */}
        <Card className="glass-strong border-white/10 opacity-60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Groupes</p>
                <p className="text-xs text-muted-foreground">Bientôt disponible</p>
              </div>
              <Badge variant="outline" className="text-xs">
                Soon
              </Badge>
            </div>
          </CardContent>
        </Card>
      </main>

      <Navigation />
    </div>
  );
};

export default Social;
