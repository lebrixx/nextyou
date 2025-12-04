import { useState, useEffect } from "react";
import { Users, UserPlus, Bell, Crown, Plus, Copy, Check, Send, Trophy, Target, Flame, MessageCircle, Eye, Calendar, TrendingUp, Award, Heart, Zap, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  friend_code: string | null;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  owner_id: string;
  member_count?: number;
}

interface Friend {
  id: string;
  profile: Profile;
  status: string;
}

interface GroupMember {
  id: string;
  name: string;
  avatar: string | null;
  streak: number;
  completedToday: number;
  totalHabits: number;
  isOnline: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'group' | 'friend';
  targetId: string;
  targetName: string;
  startDate: string;
  endDate: string;
  progress: number;
  participants: number;
  isActive: boolean;
}

interface Notification {
  id: string;
  type: 'motivation' | 'challenge' | 'achievement' | 'group_invite';
  message: string;
  senderName: string;
  senderAvatar: string | null;
  timestamp: string;
  isRead: boolean;
}

// Données de démonstration enrichies
const mockFriends: (Friend & { 
  streak: number; 
  completedToday: number; 
  totalHabits: number;
  weeklyProgress: number;
  lastActive: string;
  achievements: number;
})[] = [
  {
    id: 'demo-1',
    profile: { id: 'demo-user-1', full_name: 'Marie Dupont', avatar_url: null, friend_code: 'MARIE123' },
    status: 'accepted',
    streak: 15,
    completedToday: 4,
    totalHabits: 5,
    weeklyProgress: 85,
    lastActive: 'En ligne',
    achievements: 12
  },
  {
    id: 'demo-2',
    profile: { id: 'demo-user-2', full_name: 'Thomas Martin', avatar_url: null, friend_code: 'THOM456' },
    status: 'accepted',
    streak: 7,
    completedToday: 2,
    totalHabits: 4,
    weeklyProgress: 60,
    lastActive: 'Il y a 2h',
    achievements: 8
  },
  {
    id: 'demo-3',
    profile: { id: 'demo-user-3', full_name: 'Sophie Bernard', avatar_url: null, friend_code: 'SOPH789' },
    status: 'accepted',
    streak: 23,
    completedToday: 6,
    totalHabits: 6,
    weeklyProgress: 95,
    lastActive: 'Il y a 30min',
    achievements: 18
  },
  {
    id: 'demo-4',
    profile: { id: 'demo-user-4', full_name: 'Lucas Petit', avatar_url: null, friend_code: 'LUCA321' },
    status: 'accepted',
    streak: 3,
    completedToday: 1,
    totalHabits: 3,
    weeklyProgress: 45,
    lastActive: 'Hier',
    achievements: 4
  }
];

const mockGroups: (Group & { 
  member_count: number; 
  weeklyChallenge?: string;
  totalHabitsCompleted: number;
  activeMembers: number;
  ranking: number;
})[] = [
  {
    id: 'demo-group-1',
    name: '🏃 Sport du matin',
    description: 'On se motive pour faire du sport chaque matin ! Objectif : 30 min d\'exercice',
    invite_code: 'SPORT123',
    owner_id: 'demo-user-1',
    member_count: 8,
    weeklyChallenge: '5 jours de sport cette semaine',
    totalHabitsCompleted: 156,
    activeMembers: 6,
    ranking: 2
  },
  {
    id: 'demo-group-2',
    name: '📚 Lecture quotidienne',
    description: 'Objectif : lire 20 pages par jour minimum. Partagez vos lectures !',
    invite_code: 'READ456',
    owner_id: 'demo-user-2',
    member_count: 12,
    weeklyChallenge: 'Finir un chapitre chaque jour',
    totalHabitsCompleted: 234,
    activeMembers: 10,
    ranking: 1
  },
  {
    id: 'demo-group-3',
    name: '🧘 Méditation & Bien-être',
    description: 'Groupe dédié à la méditation et au développement personnel',
    invite_code: 'ZEN789',
    owner_id: 'demo-user-3',
    member_count: 5,
    weeklyChallenge: '10 min de méditation quotidienne',
    totalHabitsCompleted: 89,
    activeMembers: 4,
    ranking: 3
  }
];

