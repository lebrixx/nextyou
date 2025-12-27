import { useState, useEffect, useCallback } from "react";
import { Users, UserPlus, Bell, Crown, Plus, Copy, Check, Send, Trophy, Target, Flame, MessageCircle, TrendingUp, Award, Zap, ChevronRight, ChevronDown, X, Clock, Trash2, Swords, RefreshCw, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSocialNotifications } from "@/hooks/useSocialNotifications";
import ConfirmDialog from "@/components/ConfirmDialog";
import { FriendBadgesSection } from "@/components/FriendBadgesSection";
import { FriendActivityFeed } from "@/components/FriendActivityFeed";
interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  friend_code: string | null;
  duel_wins?: number;
  duel_streak?: number;
}

interface Friend {
  id: string;
  profile: Profile;
  status: string;
}

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Duel modes
type DuelMode = 'regularity' | 'specific_habit' | 'streak';

const DUEL_MODES: { value: DuelMode; label: string; description: string; icon: string }[] = [
  { value: 'regularity', label: 'Régularité', description: '1 point/jour en complétant au moins 1 habitude', icon: '📅' },
  { value: 'specific_habit', label: 'Habitude ciblée', description: 'Compter les complétion d\'une habitude précise', icon: '🎯' },
  { value: 'streak', label: 'Série', description: 'Plus longue série consécutive', icon: '🔥' },
];

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  type: 'duel';
  target_type: string;
  target_value: number;
  duel_mode: DuelMode;
  creator_id: string;
  opponent_id: string | null;
  habit_id: string | null;
  habit_name: string | null;
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
  type: 'motivation' | 'challenge' | 'achievement' | 'friend_request' | 'duel_update';
  message: string;
  senderName: string;
  senderAvatar: string | null;
  timestamp: string;
  isRead: boolean;
  senderId?: string;
}

