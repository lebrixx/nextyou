import { useState, useEffect } from "react";
import { Users, UserPlus, Bell, Crown, Plus, Copy, Check, Send, Trophy, Target, Flame, MessageCircle, Eye, Calendar, TrendingUp, Award, Heart, Zap, ChevronRight, X, Settings, BarChart3, MessageSquare, Star, UserMinus, Shield } from "lucide-react";
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
  description: string | null;
  type: 'duel' | 'group';
  target_type: string;
  target_value: number;
  creator_id: string;
  opponent_id: string | null;
  group_id: string | null;
  start_date: string;
  end_date: string;
  status: string;
  creator_name?: string;
  opponent_name?: string;
  my_progress?: number;
  opponent_progress?: number;
}

interface PendingFriendRequest {
  id: string;
  profile: Profile;
  type: 'incoming' | 'outgoing';
}

interface Notification {
  id: string;
  type: 'motivation' | 'challenge' | 'achievement' | 'group_invite' | 'friend_request';
  message: string;
  senderName: string;
  senderAvatar: string | null;
  timestamp: string;
  isRead: boolean;
  senderId?: string;
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
    target_type: 'completions',
    target_value: 7,
    creator_id: 'demo-user-1',
    opponent_id: null,
    group_id: 'demo-group-1',
    start_date: '2024-01-15',
    end_date: '2024-01-22',
    status: 'active',
    creator_name: 'Marie Dupont',
    my_progress: 5,
    opponent_progress: 0
  },
  {
    id: 'c2',
    title: 'Duel de lecture',
    description: 'Qui lira le plus de pages cette semaine ?',
    type: 'duel',
    target_type: 'completions',
    target_value: 7,
    creator_id: 'demo-user-1',
    opponent_id: 'demo-user-3',
    group_id: null,
    start_date: '2024-01-18',
    end_date: '2024-01-25',
    status: 'active',
    creator_name: 'Moi',
    opponent_name: 'Sophie Bernard',
    my_progress: 3,
    opponent_progress: 4
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
  const [pendingRequests, setPendingRequests] = useState<PendingFriendRequest[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
  const [challengeType, setChallengeType] = useState<'duel' | 'group' | null>(null);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeDuration, setChallengeDuration] = useState(7);
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);
  const [selectedChallengeGroup, setSelectedChallengeGroup] = useState<string | null>(null);
  
  // Form states
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [groupInviteCode, setGroupInviteCode] = useState("");

  // Demo mode toggle
  const [demoMode, setDemoMode] = useState(false);
  
  // Demo data
  const displayedGroups = demoMode ? mockGroups : groups;
  const displayedFriends = demoMode ? mockFriends : friends;
  const displayedChallenges = demoMode ? mockChallenges : challenges;
  const displayedNotifications = demoMode ? mockNotifications : notifications;

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        // Defer data loading to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            loadAllData(session.user.id);
          }, 0);
        } else {
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadAllData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadAllData = async (userId: string) => {
    try {
      await Promise.all([
        loadProfile(userId),
        loadGroups(userId),
        loadFriends(userId),
        loadPendingRequests(userId),
        loadChallenges(userId),
        loadNotifications(userId)
      ]);
    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setLoading(false);
    }
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

  const loadPendingRequests = async (userId: string) => {
    const { data } = await supabase
      .from('friendships')
      .select(`id, status, friend_id, user_id`)
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'pending');
    
    if (data) {
      const requests: PendingFriendRequest[] = [];
      for (const friendship of data) {
        const isIncoming = friendship.friend_id === userId;
        const otherUserId = isIncoming ? friendship.user_id : friendship.friend_id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherUserId)
          .single();
        if (profile) {
          requests.push({
            id: friendship.id,
            profile,
            type: isIncoming ? 'incoming' : 'outgoing'
          });
        }
      }
      setPendingRequests(requests);
    }
  };

  const loadChallenges = async (userId: string) => {
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
      .in('status', ['active', 'pending']);
    
    if (data && data.length > 0) {
      const challengesWithNames: Challenge[] = [];
      for (const challenge of data) {
        let creatorName = 'Inconnu';
        let opponentName = 'Inconnu';
        
        if (challenge.creator_id) {
          const { data: creatorProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', challenge.creator_id)
            .single();
          creatorName = challenge.creator_id === userId ? 'Toi' : (creatorProfile?.full_name || 'Inconnu');
        }
        
        if (challenge.opponent_id) {
          const { data: opponentProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', challenge.opponent_id)
            .single();
          opponentName = challenge.opponent_id === userId ? 'Toi' : (opponentProfile?.full_name || 'Inconnu');
        }
        
        // Get progress from participants table
        const { data: myParticipation } = await supabase
          .from('challenge_participants')
          .select('progress')
          .eq('challenge_id', challenge.id)
          .eq('user_id', userId)
          .maybeSingle();
        
        const opponentId = challenge.creator_id === userId ? challenge.opponent_id : challenge.creator_id;
        const { data: opponentParticipation } = await supabase
          .from('challenge_participants')
          .select('progress')
          .eq('challenge_id', challenge.id)
          .eq('user_id', opponentId || '')
          .maybeSingle();
        
        challengesWithNames.push({
          ...challenge,
          type: challenge.type as 'duel' | 'group',
          creator_name: creatorName,
          opponent_name: opponentName,
          my_progress: myParticipation?.progress || 0,
          opponent_progress: opponentParticipation?.progress || 0
        });
      }
      setChallenges(challengesWithNames);
    }
  };

  const loadNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('social_notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data && data.length > 0) {
      const notifs: Notification[] = [];
      for (const notif of data) {
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', notif.sender_id)
          .single();
        
        notifs.push({
          id: notif.id,
          type: notif.type as any,
          message: notif.message || '',
          senderName: senderProfile?.full_name || 'Utilisateur',
          senderAvatar: senderProfile?.avatar_url,
          timestamp: new Date(notif.created_at).toLocaleString('fr-FR', { 
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
          }),
          isRead: notif.is_read,
          senderId: notif.sender_id
        });
      }
      setNotifications(notifs);
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);
    
    if (error) {
      toast({ title: "Erreur", description: "Impossible d'accepter la demande", variant: "destructive" });
      return;
    }
    
    toast({ title: "Demande acceptée !" });
    if (user) {
      await Promise.all([loadFriends(user.id), loadPendingRequests(user.id)]);
    }
  };

  const declineFriendRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);
    
    if (error) {
      toast({ title: "Erreur", description: "Impossible de refuser la demande", variant: "destructive" });
      return;
    }
    
    toast({ title: "Demande refusée" });
    if (user) {
      await loadPendingRequests(user.id);
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
        status: 'pending'
      });
    
    if (error) {
      toast({ title: "Erreur", description: "Impossible d'envoyer la demande", variant: "destructive" });
      return;
    }
    
    // Send notification to the friend
    await supabase
      .from('social_notifications')
      .insert({
        sender_id: user.id,
        recipient_id: friendProfile.id,
        type: 'friend_request',
        message: `${profile?.full_name || 'Quelqu\'un'} veut t'ajouter en ami !`
      });
    
    setPendingRequests([...pendingRequests, { id: crypto.randomUUID(), profile: friendProfile, type: 'outgoing' }]);
    setFriendCode("");
    setAddFriendOpen(false);
    toast({ title: "Demande d'ami envoyée !" });
  };

  const createChallenge = async () => {
    if (!user || !challengeTitle.trim()) return;
    
    if (challengeType === 'duel' && !selectedOpponent) {
      toast({ title: "Erreur", description: "Sélectionne un adversaire", variant: "destructive" });
      return;
    }
    
    if (challengeType === 'group' && !selectedChallengeGroup) {
      toast({ title: "Erreur", description: "Sélectionne un groupe", variant: "destructive" });
      return;
    }
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + challengeDuration);
    
    const { data: challenge, error } = await supabase
      .from('challenges')
      .insert({
        creator_id: user.id,
        title: challengeTitle.trim(),
        description: challengeDescription.trim() || null,
        type: challengeType,
        target_type: 'completions',
        target_value: challengeDuration,
        opponent_id: challengeType === 'duel' ? selectedOpponent : null,
        group_id: challengeType === 'group' ? selectedChallengeGroup : null,
        end_date: endDate.toISOString().split('T')[0],
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      toast({ title: "Erreur", description: "Impossible de créer le défi", variant: "destructive" });
      return;
    }
    
    // Add creator as participant
    await supabase
      .from('challenge_participants')
      .insert({
        challenge_id: challenge.id,
        user_id: user.id,
        accepted: true
      });
    
    // Send notification to opponent or group members
    if (challengeType === 'duel' && selectedOpponent) {
      await supabase
        .from('social_notifications')
        .insert({
          sender_id: user.id,
          recipient_id: selectedOpponent,
          type: 'challenge',
          message: `${profile?.full_name || 'Quelqu\'un'} te défie : "${challengeTitle}" !`
        });
      
      // Add opponent as participant (not accepted yet)
      await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challenge.id,
          user_id: selectedOpponent,
          accepted: false
        });
    }
    
    toast({ title: "Défi créé !" });
    setChallengeDialogOpen(false);
    setChallengeType(null);
    setChallengeTitle("");
    setChallengeDescription("");
    setChallengeDuration(7);
    setSelectedOpponent(null);
    setSelectedChallengeGroup(null);
    
    if (user) {
      await loadChallenges(user.id);
    }
  };

  const acceptChallenge = async (challengeId: string) => {
    if (!user) return;
    
    await supabase
      .from('challenge_participants')
      .update({ accepted: true })
      .eq('challenge_id', challengeId)
      .eq('user_id', user.id);
    
    await supabase
      .from('challenges')
      .update({ status: 'active' })
      .eq('id', challengeId);
    
    toast({ title: "Défi accepté !" });
    await loadChallenges(user.id);
  };

  const sendMotivation = async (friendId: string, friendName: string, message?: string) => {
    if (!user) return;
    
    if (!demoMode) {
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
    if (!user || demoMode) {
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
            <button 
              onClick={() => setDemoMode(!demoMode)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                demoMode 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {demoMode ? '✓ Démo' : 'Démo'}
            </button>
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
              {(notifications.length > 0 ? notifications : mockNotifications).filter(n => !n.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {(notifications.length > 0 ? notifications : mockNotifications).filter(n => !n.isRead).length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab: Amis */}
          <TabsContent value="friends" className="space-y-3 mt-4">
            {/* Demandes en attente */}
            {pendingRequests.filter(r => r.type === 'incoming').length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-orange-500" />
                  Demandes d'amis ({pendingRequests.filter(r => r.type === 'incoming').length})
                </h3>
                {pendingRequests.filter(r => r.type === 'incoming').map((request) => (
                  <div key={request.id} className="glass rounded-xl p-3 border border-orange-500/20 bg-orange-500/5 mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                            {(request.profile.full_name || 'A')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-foreground">{request.profile.full_name || 'Utilisateur'}</h4>
                          <p className="text-xs text-muted-foreground">Veut être ton ami</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-gradient-primary h-8"
                          onClick={() => acceptFriendRequest(request.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => declineFriendRequest(request.id)}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Demandes envoyées */}
            {pendingRequests.filter(r => r.type === 'outgoing').length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs text-muted-foreground mb-2">
                  En attente de réponse ({pendingRequests.filter(r => r.type === 'outgoing').length})
                </h3>
                {pendingRequests.filter(r => r.type === 'outgoing').map((request) => (
                  <div key={request.id} className="glass rounded-xl p-3 border border-white/5 opacity-70 mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {(request.profile.full_name || 'A')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-sm font-medium text-foreground">{request.profile.full_name || 'Utilisateur'}</h4>
                        <p className="text-xs text-muted-foreground">Demande envoyée</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-primary"
                onClick={async () => {
                  if (user && notifications.length > 0 && !demoMode) {
                    await supabase
                      .from('social_notifications')
                      .update({ is_read: true })
                      .eq('recipient_id', user.id);
                    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                    toast({ title: "Notifications marquées comme lues" });
                  } else if (demoMode) {
                    toast({ title: "Mode démo - Notifications marquées" });
                  }
                }}
              >
                Tout marquer lu
              </Button>
            </div>

            {displayedNotifications.map((notif) => (
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
                      notif.type === 'friend_request' ? 'bg-purple-500' :
                      'bg-blue-500'
                    } text-white`}>
                      {notif.type === 'motivation' ? <Heart className="w-4 h-4" /> :
                       notif.type === 'challenge' ? <Zap className="w-4 h-4" /> :
                       notif.type === 'achievement' ? <Award className="w-4 h-4" /> :
                       notif.type === 'friend_request' ? <UserPlus className="w-4 h-4" /> :
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

            {displayedNotifications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune notification</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Challenges actifs */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            Défis en cours
          </h2>

          {/* Défis en attente d'acceptation */}
          {displayedChallenges.filter(c => c.status === 'pending' && c.opponent_id === user?.id).map((challenge) => (
            <div key={challenge.id} className="glass rounded-xl p-4 border border-purple-500/30 bg-purple-500/5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full mb-1 inline-block">
                    Nouveau défi
                  </span>
                  <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    De {challenge.creator_name} • {challenge.target_value} jours
                  </p>
                </div>
              </div>
              {challenge.description && (
                <p className="text-xs text-muted-foreground mb-3">{challenge.description}</p>
              )}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-primary"
                  onClick={() => !demoMode && acceptChallenge(challenge.id)}
                >
                  Accepter
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1"
                  onClick={async () => {
                    if (!demoMode) {
                      await supabase.from('challenges').delete().eq('id', challenge.id);
                      setChallenges(challenges.filter(c => c.id !== challenge.id));
                    }
                    toast({ title: "Défi refusé" });
                  }}
                >
                  Refuser
                </Button>
              </div>
            </div>
          ))}
          
          {displayedChallenges.filter(c => c.status === 'active').map((challenge) => {
            const progress = challenge.target_value > 0 ? Math.round(((challenge.my_progress || 0) / challenge.target_value) * 100) : 0;
            return (
              <div key={challenge.id} className="glass rounded-xl p-4 border border-orange-500/20 bg-orange-500/5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {challenge.type === 'group' ? `Groupe` : `Contre ${challenge.opponent_name || 'Adversaire'}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-orange-500">{progress}%</span>
                    <p className="text-xs text-muted-foreground">
                      {challenge.my_progress || 0}/{challenge.target_value} jours
                    </p>
                  </div>
                </div>
                {challenge.type === 'duel' && (
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-primary">Toi: {challenge.my_progress || 0}</span>
                    <span className="text-orange-500">{challenge.opponent_name}: {challenge.opponent_progress || 0}</span>
                  </div>
                )}
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">{challenge.description}</p>
              </div>
            );
          })}

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
                <p className="text-xs text-muted-foreground font-normal">{selectedGroup?.member_count} membres • #{selectedGroup?.ranking}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Description */}
            {selectedGroup?.description && (
              <p className="text-sm text-muted-foreground">{selectedGroup.description}</p>
            )}

            {/* Stats du groupe */}
            <div className="grid grid-cols-3 gap-2">
              <div className="glass rounded-lg p-3 text-center border border-white/5">
                <BarChart3 className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{selectedGroup?.totalHabitsCompleted || 0}</p>
                <p className="text-[10px] text-muted-foreground">Habitudes</p>
              </div>
              <div className="glass rounded-lg p-3 text-center border border-white/5">
                <Users className="w-4 h-4 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{selectedGroup?.activeMembers || 0}</p>
                <p className="text-[10px] text-muted-foreground">Actifs</p>
              </div>
              <div className="glass rounded-lg p-3 text-center border border-white/5">
                <Trophy className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">#{selectedGroup?.ranking || '-'}</p>
                <p className="text-[10px] text-muted-foreground">Classement</p>
              </div>
            </div>

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
                <Progress value={65} className="h-2 mt-2" />
                <p className="text-[10px] text-muted-foreground mt-1">65% accompli par le groupe</p>
              </div>
            )}

            {/* Activité récente */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Activité récente
              </p>
              <div className="space-y-2 max-h-28 overflow-y-auto">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-foreground">Marie a complété 5 habitudes 🎉</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">Il y a 2h</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-foreground">Thomas atteint 7 jours de série !</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">Il y a 5h</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <Heart className="w-3 h-3 text-pink-500" />
                  <span className="text-xs text-foreground">Sophie encourage le groupe</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">Hier</span>
                </div>
              </div>
            </div>

            {/* Membres */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Membres ({selectedGroup?.member_count || 0})
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {mockGroupMembers.map((member, index) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        {index + 1}
                      </div>
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
                      <div>
                        <span className="text-sm text-foreground">{member.name}</span>
                        {index === 0 && <Shield className="w-3 h-3 text-yellow-500 inline ml-1" />}
                      </div>
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

            {/* Actions du groupe */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => sendGroupMotivation(selectedGroup?.id || '', selectedGroup?.name || '')} 
                  className="bg-gradient-primary"
                  size="sm"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Motiver tous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedGroup(null);
                    setChallengeType('group');
                    setSelectedChallengeGroup(selectedGroup?.id || null);
                    setChallengeDialogOpen(true);
                  }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Nouveau défi
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedGroup?.invite_code || '');
                    toast({ title: "Lien copié !", description: "Partage-le avec tes amis" });
                  }}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Inviter
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Paramètres
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs text-destructive hover:text-destructive"
                >
                  <UserMinus className="w-3 h-3 mr-1" />
                  Quitter
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Créer défi */}
      <Dialog open={challengeDialogOpen} onOpenChange={(open) => {
        setChallengeDialogOpen(open);
        if (!open) {
          setChallengeType(null);
          setChallengeTitle("");
          setChallengeDescription("");
          setChallengeDuration(7);
          setSelectedOpponent(null);
          setSelectedChallengeGroup(null);
        }
      }}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un défi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {!challengeType ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Choisis le type de défi que tu veux créer.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setChallengeType('group')}
                    className="glass rounded-xl p-4 text-center border border-white/5 hover:border-primary/30 transition-colors"
                  >
                    <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="font-medium text-foreground">Défi groupe</p>
                    <p className="text-xs text-muted-foreground">Tous ensemble</p>
                  </button>
                  <button 
                    onClick={() => setChallengeType('duel')}
                    className="glass rounded-xl p-4 text-center border border-white/5 hover:border-orange-500/30 transition-colors"
                  >
                    <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <p className="font-medium text-foreground">Duel</p>
                    <p className="text-xs text-muted-foreground">1 contre 1</p>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Input
                  placeholder="Nom du défi"
                  value={challengeTitle}
                  onChange={(e) => setChallengeTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Description (optionnel)"
                  value={challengeDescription}
                  onChange={(e) => setChallengeDescription(e.target.value)}
                  rows={2}
                />
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Durée : {challengeDuration} jours
                  </label>
                  <div className="flex gap-2">
                    {[3, 7, 14, 30].map((days) => (
                      <Button
                        key={days}
                        variant={challengeDuration === days ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChallengeDuration(days)}
                        className={challengeDuration === days ? "bg-gradient-primary" : ""}
                      >
                        {days}j
                      </Button>
                    ))}
                  </div>
                </div>

                {challengeType === 'duel' && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Choisir un adversaire
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {(displayedFriends as typeof mockFriends).map((friend) => (
                        <button
                          key={friend.id}
                          onClick={() => setSelectedOpponent(friend.profile.id)}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                            selectedOpponent === friend.profile.id 
                              ? 'bg-primary/20 border border-primary/50' 
                              : 'hover:bg-muted/50 border border-transparent'
                          }`}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                              {(friend.profile.full_name || 'A')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground">{friend.profile.full_name}</span>
                          {selectedOpponent === friend.profile.id && (
                            <Check className="w-4 h-4 text-primary ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {challengeType === 'group' && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Choisir un groupe
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {(displayedGroups as typeof mockGroups).map((group) => (
                        <button
                          key={group.id}
                          onClick={() => setSelectedChallengeGroup(group.id)}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                            selectedChallengeGroup === group.id 
                              ? 'bg-primary/20 border border-primary/50' 
                              : 'hover:bg-muted/50 border border-transparent'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary-foreground" />
                          </div>
                          <span className="text-sm text-foreground">{group.name}</span>
                          {selectedChallengeGroup === group.id && (
                            <Check className="w-4 h-4 text-primary ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setChallengeType(null)}
                    className="flex-1"
                  >
                    Retour
                  </Button>
                  <Button 
                    onClick={createChallenge}
                    className="flex-1 bg-gradient-primary"
                    disabled={!challengeTitle.trim() || (challengeType === 'duel' && !selectedOpponent) || (challengeType === 'group' && !selectedChallengeGroup)}
                  >
                    Créer le défi
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Navigation />
    </div>
  );
};

export default Social;