const mockGroupMembers: GroupMember[] = [
  { id: '1', name: 'Marie D.', avatar: null, streak: 15, completedToday: 4, totalHabits: 5, isOnline: true },
  { id: '2', name: 'Thomas M.', avatar: null, streak: 7, completedToday: 2, totalHabits: 4, isOnline: false },
  { id: '3', name: 'Sophie B.', avatar: null, streak: 23, completedToday: 6, totalHabits: 6, isOnline: true },
  { id: '4', name: 'Lucas P.', avatar: null, streak: 3, completedToday: 1, totalHabits: 3, isOnline: false },
  { id: '5', name: 'Emma L.', avatar: null, streak: 11, completedToday: 3, totalHabits: 4, isOnline: true },
];

const mockChallenges: Challenge[] = [
  {
    id: 'c1',
    title: '7 jours de sport',
    description: 'Faire du sport pendant 7 jours consécutifs',
    type: 'group',
    targetId: 'demo-group-1',
    targetName: 'Sport du matin',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    progress: 71,
    participants: 6,
    isActive: true
  },
  {
    id: 'c2',
    title: 'Duel de lecture',
    description: 'Qui lira le plus de pages cette semaine ?',
    type: 'friend',
    targetId: 'demo-user-3',
    targetName: 'Sophie Bernard',
    startDate: '2024-01-18',
    endDate: '2024-01-25',
    progress: 45,
    participants: 2,
    isActive: true
  }
];

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'motivation',
    message: 'Continue comme ça ! Tu es sur la bonne voie 💪',
    senderName: 'Marie Dupont',
    senderAvatar: null,
    timestamp: 'Il y a 10 min',
    isRead: false
  },
  {
    id: 'n2',
    type: 'challenge',
    message: 't\'a défié pour un duel de lecture !',
    senderName: 'Sophie Bernard',
    senderAvatar: null,
    timestamp: 'Il y a 2h',
    isRead: false
  },
  {
    id: 'n3',
    type: 'achievement',
    message: 'a débloqué le badge "Série de 20 jours" 🏆',
    senderName: 'Thomas Martin',
    senderAvatar: null,
    timestamp: 'Hier',
    isRead: true
  },
  {
    id: 'n4',
    type: 'group_invite',
    message: 't\'invite à rejoindre "Yoga matinal"',
    senderName: 'Emma Laurent',
    senderAvatar: null,
    timestamp: 'Il y a 3 jours',
    isRead: true
  }
];

