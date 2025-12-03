import { useState, useEffect } from "react";
import { Users, UserPlus, Bell, Crown, Plus, Copy, Check, Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

const Social = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Dialog states
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [joinGroupOpen, setJoinGroupOpen] = useState(false);
  
  // Form states
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [groupInviteCode, setGroupInviteCode] = useState("");

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
    // Get groups where user is owner or member
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
      .select(`
        id,
        status,
        friend_id,
        user_id
      `)
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
    
    // Check if already member
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', user.id)
      .single();
    
    if (existing || group.owner_id === user.id) {
      toast({ title: "Info", description: "Tu fais déjà partie de ce groupe" });
      setJoinGroupOpen(false);
      return;
    }
    
    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id
      });
    
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
      .single();
    
    if (!friendProfile) {
      toast({ title: "Erreur", description: "Code ami invalide", variant: "destructive" });
      return;
    }
    
    if (friendProfile.id === user.id) {
      toast({ title: "Erreur", description: "Tu ne peux pas t'ajouter toi-même", variant: "destructive" });
      return;
    }
    
    // Check existing friendship - check both directions
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
    
    const existing = existing1 || existing2;
    
    if (existing) {
      toast({ title: "Info", description: "Demande déjà envoyée ou ami existant" });
      return;
    }
    
    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: friendProfile.id,
        status: 'accepted' // Auto-accept for simplicity
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

  const sendMotivation = async (friendId: string, friendName: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('social_notifications')
      .insert({
        sender_id: user.id,
        recipient_id: friendId,
        type: 'motivation',
        message: `${profile?.full_name || 'Un ami'} t'encourage à faire tes habitudes aujourd'hui ! 💪`
      });
    
    if (error) {
      toast({ title: "Erreur", description: "Impossible d'envoyer la notification", variant: "destructive" });
      return;
    }
    
    toast({ title: "Encouragement envoyé à " + friendName + " !" });
  };

  const sendGroupMotivation = async (groupId: string, groupName: string) => {
    if (!user) return;
    
    // Get all group members
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
    allMemberIds.delete(user.id); // Don't send to self
    
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="px-6 pt-safe-offset-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-2xl font-bold text-foreground">Social</h1>
            </div>
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
      <header className="px-6 pt-safe-offset-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Social</h1>
          </div>
          <button onClick={() => navigate('/premium')} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
            <Crown className="w-5 h-5 text-primary" />
          </button>
        </div>
      </header>

      <main className="px-6 space-y-6 max-w-2xl mx-auto">
        {/* Mon code ami */}
        <section className="glass rounded-xl p-5 border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mon code ami</p>
              <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent tracking-widest">
                {profile?.friend_code || '--------'}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyFriendCode}
              className="border-primary/30"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Partage ce code pour que tes amis puissent t'ajouter
          </p>
        </section>

        {/* Actions rapides */}
        <section className="grid grid-cols-3 gap-3">
          <Dialog open={addFriendOpen} onOpenChange={setAddFriendOpen}>
            <DialogTrigger asChild>
              <button className="glass rounded-xl p-4 text-center border border-white/5 hover:border-primary/30 transition-colors">
                <UserPlus className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium text-foreground">Ajouter ami</p>
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
              <button className="glass rounded-xl p-4 text-center border border-white/5 hover:border-primary/30 transition-colors">
                <Plus className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium text-foreground">Créer groupe</p>
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
                <Input
                  placeholder="Description (optionnel)"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                />
                <Button onClick={createGroup} className="w-full bg-gradient-primary">
                  Créer
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={joinGroupOpen} onOpenChange={setJoinGroupOpen}>
            <DialogTrigger asChild>
              <button className="glass rounded-xl p-4 text-center border border-white/5 hover:border-primary/30 transition-colors">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
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

        {/* Mes groupes */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Mes groupes d'entraide
          </h2>
          
          {groups.length === 0 ? (
            <div className="glass rounded-xl p-6 text-center border border-white/5">
              <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aucun groupe pour le moment</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Crée ou rejoins un groupe pour t'entraider
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <div key={group.id} className="glass rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{group.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          Code: {group.invite_code}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => sendGroupMotivation(group.id, group.name)}
                      className="text-primary hover:bg-primary/10"
                    >
                      <Bell className="w-5 h-5" />
                    </Button>
                  </div>
                  {group.description && (
                    <p className="text-xs text-muted-foreground mt-2 ml-13">
                      {group.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Mes amis */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Mes amis
          </h2>
          
          {friends.length === 0 ? (
            <div className="glass rounded-xl p-6 text-center border border-white/5">
              <UserPlus className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aucun ami pour le moment</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Ajoute des amis avec leur code ami
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div key={friend.id} className="glass rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={friend.profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                          {(friend.profile.full_name || 'A')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {friend.profile.full_name || 'Ami'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {friend.profile.friend_code}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => sendMotivation(friend.profile.id, friend.profile.full_name || 'Ami')}
                      className="text-primary hover:bg-primary/10"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Info box */}
        <section className="glass rounded-xl p-4 border border-primary/20">
          <p className="text-xs text-muted-foreground text-center">
            💡 Envoie des notifications à tes amis et groupes pour les encourager à maintenir leurs habitudes !
          </p>
        </section>
      </main>

      <Navigation />
    </div>
  );
};

export default Social;