// Helper function to format time ago
const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'À l\'instant';
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const Social = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingFriendRequest[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  
  // Dialog states
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend & { duel_wins?: number; duel_streak?: number } | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeDuration, setChallengeDuration] = useState(7);
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);
  const [selectedHabitName, setSelectedHabitName] = useState("");
  const [selectedDuelMode, setSelectedDuelMode] = useState<DuelMode>('regularity');
  
  // Form states
  const [friendCode, setFriendCode] = useState("");

  // UI states
  const [expandedChallenges, setExpandedChallenges] = useState<Record<string, boolean>>({});
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [cheeredChallenges, setCheeredChallenges] = useState<string[]>([]);
  const [mutedFriends, setMutedFriends] = useState<string[]>(() => {
    const saved = localStorage.getItem('muted_friends');
    return saved ? JSON.parse(saved) : [];
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  }>({ open: false, title: '', description: '', onConfirm: () => {} });
  
  // Social notifications hook for realtime
  const { preferences: notifPreferences, updatePreferences: updateNotifPreferences } = useSocialNotifications(user?.id);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            loadAllData(session.user.id);
          }, 0);
        } else {
          setLoading(false);
        }
      }
    );

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

  // Refresh data when page becomes visible (coming back from Habits page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        loadChallenges(user.id);
      }
    };
    
    const handleFocus = () => {
      if (user) {
        loadChallenges(user.id);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  // State for live score animations
  const [scoreAnimations, setScoreAnimations] = useState<Record<string, { type: 'my' | 'opponent', show: boolean }>>({});

  // Realtime subscription for duel updates with live animations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('duel-updates-live')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'challenge_participants',
        },
        async (payload) => {
          const updatedParticipant = payload.new as { challenge_id: string; user_id: string; progress: number };
          const oldProgress = (payload.old as { progress: number })?.progress || 0;
          
          // Find challenge and show animation
          const challenge = challenges.find(c => c.id === updatedParticipant.challenge_id);
          if (challenge && updatedParticipant.progress > oldProgress) {
            const isMyProgress = updatedParticipant.user_id === user.id;
            
            // Trigger score animation
            setScoreAnimations(prev => ({
              ...prev,
              [challenge.id]: { type: isMyProgress ? 'my' : 'opponent', show: true }
            }));
            
            // Clear animation after delay
            setTimeout(() => {
              setScoreAnimations(prev => ({
                ...prev,
                [challenge.id]: { ...prev[challenge.id], show: false }
              }));
            }, 1500);
            
            // Show toast for opponent progress
            if (!isMyProgress) {
              toast({
                title: "⚡ Score mis à jour !",
                description: `Ton adversaire vient de marquer un point dans "${challenge.title}"`,
              });
            }
          }
          
          // Reload challenges to update scores
          loadChallenges(user.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          loadNotifications(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, challenges]);

  const loadAllData = async (userId: string) => {
    try {
      await Promise.all([
        loadProfile(userId),
        loadFriends(userId),
        loadHabits(userId),
        loadPendingRequests(userId),
        loadChallenges(userId),
        loadNotifications(userId)
      ]);
    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  };

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as Profile);
  };

  const loadHabits = async (userId: string) => {
    const { data } = await supabase
      .from('habits')
      .select('id, name, icon, color')
      .eq('user_id', userId)
      .eq('is_archived', false);
    if (data) setHabits(data);
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
            profile: profile as Profile,
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

        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherUserId)
          .maybeSingle();

        // Always push the request, even if the profile isn't readable yet (RLS) or missing
        const safeProfile: Profile = (otherProfile as Profile) || {
          id: otherUserId,
          full_name: null,
          avatar_url: null,
          friend_code: null,
        };

        requests.push({
          id: friendship.id,
          profile: safeProfile,
          type: isIncoming ? 'incoming' : 'outgoing',
        });
      }

      setPendingRequests(requests);
    }
  };

  const loadChallenges = async (userId: string) => {
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .eq('type', 'duel')
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
          type: 'duel',
          duel_mode: (challenge.duel_mode || 'regularity') as DuelMode,
          creator_name: creatorName,
          opponent_name: opponentName,
          my_progress: myParticipation?.progress || 0,
          opponent_progress: opponentParticipation?.progress || 0
        });
      }
      setChallenges(challengesWithNames);
    } else {
      setChallenges([]);
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
          .maybeSingle();

        notifs.push({
          id: notif.id,
          type: notif.type as any,
          message: notif.message || '',
          senderName: senderProfile?.full_name || 'Utilisateur',
          senderAvatar: senderProfile?.avatar_url,
          timestamp: getTimeAgo(notif.created_at),
          isRead: notif.is_read,
          senderId: notif.sender_id,
        });
      }

      setNotifications(notifs);
    } else {
      setNotifications([]);
    }
  };

  const acceptFriendRequest = async (friendshipId: string, notificationId?: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);

    if (error) {
      toast({ title: "Erreur", description: "Impossible d'accepter la demande", variant: "destructive" });
      return;
    }

    if (notificationId) {
      await supabase.from('social_notifications').update({ is_read: true }).eq('id', notificationId);
    }

    toast({ title: "Demande acceptée !" });

    if (user) {
      await Promise.all([
        loadFriends(user.id),
        loadPendingRequests(user.id),
        loadNotifications(user.id),
      ]);
    }
  };

  const declineFriendRequest = async (friendshipId: string, notificationId?: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) {
      toast({ title: "Erreur", description: "Impossible de refuser la demande", variant: "destructive" });
      return;
    }

    if (notificationId) {
      await supabase.from('social_notifications').update({ is_read: true }).eq('id', notificationId);
    }

    toast({ title: "Demande refusée" });

    if (user) {
      await Promise.all([
        loadPendingRequests(user.id),
        loadNotifications(user.id),
      ]);
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

  const addFriend = async () => {
    if (!user || !friendCode.trim()) return;
    
    const { data: friendProfiles, error: searchError } = await supabase
      .rpc('search_profile_by_friend_code', { _friend_code: friendCode.trim().toUpperCase() });
    
    if (searchError || !friendProfiles || friendProfiles.length === 0) {
      toast({ title: "Erreur", description: "Code ami invalide", variant: "destructive" });
      return;
    }
    
    const friendProfile = friendProfiles[0];
    
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

  const createDuel = async () => {
    if (!user || !challengeTitle.trim()) {
      toast({ title: "Erreur", description: "Donne un nom au duel", variant: "destructive" });
      return;
    }
    
    if (!selectedOpponent) {
      toast({ title: "Erreur", description: "Sélectionne un adversaire", variant: "destructive" });
      return;
    }
    
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + challengeDuration);
      
      // For specific_habit mode, require a habit name
      if (selectedDuelMode === 'specific_habit' && !selectedHabitName.trim()) {
        toast({ title: "Erreur", description: "Écris le nom de l'habitude pour ce mode", variant: "destructive" });
        return;
      }
      
      // Determine target value based on mode
      const targetValue = challengeDuration;
      
      const { data: challenge, error } = await supabase
        .from('challenges')
        .insert({
          creator_id: user.id,
          title: challengeTitle.trim(),
          description: challengeDescription.trim() || null,
          type: 'duel',
          target_type: 'completions',
          target_value: targetValue,
          duel_mode: selectedDuelMode,
          opponent_id: selectedOpponent,
          habit_id: null,
          habit_name: selectedHabitName.trim() || null,
          end_date: endDate.toISOString().split('T')[0],
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Challenge creation error:', error);
        toast({ title: "Erreur", description: "Impossible de créer le duel", variant: "destructive" });
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
      
      // Add opponent as participant (not accepted yet)
      await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challenge.id,
          user_id: selectedOpponent,
          accepted: false
        });
      
      const modeInfo = DUEL_MODES.find(m => m.value === selectedDuelMode);
      const habitInfo = selectedHabitName.trim() ? ` sur "${selectedHabitName.trim()}"` : '';
      await supabase
        .from('social_notifications')
        .insert({
          sender_id: user.id,
          recipient_id: selectedOpponent,
          type: 'challenge',
          message: `${profile?.full_name || 'Quelqu\'un'} te défie en duel ${modeInfo?.icon || ''} ${modeInfo?.label || ''}${habitInfo} : "${challengeTitle}" ! ⚔️`
        });
      
      toast({ title: "⚔️ Duel envoyé !", description: "En attente de la réponse de ton adversaire" });
      setChallengeDialogOpen(false);
      setChallengeTitle("");
      setChallengeDescription("");
      setChallengeDuration(7);
      setSelectedOpponent(null);
      setSelectedHabitName("");
      setSelectedDuelMode('regularity');
      
      await loadChallenges(user.id);
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({ title: "Erreur", description: "Une erreur inattendue est survenue", variant: "destructive" });
    }
  };
  
  const deleteFriend = async (friendshipId: string, friendName: string) => {
    setConfirmDialog({
      open: true,
      title: "Supprimer cet ami ?",
      description: `Tu ne pourras plus voir ${friendName} dans ta liste d'amis ni lui envoyer de messages.`,
      variant: 'destructive',
      onConfirm: async () => {
        const { error } = await supabase
          .from('friendships')
          .delete()
          .eq('id', friendshipId);
        
        if (error) {
          toast({ title: "Erreur", description: "Impossible de supprimer l'ami", variant: "destructive" });
          return;
        }
        
        setFriends(friends.filter(f => f.id !== friendshipId));
        setSelectedFriend(null);
        toast({ title: "Ami supprimé", description: `${friendName} a été retiré de tes amis` });
      }
    });
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
    
    // Notify creator that duel was accepted
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      await supabase
        .from('social_notifications')
        .insert({
          sender_id: user.id,
          recipient_id: challenge.creator_id,
          type: 'challenge',
          message: `${profile?.full_name || 'Ton adversaire'} a accepté ton duel "${challenge.title}" ! Le combat commence ! ⚔️`
        });
    }
    
    toast({ title: "⚔️ Duel accepté ! Que le meilleur gagne !" });
    await loadChallenges(user.id);
  };

  const sendMotivation = async (friendId: string, friendName: string, message?: string) => {
    if (!user) {
      toast({ title: "Erreur", description: "Tu dois être connecté", variant: "destructive" });
      return;
    }
    
    if (!friendId || friendId === '') {
      toast({ title: "Erreur", description: "Sélectionne un ami d'abord", variant: "destructive" });
      return;
    }
    
    const finalMessage = message || '💪 Continue comme ça !';
    const senderName = profile?.full_name || 'Un ami';
    
    try {
      const { error } = await supabase
        .from('social_notifications')
        .insert({
          sender_id: user.id,
          recipient_id: friendId,
          type: 'motivation',
          message: `${senderName} t'encourage : "${finalMessage}"`
        });
      
      if (error) {
        console.error('Motivation send error:', error);
        toast({ title: "Erreur", description: `Impossible d'envoyer: ${error.message}`, variant: "destructive" });
        return;
      }
      
      setMessageDialogOpen(false);
      setCustomMessage("");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      toast({ title: `💪 Encouragement envoyé à ${friendName} !` });
    } catch (err) {
      console.error('Unexpected error sending motivation:', err);
      toast({ title: "Erreur", description: "Une erreur inattendue est survenue", variant: "destructive" });
    }
  };

  const toggleMuteFriend = (friendId: string) => {
    const newMuted = mutedFriends.includes(friendId)
      ? mutedFriends.filter(id => id !== friendId)
      : [...mutedFriends, friendId];
    setMutedFriends(newMuted);
    localStorage.setItem('muted_friends', JSON.stringify(newMuted));
    toast({ 
      title: mutedFriends.includes(friendId) ? "Notifications activées" : "Notifications désactivées"
    });
  };

  const quitChallenge = async (challengeId: string) => {
    if (!user) return;
    
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    setConfirmDialog({
      open: true,
      title: "Abandonner ce duel ?",
      description: `Tu vas abandonner le duel "${challenge.title}". Ton adversaire sera notifié et le duel sera supprimé.`,
      variant: 'destructive',
      onConfirm: async () => {
        // Notify opponent that user quit
        const opponentId = challenge.creator_id === user.id ? challenge.opponent_id : challenge.creator_id;
        if (opponentId) {
          await supabase
            .from('social_notifications')
            .insert({
              sender_id: user.id,
              recipient_id: opponentId,
              type: 'duel_update',
              message: `${profile?.full_name || 'Ton adversaire'} a abandonné le duel "${challenge.title}". Le défi est annulé.`
            });
        }
        
        await supabase.from('challenge_participants').delete().eq('challenge_id', challengeId);
        await supabase.from('challenges').delete().eq('id', challengeId);
        
        setChallenges(challenges.filter(c => c.id !== challengeId));
        toast({ title: "Duel abandonné" });
      }
    });
  };

  // Refresh scores manually
  const refreshScores = async () => {
    if (!user || isRefreshing) return;
    setIsRefreshing(true);
    await loadChallenges(user.id);
    setIsRefreshing(false);
    toast({ title: "Scores actualisés !" });
  };

  // Cheer for a friend in a challenge
  const cheerChallenge = async (challengeId: string, opponentId: string | null) => {
    if (!user || !opponentId || cheeredChallenges.includes(challengeId)) return;
    
    setCheeredChallenges(prev => [...prev, challengeId]);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
    
    await supabase.from('social_notifications').insert({
      sender_id: user.id,
      recipient_id: opponentId,
      type: 'motivation',
      message: `${profile?.full_name || 'Quelqu\'un'} t'encourage dans votre duel ! 👏`
    });
    
    toast({ title: "Encouragement envoyé ! 👏" });
  };

  // Mark all notifications as read
  const markNotificationsAsRead = async () => {
    if (!user) return;
    
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length === 0) return;
    
    // Update in database
    await supabase
      .from('social_notifications')
      .update({ is_read: true })
      .eq('recipient_id', user.id)
      .eq('is_read', false);
    
    // Update local state
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Ranking des amis par victoires en duel
  const rankedFriends = [...friends].sort((a, b) => 
    ((b.profile as any).duel_wins || 0) - ((a.profile as any).duel_wins || 0)
  );

  const isLoading = loading && !initialLoadDone;

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="px-6 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Duels & Amis</h1>
            <button onClick={() => navigate('/premium')} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
              <Crown className="w-5 h-5 text-primary" />
            </button>
          </div>
        </header>
          
        <main className="px-6 max-w-2xl mx-auto">
          <div className="glass rounded-xl p-8 text-center border border-white/5">
            <Swords className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Connecte-toi</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Crée un compte pour défier tes amis en duel !
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
    <div className={`min-h-screen bg-background pb-24 relative overflow-hidden transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'][i % 5],
                width: '10px',
                height: '10px',
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
        </div>
      )}
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-60 h-60 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 -right-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <header className="px-6 pt-12 pb-4 relative z-10">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Swords className="w-6 h-6 text-red-500" />
              Duels & Amis
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Défie tes amis et prouve ta valeur</p>
          </div>
          <button onClick={() => navigate('/premium')} className="p-2 hover:bg-primary/10 rounded-full transition-all duration-300 hover:scale-110">
            <Crown className="w-5 h-5 text-primary" />
          </button>
        </div>
      </header>

      <main className="px-6 space-y-6 max-w-2xl mx-auto relative z-10">
        {/* Mon code ami */}
        <section className="glass rounded-2xl p-5 border border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/5 animate-fade-in relative overflow-hidden group hover:border-red-500/50 transition-all duration-300">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
                <Swords className="w-3 h-3 text-red-500" />
                Mon code ami
              </p>
              <p className="text-2xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent tracking-[0.3em]">
                {profile?.friend_code || '--------'}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={copyFriendCode} 
              className="border-red-500/30 hover:bg-red-500/20 hover:scale-110 transition-all duration-300"
            >
              {copied ? <Check className="w-4 h-4 text-green-500 animate-scale-in" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </section>

        {/* Actions rapides */}
        <section className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Dialog open={addFriendOpen} onOpenChange={setAddFriendOpen}>
            <DialogTrigger asChild>
              <button className="glass rounded-2xl p-4 text-center border border-white/5 hover:border-primary/40 transition-all duration-300 hover:scale-105 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                    <UserPlus className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs font-medium text-foreground">Ajouter un ami</p>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[70vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Ajouter un ami
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Code ami (ex: A1B2C3D4)"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                  className="text-center text-lg tracking-widest"
                  maxLength={8}
                />
                <Button onClick={addFriend} className="w-full bg-gradient-to-r from-primary to-accent">
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <button 
            onClick={() => setChallengeDialogOpen(true)}
            className="glass rounded-2xl p-4 text-center border border-white/5 hover:border-red-500/40 transition-all duration-300 hover:scale-105 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <Swords className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-xs font-medium text-foreground">Lancer un duel</p>
            </div>
          </button>
        </section>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          // Mark notifications as read when viewing notifications tab
          if (value === 'notifications' && user) {
            markNotificationsAsRead();
          }
        }} className="w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="feed" className="rounded-lg data-[state=active]:bg-background">
              <Activity className="w-4 h-4 mr-1" />
              <span className="text-xs">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="friends" className="rounded-lg data-[state=active]:bg-background">
              <Users className="w-4 h-4 mr-1" />
              <span className="text-xs">Amis</span>
            </TabsTrigger>
            <TabsTrigger value="duels" className="rounded-lg data-[state=active]:bg-background">
              <Swords className="w-4 h-4 mr-1" />
              <span className="text-xs">Duels</span>
            </TabsTrigger>
            <TabsTrigger value="ranking" className="rounded-lg data-[state=active]:bg-background">
              <Trophy className="w-4 h-4 mr-1" />
              <span className="text-xs">Top</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-background relative">
              <Bell className="w-4 h-4" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab: Feed */}
          <TabsContent value="feed" className="mt-4">
            <FriendActivityFeed 
              userId={user.id} 
              friendIds={friends.map(f => f.profile.id)} 
            />
          </TabsContent>

          {/* Tab: Amis */}
          <TabsContent value="friends" className="space-y-3 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-foreground">Mes amis ({friends.length})</h2>
            </div>
            
            {/* Demandes section */}
            {pendingRequests.filter(r => r.type === 'incoming').length > 0 && (
              <div className="space-y-2 mb-4">
                <button 
                  className="w-full glass rounded-xl p-3 border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors"
                  onClick={() => setActiveTab('notifications')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium text-foreground">Demandes</span>
                        <p className="text-xs text-muted-foreground">
                          {pendingRequests.filter(r => r.type === 'incoming').length} demande(s) en attente
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-primary rounded-full text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {pendingRequests.filter(r => r.type === 'incoming').length}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </button>
              </div>
            )}
            
            {friends.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun ami pour le moment</p>
                <p className="text-xs mt-1">Ajoute des amis avec leur code pour lancer des duels !</p>
              </div>
            ) : (
              friends.map((friend, index) => (
                <div 
                  key={friend.id} 
                  className="glass rounded-2xl p-4 border border-white/5 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:scale-[1.02] group animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => setSelectedFriend(friend)}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <Avatar className="ring-2 ring-white/10 group-hover:ring-primary/30 transition-all duration-300">
                        <AvatarImage src={friend.profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                          {(friend.profile.full_name || 'A')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">{friend.profile.full_name || 'Ami'}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>#{friend.profile.friend_code}</span>
                          {(friend.profile as any).duel_wins > 0 && (
                            <>
                              <span className="text-muted-foreground/50">•</span>
                              <span className="flex items-center gap-1 text-yellow-500">
                                <Trophy className="w-3 h-3" />
                                {(friend.profile as any).duel_wins} victoires
                              </span>
                            </>
                          )}
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
                          setSelectedOpponent(friend.profile.id);
                          setChallengeDialogOpen(true);
                        }}
                        className="text-red-500 hover:bg-red-500/20 hover:scale-110 transition-all duration-300"
                      >
                        <Swords className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFriend(friend);
                          setMessageDialogOpen(true);
                        }}
                        className="text-primary hover:bg-primary/20 hover:scale-110 transition-all duration-300"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Tab: Duels */}
          <TabsContent value="duels" className="space-y-3 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Swords className="w-5 h-5 text-red-500" />
                Mes duels
              </h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-8"
                  onClick={refreshScores}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      ?
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Swords className="w-5 h-5 text-red-500" />
                        À propos des duels
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p><strong className="text-foreground">Duel sur habitude :</strong> Choisis une habitude spécifique et affronte ton ami. Celui qui complète le plus cette habitude gagne !</p>
                      <p><strong className="text-foreground">Comptage automatique :</strong> Chaque fois que tu complètes l'habitude du duel, ton score augmente automatiquement.</p>
                      <p><strong className="text-foreground">Récompenses :</strong> Gagne des duels pour obtenir des badges exclusifs et grimper dans le classement !</p>
                      <p><strong className="text-foreground">Notifications :</strong> Reçois des notifications quand ton adversaire progresse ou te dépasse.</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Pending duels */}
            {challenges.filter(c => c.status === 'pending' && c.opponent_id === user?.id).map((challenge) => (
              <div key={challenge.id} className="glass rounded-2xl p-4 border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 animate-pulse-slow relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-medium animate-pulse">
                    ⚔️ Défi reçu !
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Swords className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{challenge.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      De {challenge.creator_name} • {challenge.target_value} jours
                      {challenge.habit_name && <span className="text-primary"> • {challenge.habit_name}</span>}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-500/20 text-red-400 inline-block mt-1">
                      {challenge.duel_mode === 'regularity' && '📅 Régularité'}
                      {challenge.duel_mode === 'specific_habit' && '🎯 Ciblé'}
                      {challenge.duel_mode === 'streak' && '🔥 Série'}
                    </span>
                  </div>
                </div>
                {challenge.description && (
                  <p className="text-xs text-muted-foreground mb-3">{challenge.description}</p>
                )}
                <div className="flex gap-3 relative z-10">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 h-10"
                    onClick={() => acceptChallenge(challenge.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accepter le duel
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1 border-red-500/30 hover:bg-red-500/10 h-10"
                    onClick={() => {
                      setConfirmDialog({
                        open: true,
                        title: "Refuser ce duel ?",
                        description: `Tu refuses le duel "${challenge.title}" de ${challenge.creator_name}.`,
                        variant: 'destructive',
                        onConfirm: async () => {
                          await supabase.from('challenges').delete().eq('id', challenge.id);
                          setChallenges(challenges.filter(c => c.id !== challenge.id));
                          toast({ title: "Duel refusé" });
                        }
                      });
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Refuser
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Active duels */}
            {challenges.filter(c => c.status === 'active').map((challenge, index) => {
              const isWinning = (challenge.my_progress || 0) > (challenge.opponent_progress || 0);
              const isTie = (challenge.my_progress || 0) === (challenge.opponent_progress || 0);
              const daysLeft = Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
              const isExpanded = expandedChallenges[challenge.id] ?? false;
              const currentAnimation = scoreAnimations[challenge.id];
              const potentialXP = Math.ceil(challenge.target_value * 10 * (isWinning ? 1.5 : 1));
              
              return (
                <div key={challenge.id} className={`glass rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent hover:border-red-500/50 transition-all duration-300 relative overflow-hidden group animate-fade-in ${currentAnimation?.show ? 'ring-2 ring-yellow-500/50' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
                  
                  {/* Live score update flash */}
                  {currentAnimation?.show && (
                    <div className={`absolute inset-0 animate-pulse pointer-events-none ${currentAnimation.type === 'my' ? 'bg-green-500/10' : 'bg-orange-500/10'}`} />
                  )}
                  
                  {/* Collapsible header */}
                  <button
                    onClick={() => setExpandedChallenges(prev => ({ ...prev, [challenge.id]: !isExpanded }))}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/30 relative">
                        <span className="text-white font-black text-xs">VS</span>
                        {currentAnimation?.show && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-ping" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          {/* Mode badge */}
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-500/20 text-red-400">
                            {challenge.duel_mode === 'regularity' && '📅 Régularité'}
                            {challenge.duel_mode === 'specific_habit' && '🎯 Ciblé'}
                            {challenge.duel_mode === 'streak' && '🔥 Série'}
                          </span>
                          {challenge.habit_name && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/20 text-primary">
                              {challenge.habit_name}
                            </span>
                          )}
                          {isWinning && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full animate-pulse">🏆 En tête</span>}
                          {!isWinning && !isTie && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">💪 Rattrape !</span>}
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" />
                            {potentialXP} XP
                          </span>
                        </div>
                        <h3 className="font-bold text-foreground text-sm truncate">{challenge.title}</h3>
                        <p className="text-[10px] text-muted-foreground">
                          vs {challenge.creator_id === user?.id ? challenge.opponent_name : challenge.creator_name} • {daysLeft}j restants
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-center relative">
                        <div className="flex items-center gap-1 text-lg font-black">
                          <span className={`text-primary transition-all duration-300 ${currentAnimation?.show && currentAnimation.type === 'my' ? 'scale-125 text-green-500' : ''}`}>
                            {challenge.my_progress || 0}
                          </span>
                          <span className="text-muted-foreground text-sm">-</span>
                          <span className={`text-orange-500 transition-all duration-300 ${currentAnimation?.show && currentAnimation.type === 'opponent' ? 'scale-125 text-red-500' : ''}`}>
                            {challenge.opponent_progress || 0}
                          </span>
                        </div>
                        {currentAnimation?.show && (
                          <span className={`absolute -top-3 ${currentAnimation.type === 'my' ? 'left-0' : 'right-0'} text-xs font-bold ${currentAnimation.type === 'my' ? 'text-green-500' : 'text-orange-500'} animate-bounce`}>
                            +1
                          </span>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  
                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4">
                      {/* Visual battle representation */}
                      <div className="relative z-10">
                        <div className="bg-gradient-to-r from-primary/10 via-muted/30 to-orange-500/10 rounded-xl p-4 border border-white/5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-center flex-1">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-1 shadow-lg shadow-primary/30">
                              <span className={`text-primary-foreground font-bold transition-transform duration-300 ${currentAnimation?.show && currentAnimation.type === 'my' ? 'scale-125' : ''}`}>T</span>
                              </div>
                              <span className="text-xs text-foreground font-medium">Toi</span>
                              {currentAnimation?.show && currentAnimation.type === 'my' && (
                                <span className="text-xs text-green-400 animate-bounce">+1 !</span>
                              )}
                            </div>
                            
                            <div className="flex-shrink-0 px-4">
                              <div className="text-center relative">
                                <div className="flex items-center gap-2 text-2xl font-black">
                                  <span className={`transition-all duration-500 ${currentAnimation?.show && currentAnimation.type === 'my' ? 'text-green-500 scale-125' : 'text-primary'}`}>
                                    {challenge.my_progress || 0}
                                  </span>
                                  <span className="text-muted-foreground text-lg">-</span>
                                  <span className={`transition-all duration-500 ${currentAnimation?.show && currentAnimation.type === 'opponent' ? 'text-red-500 scale-125' : 'text-orange-500'}`}>
                                    {challenge.opponent_progress || 0}
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {challenge.habit_name ? `fois "${challenge.habit_name}"` : 'habitudes complétées'}
                                </p>
                                {/* XP reward preview */}
                                <div className="mt-2 flex items-center justify-center gap-1 text-yellow-500">
                                  <Zap className="w-3 h-3" />
                                  <span className="text-[10px] font-medium">{potentialXP} XP à gagner</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-center flex-1">
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-1 shadow-lg shadow-orange-500/30 transition-transform duration-300 ${currentAnimation?.show && currentAnimation.type === 'opponent' ? 'scale-110' : ''}`}>
                                <span className="text-white font-bold">
                                  {((challenge.creator_id === user?.id ? challenge.opponent_name : challenge.creator_name) || 'A')[0].toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs text-foreground font-medium">
                                {challenge.creator_id === user?.id ? challenge.opponent_name : challenge.creator_name}
                              </span>
                              {currentAnimation?.show && currentAnimation.type === 'opponent' && (
                                <span className="text-xs text-orange-400 animate-bounce">+1 !</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Progress bar battle with animation */}
                          <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
                            <div 
                              className={`absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary/70 rounded-l-full transition-all duration-700 ${currentAnimation?.show && currentAnimation.type === 'my' ? 'animate-pulse' : ''}`}
                              style={{ width: `${Math.min(((challenge.my_progress || 0) / ((challenge.my_progress || 0) + (challenge.opponent_progress || 0) + 1)) * 100, 100)}%` }}
                            />
                            <div 
                              className={`absolute right-0 top-0 h-full bg-gradient-to-l from-orange-500 to-red-500/70 rounded-r-full transition-all duration-700 ${currentAnimation?.show && currentAnimation.type === 'opponent' ? 'animate-pulse' : ''}`}
                              style={{ width: `${Math.min(((challenge.opponent_progress || 0) / ((challenge.my_progress || 0) + (challenge.opponent_progress || 0) + 1)) * 100, 100)}%` }}
                            />
                          </div>
                          
                          {/* Dynamic motivation message */}
                          <div className="mt-2 text-center space-y-2">
                            <p className="text-xs text-muted-foreground italic">
                              {currentAnimation?.show 
                                ? (currentAnimation.type === 'my' ? "🎯 Bien joué ! Continue comme ça !" : "⚡ Ton adversaire a marqué ! Réagis vite !")
                                : (isWinning ? "🔥 Continue, tu es en tête !" : isTie ? "⚡ Match serré ! Complète tes habitudes pour prendre l'avantage" : "💪 Rattrape ton retard, tu peux le faire !")}
                            </p>
                            
                            {/* How to score explanation - Mode specific */}
                            <div className="bg-primary/10 rounded-lg p-2 border border-primary/20">
                              <p className="text-[10px] text-primary font-medium">
                                {challenge.duel_mode === 'regularity' && (
                                  <>📅 Régularité : 1 point/jour max en complétant au moins 1 habitude{challenge.habit_name ? ` (${challenge.habit_name})` : ''}</>
                                )}
                                {challenge.duel_mode === 'specific_habit' && (
                                  <>🎯 Habitude ciblée : Chaque complétion de "{challenge.habit_name}" compte !</>
                                )}
                                {challenge.duel_mode === 'streak' && (
                                  <>🔥 Série : Plus longue série consécutive de "{challenge.habit_name}" gagne !</>
                                )}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 mt-1 text-[10px] text-primary hover:bg-primary/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/habits');
                                }}
                              >
                                👉 Aller aux Habitudes
                              </Button>
                            </div>
                          </div>
                          
                          {/* Cheer button */}
                          <div className="flex items-center justify-end mt-3 pt-2 border-t border-white/10">
                            {!cheeredChallenges.includes(challenge.id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-400 hover:from-green-500/20 hover:to-emerald-500/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const opponentId = challenge.creator_id === user?.id ? challenge.opponent_id : challenge.creator_id;
                                  cheerChallenge(challenge.id, opponentId);
                                }}
                              >
                                👏 Encourager l'adversaire
                              </Button>
                            )}
                            {cheeredChallenges.includes(challenge.id) && (
                              <span className="text-xs text-green-400 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Encouragé !
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {challenge.description && (
                        <p className="text-xs text-muted-foreground relative z-10">{challenge.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between pt-3 border-t border-white/5 relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {challenge.target_value}j
                          </span>
                          <span className={`text-[10px] px-2 py-1 rounded-full flex items-center gap-1 ${
                            daysLeft <= 2 ? 'bg-red-500/20 text-red-400' : 'bg-muted/50 text-muted-foreground'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {daysLeft === 0 ? 'Dernier jour !' : `${daysLeft}j`}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px] text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            quitChallenge(challenge.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Abandonner
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {challenges.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <Swords className="w-10 h-10 text-red-500/50" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">Aucun duel en cours</h3>
                <p className="text-sm mb-4">Lance un duel à un ami pour commencer !</p>
                
                {/* Why duels section */}
                <div className="glass rounded-xl p-4 border border-white/10 text-left max-w-sm mx-auto">
                  <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Pourquoi faire des duels ?
                  </h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Trophy className="w-3.5 h-3.5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>Gagne des <span className="text-yellow-500 font-medium">badges exclusifs</span> en remportant des duels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Flame className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>Construis ta <span className="text-orange-500 font-medium">série de victoires</span> pour monter dans le classement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                      <span>La <span className="text-primary font-medium">compétition amicale</span> te motive à tenir tes habitudes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Award className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Gagne jusqu'à <span className="text-green-500 font-medium">150 XP par duel</span> remporté</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <Button 
              variant="outline" 
              className="w-full border-dashed border-red-500/40 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 h-12 rounded-xl group" 
              onClick={() => setChallengeDialogOpen(true)}
            >
              <Swords className="w-4 h-4 mr-2 group-hover:rotate-45 transition-transform duration-300" />
              <span>Lancer un nouveau duel</span>
              <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">+XP</span>
            </Button>
          </TabsContent>

          {/* Tab: Palmarès */}
          <TabsContent value="ranking" className="space-y-3 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Palmarès des duels
              </h2>
            </div>

            {/* My stats - Enhanced */}
            <div className="glass rounded-2xl p-5 border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14 ring-2 ring-primary/50">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-xl">
                      {(profile?.full_name || 'T')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">Toi</h3>
                    <p className="text-xs text-primary">Champion en devenir</p>
                  </div>
                </div>
              </div>
              
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-yellow-500/10 rounded-xl p-3 text-center border border-yellow-500/20">
                  <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="font-black text-2xl text-foreground">{(profile as any)?.duel_wins || 0}</span>
                  <p className="text-[10px] text-muted-foreground">victoires</p>
                </div>
                <div className="bg-orange-500/10 rounded-xl p-3 text-center border border-orange-500/20">
                  <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="font-black text-2xl text-foreground">{(profile as any)?.duel_streak || 0}</span>
                  <p className="text-[10px] text-muted-foreground">série</p>
                </div>
                <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20">
                  <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="font-black text-2xl text-foreground">{((profile as any)?.duel_wins || 0) * 100}</span>
                  <p className="text-[10px] text-muted-foreground">XP gagnés</p>
                </div>
              </div>
              
              {/* Progress to next badge */}
              {((profile as any)?.duel_wins || 0) < 5 && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Prochain badge : Maître des duels</span>
                    <span className="text-yellow-500 font-medium">{(profile as any)?.duel_wins || 0}/5</span>
                  </div>
                  <Progress value={((profile as any)?.duel_wins || 0) / 5 * 100} className="h-2" />
                </div>
              )}
            </div>

            {rankedFriends.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Ajoute des amis pour voir le classement</p>
                <p className="text-xs mt-1">Tes amis apparaîtront ici avec leurs victoires</p>
              </div>
            ) : (
              rankedFriends.map((friend, index) => (
                <div 
                  key={friend.id} 
                  className={`glass rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.02] cursor-pointer animate-fade-in relative overflow-hidden group ${
                    index === 0 ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-transparent shadow-lg shadow-yellow-500/20' : 
                    index === 1 ? 'border-gray-400/50 bg-gradient-to-br from-gray-400/10 to-transparent' : 
                    index === 2 ? 'border-amber-600/50 bg-gradient-to-br from-amber-600/10 to-transparent' : 
                    'border-white/5 hover:border-primary/30'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {index < 3 && (
                    <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                      <Trophy className={`w-full h-full ${
                        index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'
                      }`} />
                    </div>
                  )}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950 shadow-yellow-500/50' : 
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900 shadow-gray-500/50' : 
                        index === 2 ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-amber-950 shadow-amber-500/50' : 
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                      <Avatar className="w-10 h-10 ring-2 ring-white/10">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                          {(friend.profile.full_name || 'A')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">{friend.profile.full_name}</h3>
                        <p className="text-xs text-muted-foreground">#{friend.profile.friend_code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-full">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-yellow-400">{(friend.profile as any).duel_wins || 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">victoires</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Tab: Notifications */}
          <TabsContent value="notifications" className="space-y-3 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-foreground">Notifications</h2>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs"
                onClick={() => setNotificationSettingsOpen(!notificationSettingsOpen)}
              >
                <Bell className="w-3 h-3 mr-1" />
                Paramètres
              </Button>
            </div>

            {notificationSettingsOpen && (
              <div className="glass rounded-xl p-4 border border-white/10 space-y-3 mb-4">
                <h3 className="text-sm font-medium text-foreground">Préférences de notification</h3>
                <div className="space-y-2">
                  {[
                    { key: 'friendRequests', label: 'Demandes d\'amis' },
                    { key: 'challenges', label: 'Duels et défis' },
                    { key: 'motivations', label: 'Encouragements' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <Switch 
                        checked={notifPreferences[key as keyof typeof notifPreferences]}
                        onCheckedChange={(checked) => updateNotifPreferences({ [key]: checked })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif, index) => {
                // Find pending request for friend_request notifications
                const pendingRequest = notif.type === 'friend_request' && notif.senderId
                  ? pendingRequests.find(r => r.type === 'incoming' && r.profile.id === notif.senderId)
                  : null;
                
                return (
                  <div 
                    key={notif.id}
                    className={`glass rounded-xl p-3 border transition-all duration-300 animate-fade-in ${
                      !notif.isRead ? 'border-primary/30 bg-primary/5' : 'border-white/5'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">
                          {notif.senderName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium text-foreground">{notif.senderName}</span>
                          <span className="text-muted-foreground"> {notif.message}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{notif.timestamp}</p>
                        
                        {/* Accept/Decline buttons for friend requests */}
                        {notif.type === 'friend_request' && pendingRequest && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              onClick={() => acceptFriendRequest(pendingRequest.id, notif.id)}
                              className="h-7 text-xs"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Accepter
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => declineFriendRequest(pendingRequest.id, notif.id)}
                              className="h-7 text-xs"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Refuser
                            </Button>
                          </div>
                        )}
                      </div>
                      <span className="text-lg">
                        {notif.type === 'motivation' ? '💪' : 
                         notif.type === 'challenge' ? '⚔️' : 
                         notif.type === 'achievement' ? '🏆' : 
                         notif.type === 'friend_request' ? '👋' : '🔔'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog: Profil ami détaillé */}
      <Dialog open={!!selectedFriend && !messageDialogOpen && !challengeDialogOpen} onOpenChange={() => setSelectedFriend(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-4">
              <Avatar className="w-16 h-16 ring-2 ring-primary/30">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xl">
                  {(selectedFriend?.profile.full_name || 'A')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <span className="text-lg">{selectedFriend?.profile.full_name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    #{selectedFriend?.profile.friend_code}
                  </span>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            {/* Duel stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-4 border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-transparent">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Victoires</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">{(selectedFriend?.profile as any)?.duel_wins || 0}</p>
              </div>
              <div className="glass rounded-xl p-4 border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Série de victoires</span>
                </div>
                <p className="text-2xl font-bold text-orange-400">{(selectedFriend?.profile as any)?.duel_streak || 0}</p>
              </div>
            </div>

            {/* Friend badges section */}
            <FriendBadgesSection friendId={selectedFriend?.profile.id} />

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => {
                  setSelectedOpponent(selectedFriend?.profile.id || null);
                  setSelectedFriend(null);
                  setChallengeDialogOpen(true);
                }}
                className="bg-gradient-to-r from-red-500 to-orange-500"
              >
                <Swords className="w-4 h-4 mr-2" />
                Lancer un duel
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setMessageDialogOpen(true);
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                Encourager
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleMuteFriend(selectedFriend?.profile.id || '')}
              >
                <Bell className="w-4 h-4 mr-2" />
                {mutedFriends.includes(selectedFriend?.profile.id || '') ? 'Activer notifs' : 'Muter'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => deleteFriend(selectedFriend?.id || '', selectedFriend?.profile.full_name || '')}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
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
              {['💪 Continue !', '🔥 Tu gères !', '⭐ Bravo !', '🚀 Fonce !'].map((msg) => (
                <Button
                  key={msg}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMotivation(selectedFriend?.profile.id || '', selectedFriend?.profile.full_name || '', msg)}
                  className="h-10"
                >
                  {msg}
                </Button>
              ))}
            </div>
            <div className="relative">
              <Textarea
                placeholder="Ou écris ton propre message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={2}
              />
            </div>
            <Button 
              className="w-full bg-gradient-primary"
              onClick={() => sendMotivation(selectedFriend?.profile.id || '', selectedFriend?.profile.full_name || '', customMessage || '💪 Continue !')}
              disabled={!selectedFriend}
            >
              Envoyer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Créer duel */}
      <Dialog open={challengeDialogOpen} onOpenChange={(open) => {
        setChallengeDialogOpen(open);
        if (!open) {
          setChallengeTitle("");
          setChallengeDescription("");
          setChallengeDuration(7);
          setSelectedOpponent(null);
          setSelectedHabitName("");
          setSelectedDuelMode('regularity');
        }
      }}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-red-500" />
              Lancer un duel
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Nom du duel (ex: Challenge sport)"
              value={challengeTitle}
              onChange={(e) => setChallengeTitle(e.target.value)}
            />
            
            <Textarea
              placeholder="Description (optionnel)"
              value={challengeDescription}
              onChange={(e) => setChallengeDescription(e.target.value)}
              rows={2}
            />

            {/* Duel mode selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Mode de duel
              </label>
              <div className="grid grid-cols-1 gap-2">
                {DUEL_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setSelectedDuelMode(mode.value)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
                      selectedDuelMode === mode.value 
                        ? 'bg-red-500/20 border border-red-500/50' 
                        : 'hover:bg-muted/50 border border-white/10'
                    }`}
                  >
                    <span className="text-xl">{mode.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground block">{mode.label}</span>
                      <span className="text-[10px] text-muted-foreground">{mode.description}</span>
                    </div>
                    {selectedDuelMode === mode.value && (
                      <Check className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Habit name input - Required for specific_habit and streak modes */}
            {(selectedDuelMode === 'specific_habit' || selectedDuelMode === 'streak') && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Nom de l'habitude {selectedDuelMode === 'specific_habit' && <span className="text-red-500">*</span>}
                </label>
                <Input
                  placeholder="Ex: Faire du sport, Méditer, Lire..."
                  value={selectedHabitName}
                  onChange={(e) => setSelectedHabitName(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Écris le nom de l'habitude que vous allez suivre ensemble
                </p>
              </div>
            )}
            
            {/* Duration */}
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
                    className={challengeDuration === days ? "bg-gradient-to-r from-red-500 to-orange-500" : ""}
                  >
                    {days}j
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Choisir un adversaire
              </label>
              {friends.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ajoute des amis pour lancer des duels</p>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => setSelectedOpponent(friend.profile.id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                        selectedOpponent === friend.profile.id 
                          ? 'bg-red-500/20 border border-red-500/50' 
                          : 'hover:bg-muted/50 border border-transparent'
                      }`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">
                          {(friend.profile.full_name || 'A')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">{friend.profile.full_name}</span>
                      {selectedOpponent === friend.profile.id && (
                        <Check className="w-4 h-4 text-red-500 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button 
              onClick={createDuel} 
              className="w-full bg-gradient-to-r from-red-500 to-orange-500"
              disabled={!challengeTitle.trim() || !selectedOpponent || friends.length === 0 || (selectedDuelMode === 'specific_habit' && !selectedHabitName.trim())}
            >
              <Swords className="w-4 h-4 mr-2" />
              Envoyer le duel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog for destructive actions */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Confirmer"
        cancelText="Annuler"
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }}
        variant={confirmDialog.variant}
      />

      <Navigation />
    </div>
  );
};

export default Social;
