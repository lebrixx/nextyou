import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useChallengeProgress = (userId: string | undefined) => {
  
  // Update challenge progress when habit is completed
  const updateChallengeProgress = useCallback(async () => {
    if (!userId) return;
    
    try {
      // Get active challenges for this user
      const { data: participations } = await supabase
        .from('challenge_participants')
        .select('id, challenge_id, progress, accepted')
        .eq('user_id', userId)
        .eq('accepted', true);
      
      if (!participations?.length) return;
      
      const today = new Date().toISOString().split('T')[0];
      
      for (const participation of participations) {
        // Get the challenge details
        const { data: challenge } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', participation.challenge_id)
          .eq('status', 'active')
          .single();
        
        if (!challenge) continue;
        
        // Count completions during challenge period (filter by habit if specified)
        let query = supabase
          .from('habit_completions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('completed_at', challenge.start_date)
          .lte('completed_at', challenge.end_date);
        
        // If challenge has a specific habit, only count that habit
        if (challenge.habit_id) {
          query = query.eq('habit_id', challenge.habit_id);
        }
        
        const { count } = await query;
        
        const newProgress = count || 0;
        
        // Update progress if changed
        if (newProgress !== participation.progress) {
          await supabase
            .from('challenge_participants')
            .update({ progress: newProgress })
            .eq('id', participation.id);
          
          // Check if opponent is falling behind (for notifications)
          if (challenge.type === 'duel') {
            const opponentId = challenge.creator_id === userId ? challenge.opponent_id : challenge.creator_id;
            
            if (opponentId) {
              const { data: opponentParticipation } = await supabase
                .from('challenge_participants')
                .select('progress')
                .eq('challenge_id', challenge.id)
                .eq('user_id', opponentId)
                .single();
              
              const opponentProgress = opponentParticipation?.progress || 0;
              
              // If user just passed opponent, notify them
              if (newProgress > opponentProgress && participation.progress <= opponentProgress) {
                const { data: userProfile } = await supabase
                  .from('profiles')
                  .select('full_name')
                  .eq('id', userId)
                  .single();
                
                await supabase
                  .from('social_notifications')
                  .insert({
                    sender_id: userId,
                    recipient_id: opponentId,
                    type: 'challenge',
                    message: `${userProfile?.full_name || 'Ton adversaire'} vient de te dépasser dans "${challenge.title}" ! Score: ${newProgress} vs ${opponentProgress} 🔥`
                  });
              }
            }
          }
        }
        
        // Check if challenge is complete (end date passed)
        if (new Date(challenge.end_date) < new Date()) {
          await finishChallenge(challenge.id, userId);
        }
      }
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  }, [userId]);

  // Finish a challenge and determine winner
  const finishChallenge = async (challengeId: string, currentUserId: string) => {
    try {
      const { data: challenge } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();
      
      if (!challenge || challenge.status !== 'active') return;
      
      const { data: participants } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('challenge_id', challengeId);
      
      if (!participants?.length) return;
      
      // Find winner (highest progress)
      let winnerId: string | null = null;
      let loserId: string | null = null;
      let winnerScore = 0;
      let loserScore = 0;
      
      if (challenge.type === 'duel' && participants.length >= 2) {
        const sorted = participants.sort((a, b) => b.progress - a.progress);
        winnerId = sorted[0].user_id;
        loserId = sorted[1].user_id;
        winnerScore = sorted[0].progress;
        loserScore = sorted[1].progress;
      }
      
      // Update challenge status
      await supabase
        .from('challenges')
        .update({ status: 'completed', winner_id: winnerId })
        .eq('id', challengeId);
      
      // Record duel result
      if (challenge.type === 'duel') {
        await supabase
          .from('duel_results')
          .upsert({
            challenge_id: challengeId,
            winner_id: winnerId,
            loser_id: loserId,
            winner_score: winnerScore,
            loser_score: loserScore,
            badge_awarded: false
          }, { onConflict: 'challenge_id' });
        
        // Update winner's profile with duel stats
        if (winnerId) {
          // Increment duel wins and streak
          await supabase.rpc('increment_duel_wins', { _user_id: winnerId });
          
          // Award badges
          const { data: existingBadge } = await supabase
            .from('badges')
            .select('id')
            .eq('user_id', winnerId)
            .eq('badge_type', 'duel_winner')
            .maybeSingle();
          
          if (!existingBadge) {
            await supabase
              .from('badges')
              .insert({
                user_id: winnerId,
                badge_type: 'duel_winner',
                badge_name: 'Champion de duel',
                badge_description: 'A gagné son premier duel contre un ami'
              });
          }
          
          // Count total duel wins for milestone badges
          const { count: duelWins } = await supabase
            .from('duel_results')
            .select('*', { count: 'exact', head: true })
            .eq('winner_id', winnerId);
          
          // Award milestone badges
          if (duelWins === 5) {
            await supabase
              .from('badges')
              .insert({
                user_id: winnerId,
                badge_type: 'duel_master',
                badge_name: 'Maître des duels',
                badge_description: 'A gagné 5 duels - Domination totale !'
              });
          }
          
          if (duelWins === 10) {
            await supabase
              .from('badges')
              .insert({
                user_id: winnerId,
                badge_type: 'duel_legend',
                badge_name: 'Légende des duels',
                badge_description: 'A gagné 10 duels - Imbattable !'
              });
          }
          
          // Update duel_results badge status
          await supabase
            .from('duel_results')
            .update({ badge_awarded: true })
            .eq('challenge_id', challengeId);
          
          // Calculate XP earned (base XP * bonus for winning margin)
          const marginBonus = Math.min(winnerScore - loserScore, 5) * 10;
          const xpEarned = 100 + marginBonus;
          
          // Notify winner with XP info
          await supabase
            .from('social_notifications')
            .insert({
              sender_id: currentUserId,
              recipient_id: winnerId,
              type: 'achievement',
              message: `🏆 Victoire ! Tu as gagné le duel "${challenge.title}" ! Score: ${winnerScore} - ${loserScore}. +${xpEarned} XP gagnés !`
            });
          
          // Notify loser and reset their streak
          if (loserId) {
            await supabase.rpc('reset_duel_streak', { _user_id: loserId });
            
            await supabase
              .from('social_notifications')
              .insert({
                sender_id: currentUserId,
                recipient_id: loserId,
                type: 'challenge',
                message: `Le duel "${challenge.title}" est terminé. Score: ${loserScore} - ${winnerScore}. Prêt pour une revanche ? 💪`
              });
          }
        }
      }
      
      toast({
        title: "🏆 Défi terminé !",
        description: winnerId === currentUserId ? "Tu as gagné ! Bravo champion !" : "Le défi est terminé, retente ta chance !"
      });
    } catch (error) {
      console.error('Error finishing challenge:', error);
    }
  };

  // Post activity to groups when habit completed
  const postHabitActivityToGroups = async (habitName: string) => {
    if (!userId) return;
    
    try {
      // Get user's groups
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);
      
      const { data: ownedGroups } = await supabase
        .from('groups')
        .select('id')
        .eq('owner_id', userId);
      
      const groupIds = new Set<string>();
      if (memberships) memberships.forEach(m => groupIds.add(m.group_id));
      if (ownedGroups) ownedGroups.forEach(g => groupIds.add(g.id));
      
      // Post activity to each group
      for (const groupId of groupIds) {
        await supabase
          .from('group_activity')
          .insert({
            group_id: groupId,
            user_id: userId,
            activity_type: 'habit_completed',
            habit_name: habitName
          });
        
        // Update group stats
        await supabase
          .from('group_stats')
          .upsert({
            group_id: groupId,
            total_habits_completed: 1,
            weekly_progress: 1,
            last_activity_date: new Date().toISOString().split('T')[0]
          }, { 
            onConflict: 'group_id',
            ignoreDuplicates: false 
          });
      }
    } catch (error) {
      console.error('Error posting activity to groups:', error);
    }
  };

  return {
    updateChallengeProgress,
    postHabitActivityToGroups
  };
};
