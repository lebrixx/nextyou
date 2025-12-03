import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Friend {
  id: string;
  friend_id: string;
  status: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    friend_code: string | null;
  };
}

interface FriendRequest {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useFriends = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [myFriendCode, setMyFriendCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMyFriendCode = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('friend_code')
      .eq('id', user.id)
      .single();

    if (data) {
      setMyFriendCode(data.friend_code);
    }
  };

  const fetchFriends = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch accepted friendships where I'm the requester
    const { data: sentFriends } = await supabase
      .from('friendships')
      .select('id, friend_id, status, created_at')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    // Fetch accepted friendships where I'm the receiver
    const { data: receivedFriends } = await supabase
      .from('friendships')
      .select('id, user_id, status, created_at')
      .eq('friend_id', user.id)
      .eq('status', 'accepted');

    const allFriends: Friend[] = [];

    // Process sent friendships
    if (sentFriends) {
      for (const f of sentFriends) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, friend_code')
          .eq('id', f.friend_id)
          .single();
        
        allFriends.push({
          ...f,
          profile: profile || undefined
        });
      }
    }

    // Process received friendships
    if (receivedFriends) {
      for (const f of receivedFriends) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, friend_code')
          .eq('id', f.user_id)
          .single();
        
        allFriends.push({
          id: f.id,
          friend_id: f.user_id,
          status: f.status,
          created_at: f.created_at,
          profile: profile || undefined
        });
      }
    }

    setFriends(allFriends);
  };

  const fetchPendingRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('friendships')
      .select('id, user_id, status, created_at')
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    if (data) {
      const requestsWithProfiles: FriendRequest[] = [];
      for (const req of data) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', req.user_id)
          .single();
        
        requestsWithProfiles.push({
          ...req,
          profile: profile || undefined
        });
      }
      setPendingRequests(requestsWithProfiles);
    }
  };

  const sendFriendRequest = async (friendCode: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Erreur",
        description: "Tu dois être connecté",
        variant: "destructive"
      });
      return false;
    }

    if (friendCode.toUpperCase() === myFriendCode?.toUpperCase()) {
      toast({
        title: "Erreur",
        description: "Tu ne peux pas t'ajouter toi-même",
        variant: "destructive"
      });
      return false;
    }

    // Find user by friend code
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id')
      .ilike('friend_code', friendCode)
      .single();

    if (!targetProfile) {
      toast({
        title: "Erreur",
        description: "Code ami introuvable",
        variant: "destructive"
      });
      return false;
    }

    // Check if friendship already exists
    const { data: existingFriendship } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${targetProfile.id}),and(user_id.eq.${targetProfile.id},friend_id.eq.${user.id})`)
      .single();

    if (existingFriendship) {
      toast({
        title: "Info",
        description: existingFriendship.status === 'pending' 
          ? "Une demande est déjà en attente" 
          : "Vous êtes déjà amis"
      });
      return false;
    }

    // Create friendship request
    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: targetProfile.id,
        status: 'pending'
      });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande",
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Demande envoyée",
      description: "Ta demande d'ami a été envoyée"
    });
    return true;
  };

  const acceptFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la demande",
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Ami ajouté",
      description: "Vous êtes maintenant amis"
    });
    
    await fetchFriends();
    await fetchPendingRequests();
    return true;
  };

  const rejectFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', requestId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de refuser la demande",
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Demande refusée",
      description: "La demande a été refusée"
    });
    
    await fetchPendingRequests();
    return true;
  };

  const removeFriend = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'ami",
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Ami supprimé",
      description: "L'ami a été supprimé de ta liste"
    });
    
    await fetchFriends();
    return true;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchMyFriendCode(),
        fetchFriends(),
        fetchPendingRequests()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    friends,
    pendingRequests,
    myFriendCode,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    refreshFriends: fetchFriends,
    refreshRequests: fetchPendingRequests
  };
};