const Social = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");
  
  // Dialog states
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [joinGroupOpen, setJoinGroupOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<typeof mockGroups[0] | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<typeof mockFriends[0] | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  
  // Form states
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [groupInviteCode, setGroupInviteCode] = useState("");

  // Demo data
  const displayedGroups = groups.length > 0 ? groups : mockGroups;
  const displayedFriends = friends.length > 0 ? friends : mockFriends;
  const isDemo = groups.length === 0 && friends.length === 0;

  useEffect(() => {
    window.scrollTo(0, 0);
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      await Promise.all([
        loadProfile(user.id),
        loadGroups(user.id),
        loadFriends(user.id)
      ]);
    }
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  const loadGroups = async (userId: string) => {
    const { data: ownedGroups } = await supabase
      .from('groups')
      .select('*')
      .eq('owner_id', userId);
    
    const { data: memberGroups } = await supabase
      .from('group_members')
      .select('group_id, groups(*)')
      .eq('user_id', userId);
    
    const allGroups: Group[] = [];
    if (ownedGroups) allGroups.push(...ownedGroups);
    if (memberGroups) {
      memberGroups.forEach((m: any) => {
        if (m.groups && !allGroups.find(g => g.id === m.groups.id)) {
          allGroups.push(m.groups);
        }
      });
    }
    setGroups(allGroups);
  };

  const loadFriends = async (userId: string) => {
    const { data } = await supabase
      .from('friendships')
      .select(`id, status, friend_id, user_id`)
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'accepted');
    
    if (data) {
      const friendProfiles: Friend[] = [];
      for (const friendship of data) {
        const friendUserId = friendship.user_id === userId ? friendship.friend_id : friendship.user_id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', friendUserId)
          .single();
        if (profile) {
          friendProfiles.push({
            id: friendship.id,
            profile,
            status: friendship.status
          });
        }
      }
      setFriends(friendProfiles);
    }
  };

  const copyFriendCode = () => {
    if (profile?.friend_code) {
      navigator.clipboard.writeText(profile.friend_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Code copié !" });
    }
  };

  const createGroup = async () => {
    if (!user || !newGroupName.trim()) return;
    
    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || null,
        owner_id: user.id
      })
      .select()
      .single();
    
    if (error) {
      toast({ title: "Erreur", description: "Impossible de créer le groupe", variant: "destructive" });
      return;
    }
    
    if (data) {
      setGroups([...groups, data]);
      setNewGroupName("");
      setNewGroupDescription("");
      setCreateGroupOpen(false);
      toast({ title: "Groupe créé !" });
    }
  };

  const joinGroup = async () => {
    if (!user || !groupInviteCode.trim()) return;
    
    const { data: group } = await supabase
      .from('groups')
      .select('*')
      .eq('invite_code', groupInviteCode.trim().toUpperCase())
      .single();
    
    if (!group) {
      toast({ title: "Erreur", description: "Code d'invitation invalide", variant: "destructive" });
      return;
    }
    
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (existing || group.owner_id === user.id) {
      toast({ title: "Info", description: "Tu fais déjà partie de ce groupe" });
      setJoinGroupOpen(false);
      return;
    }
    
    const { error } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: user.id });
    
    if (error) {
      toast({ title: "Erreur", description: "Impossible de rejoindre le groupe", variant: "destructive" });
      return;
    }
    
    setGroups([...groups, group]);
    setGroupInviteCode("");
    setJoinGroupOpen(false);
    toast({ title: "Groupe rejoint !" });
  };

  const addFriend = async () => {
    if (!user || !friendCode.trim()) return;
    
    const { data: friendProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('friend_code', friendCode.trim().toUpperCase())
      .maybeSingle();
    
    if (!friendProfile) {
      toast({ title: "Erreur", description: "Code ami invalide", variant: "destructive" });
      return;
    }
    
    if (friendProfile.id === user.id) {
      toast({ title: "Erreur", description: "Tu ne peux pas t'ajouter toi-même", variant: "destructive" });
      return;
    }
    
    const { data: existing1 } = await supabase
      .from('friendships')
      .select('id')
      .eq('user_id', user.id)
      .eq('friend_id', friendProfile.id)
      .maybeSingle();
    
    const { data: existing2 } = await supabase
      .from('friendships')
      .select('id')
      .eq('user_id', friendProfile.id)
      .eq('friend_id', user.id)
      .maybeSingle();
    
    if (existing1 || existing2) {
      toast({ title: "Info", description: "Demande déjà envoyée ou ami existant" });
      return;
    }
    
    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: friendProfile.id,
        status: 'accepted'
      });
    
    if (error) {
      toast({ title: "Erreur", description: "Impossible d'ajouter l'ami", variant: "destructive" });
      return;
    }
    
    setFriends([...friends, { id: crypto.randomUUID(), profile: friendProfile, status: 'accepted' }]);
    setFriendCode("");
    setAddFriendOpen(false);
    toast({ title: "Ami ajouté !" });
  };

  const sendMotivation = async (friendId: string, friendName: string, message?: string) => {
    if (!user) return;
    
    if (!isDemo) {
      const { error } = await supabase
        .from('social_notifications')
        .insert({
          sender_id: user.id,
          recipient_id: friendId,
          type: 'motivation',
          message: message || `${profile?.full_name || 'Un ami'} t'encourage à faire tes habitudes aujourd'hui ! 💪`
        });
      
      if (error) {
        toast({ title: "Erreur", description: "Impossible d'envoyer", variant: "destructive" });
        return;
      }
    }
    
    toast({ title: `Message envoyé à ${friendName} !` });
    setMessageDialogOpen(false);
    setCustomMessage("");
  };

  const sendGroupMotivation = async (groupId: string, groupName: string) => {
    if (!user || isDemo) {
      toast({ title: `Notification envoyée au groupe ${groupName} !` });
      return;
    }
    
    const { data: members } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);
    
    const { data: group } = await supabase
      .from('groups')
      .select('owner_id')
      .eq('id', groupId)
      .single();
    
    const allMemberIds = new Set<string>();
    if (members) members.forEach(m => allMemberIds.add(m.user_id));
    if (group) allMemberIds.add(group.owner_id);
    allMemberIds.delete(user.id);
    
    for (const memberId of allMemberIds) {
      await supabase
        .from('social_notifications')
        .insert({
          sender_id: user.id,
          recipient_id: memberId,
          type: 'group_motivation',
          group_id: groupId,
          message: `${profile?.full_name || 'Un membre'} du groupe "${groupName}" vous encourage ! 🔥`
        });
    }
    
    toast({ title: `Notification envoyée au groupe ${groupName} !` });
  };

  // Ranking des amis par streak
  const rankedFriends = [...(displayedFriends as typeof mockFriends)].sort((a, b) => (b.streak || 0) - (a.streak || 0));

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Social & Entraide</h1>
          <button onClick={() => navigate('/premium')} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
            <Crown className="w-5 h-5 text-primary" />
          </button>
        </div>
      </header>
        
        <main className="px-6 max-w-2xl mx-auto">
          <div className="glass rounded-xl p-8 text-center border border-white/5">
            <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Connecte-toi</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Crée un compte pour accéder aux fonctionnalités sociales
            </p>
            <Button onClick={() => navigate('/auth')} className="bg-gradient-primary">
              Se connecter
            </Button>
          </div>
        </main>
        
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Social & Entraide</h1>
          <div className="flex items-center gap-2">
            {isDemo && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Démo</span>
            )}
            <button onClick={() => navigate('/premium')} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
              <Crown className="w-5 h-5 text-primary" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-6 max-w-2xl mx-auto">
        {/* Mon code ami */}
        <section className="glass rounded-xl p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mon code ami</p>
              <p className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent tracking-widest">
                {profile?.friend_code || '--------'}
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={copyFriendCode} className="border-primary/30">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </section>

        {/* Actions rapides */}
        <section className="grid grid-cols-3 gap-3">
          <Dialog open={addFriendOpen} onOpenChange={setAddFriendOpen}>
            <DialogTrigger asChild>
              <button className="glass rounded-xl p-3 text-center border border-white/5 hover:border-primary/30 transition-colors">
                <UserPlus className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium text-foreground">Ajouter</p>
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[70vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un ami</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Code ami (ex: A1B2C3D4)"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                  className="text-center text-lg tracking-widest"
                  maxLength={8}
                />
                <Button onClick={addFriend} className="w-full bg-gradient-primary">
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
            <DialogTrigger asChild>
              <button className="glass rounded-xl p-3 text-center border border-white/5 hover:border-primary/30 transition-colors">
                <Plus className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium text-foreground">Créer</p>
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[70vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un groupe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Nom du groupe"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <Textarea
                  placeholder="Description (optionnel)"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  rows={3}
                />
                <Button onClick={createGroup} className="w-full bg-gradient-primary">
                  Créer
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={joinGroupOpen} onOpenChange={setJoinGroupOpen}>
            <DialogTrigger asChild>
              <button className="glass rounded-xl p-3 text-center border border-white/5 hover:border-primary/30 transition-colors">
                <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium text-foreground">Rejoindre</p>
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[70vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Rejoindre un groupe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Code d'invitation"
                  value={groupInviteCode}
                  onChange={(e) => setGroupInviteCode(e.target.value.toUpperCase())}
                  className="text-center text-lg tracking-widest"
                  maxLength={8}
                />
                <Button onClick={joinGroup} className="w-full bg-gradient-primary">
                  Rejoindre
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="friends" className="text-xs">Amis</TabsTrigger>
            <TabsTrigger value="groups" className="text-xs">Groupes</TabsTrigger>
            <TabsTrigger value="ranking" className="text-xs">Classement</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs relative">
              Notifs
              {mockNotifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {mockNotifications.filter(n => !n.isRead).length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab: Amis */}
          <TabsContent value="friends" className="space-y-3 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-foreground">Mes amis ({displayedFriends.length})</h2>
            </div>
            
            {(displayedFriends as typeof mockFriends).map((friend) => (
              <div 
                key={friend.id} 
                className="glass rounded-xl p-4 border border-white/5 hover:border-primary/20 transition-colors cursor-pointer"
                onClick={() => setSelectedFriend(friend)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={friend.profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                          {(friend.profile.full_name || 'A')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {friend.lastActive === 'En ligne' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{friend.profile.full_name || 'Ami'}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span>{friend.streak} jours</span>
                        <span>•</span>
                        <span>{friend.completedToday}/{friend.totalHabits} aujourd'hui</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFriend(friend);
                        setMessageDialogOpen(true);
                      }}
                      className="text-primary hover:bg-primary/10"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <Progress value={friend.weeklyProgress} className="h-1 mt-3" />
                <p className="text-[10px] text-muted-foreground mt-1">{friend.weeklyProgress}% cette semaine</p>
              </div>
            ))}
          </TabsContent>

          {/* Tab: Groupes */}
          <TabsContent value="groups" className="space-y-3 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-foreground">Mes groupes ({displayedGroups.length})</h2>
            </div>

            {(displayedGroups as typeof mockGroups).map((group) => (
              <div 
                key={group.id} 
                className="glass rounded-xl p-4 border border-white/5 hover:border-primary/20 transition-colors cursor-pointer"
                onClick={() => setSelectedGroup(group)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{group.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {group.member_count} membres • {group.activeMembers} actifs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        sendGroupMotivation(group.id, group.name);
                      }}
                      className="text-primary hover:bg-primary/10"
                    >
                      <Bell className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                
                {group.weeklyChallenge && (
                  <div className="bg-primary/10 rounded-lg p-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-foreground">{group.weeklyChallenge}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" /> {group.totalHabitsCompleted} habitudes
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-yellow-500" /> #{group.ranking}
                  </span>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Tab: Classement */}
          <TabsContent value="ranking" className="space-y-3 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Classement des séries
              </h2>
            </div>

            {rankedFriends.map((friend, index) => (
              <div 
                key={friend.id} 
                className={`glass rounded-xl p-4 border ${index === 0 ? 'border-yellow-500/50 bg-yellow-500/5' : index === 1 ? 'border-gray-400/50' : index === 2 ? 'border-amber-600/50' : 'border-white/5'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500 text-yellow-950' : 
                      index === 1 ? 'bg-gray-400 text-gray-900' : 
                      index === 2 ? 'bg-amber-600 text-amber-950' : 
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
                        {(friend.profile.full_name || 'A')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{friend.profile.full_name}</h3>
                      <p className="text-xs text-muted-foreground">{friend.achievements} badges</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-orange-500">
                      <Flame className="w-4 h-4" />
                      <span className="font-bold">{friend.streak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">jours</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Ton classement */}
            <div className="glass rounded-xl p-4 border border-primary/30 bg-primary/5 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-sm text-primary-foreground">
                    5
                  </div>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
                      T
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Toi</h3>
                    <p className="text-xs text-primary">Continue comme ça !</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame className="w-4 h-4" />
                    <span className="font-bold">5</span>
                  </div>
                  <p className="text-xs text-muted-foreground">jours</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Notifications */}
          <TabsContent value="notifications" className="space-y-3 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-foreground">Notifications</h2>
              <Button variant="ghost" size="sm" className="text-xs text-primary">
                Tout marquer lu
              </Button>
            </div>

            {mockNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`glass rounded-xl p-4 border ${notif.isRead ? 'border-white/5' : 'border-primary/30 bg-primary/5'}`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className={`${
                      notif.type === 'motivation' ? 'bg-green-500' :
                      notif.type === 'challenge' ? 'bg-orange-500' :
                      notif.type === 'achievement' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    } text-white`}>
                      {notif.type === 'motivation' ? <Heart className="w-4 h-4" /> :
                       notif.type === 'challenge' ? <Zap className="w-4 h-4" /> :
                       notif.type === 'achievement' ? <Award className="w-4 h-4" /> :
                       <Users className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{notif.senderName}</span> {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.timestamp}</p>
                  </div>
                  {!notif.isRead && (
                    <span className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Challenges actifs */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            Défis en cours
          </h2>
          
          {mockChallenges.filter(c => c.isActive).map((challenge) => (
            <div key={challenge.id} className="glass rounded-xl p-4 border border-orange-500/20 bg-orange-500/5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {challenge.type === 'group' ? `Groupe: ${challenge.targetName}` : `Contre ${challenge.targetName}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-orange-500">{challenge.progress}%</span>
                  <p className="text-xs text-muted-foreground">{challenge.participants} participants</p>
                </div>
              </div>
              <Progress value={challenge.progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">{challenge.description}</p>
            </div>
          ))}

          <Button variant="outline" className="w-full border-dashed border-primary/30 text-primary" onClick={() => setChallengeDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Créer un défi
          </Button>
        </section>
      </main>

      {/* Dialog: Détail ami */}
      <Dialog open={!!selectedFriend && !messageDialogOpen} onOpenChange={() => setSelectedFriend(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                  {(selectedFriend?.profile.full_name || 'A')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <span>{selectedFriend?.profile.full_name}</span>
                <p className="text-xs text-muted-foreground font-normal">{selectedFriend?.lastActive}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass rounded-lg p-3 text-center border border-white/5">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{selectedFriend?.streak}</p>
                <p className="text-xs text-muted-foreground">Série</p>
              </div>
              <div className="glass rounded-lg p-3 text-center border border-white/5">
                <Target className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{selectedFriend?.weeklyProgress}%</p>
                <p className="text-xs text-muted-foreground">Semaine</p>
              </div>
              <div className="glass rounded-lg p-3 text-center border border-white/5">
                <Award className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{selectedFriend?.achievements}</p>
                <p className="text-xs text-muted-foreground">Badges</p>
              </div>
            </div>

            {/* Aujourd'hui */}
            <div className="glass rounded-lg p-4 border border-white/5">
              <p className="text-sm font-medium text-foreground mb-2">Progression aujourd'hui</p>
              <Progress value={(selectedFriend?.completedToday || 0) / (selectedFriend?.totalHabits || 1) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {selectedFriend?.completedToday}/{selectedFriend?.totalHabits} habitudes complétées
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => setMessageDialogOpen(true)} 
                className="bg-gradient-primary"
              >
                <Send className="w-4 h-4 mr-2" />
                Encourager
              </Button>
              <Button variant="outline" onClick={() => setChallengeDialogOpen(true)}>
                <Zap className="w-4 h-4 mr-2" />
                Défier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Envoyer message */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un encouragement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-2">
              {['💪 Continue !', '🔥 Tu gères !', '⭐ Fier de toi !', '🚀 Go go go !'].map((msg) => (
                <Button
                  key={msg}
                  variant="outline"
                  className="text-sm"
                  onClick={() => setCustomMessage(msg)}
                >
                  {msg}
                </Button>
              ))}
            </div>
            <Textarea
              placeholder="Ou écris ton propre message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={() => sendMotivation(
                selectedFriend?.profile.id || '', 
                selectedFriend?.profile.full_name || 'Ami',
                customMessage
              )} 
              className="w-full bg-gradient-primary"
              disabled={!customMessage}
            >
              Envoyer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Détail groupe */}
      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span>{selectedGroup?.name}</span>
                <p className="text-xs text-muted-foreground font-normal">{selectedGroup?.member_count} membres</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Description */}
            {selectedGroup?.description && (
              <p className="text-sm text-muted-foreground">{selectedGroup.description}</p>
            )}

            {/* Code */}
            <div className="glass rounded-lg p-3 border border-primary/20 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Code d'invitation</p>
                <p className="font-mono font-bold text-primary tracking-widest">{selectedGroup?.invite_code}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => {
                navigator.clipboard.writeText(selectedGroup?.invite_code || '');
                toast({ title: "Code copié !" });
              }}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {/* Challenge actuel */}
            {selectedGroup?.weeklyChallenge && (
              <div className="bg-primary/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Défi de la semaine</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedGroup.weeklyChallenge}</p>
              </div>
            )}

            {/* Membres */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Membres</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {mockGroupMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                            {member.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        {member.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-background rounded-full" />
                        )}
                      </div>
                      <span className="text-sm text-foreground">{member.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span>{member.streak}j</span>
                      <span>•</span>
                      <span>{member.completedToday}/{member.totalHabits}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => sendGroupMotivation(selectedGroup?.id || '', selectedGroup?.name || '')} 
                className="bg-gradient-primary"
              >
                <Bell className="w-4 h-4 mr-2" />
                Motiver tous
              </Button>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau défi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Créer défi */}
      <Dialog open={challengeDialogOpen} onOpenChange={setChallengeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un défi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Les défis permettent de se challenger entre amis ou au sein d'un groupe pour atteindre un objectif commun.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button className="glass rounded-xl p-4 text-center border border-white/5 hover:border-primary/30 transition-colors">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-medium text-foreground">Défi groupe</p>
                <p className="text-xs text-muted-foreground">Tous ensemble</p>
              </button>
              <button className="glass rounded-xl p-4 text-center border border-white/5 hover:border-primary/30 transition-colors">
                <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="font-medium text-foreground">Duel</p>
                <p className="text-xs text-muted-foreground">1 contre 1</p>
              </button>
            </div>
            <p className="text-xs text-center text-muted-foreground">Fonctionnalité bientôt disponible !</p>
          </div>
        </DialogContent>
      </Dialog>

      <Navigation />
    </div>
  );
};

export default Social;