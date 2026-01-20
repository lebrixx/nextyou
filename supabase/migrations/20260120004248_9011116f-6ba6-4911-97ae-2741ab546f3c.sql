-- Server-side cancellation to avoid RLS issues when opponent quits
-- Creates a SECURITY DEFINER function that cancels the duel, deletes duel habits for both users (specific_habit), clears participants, and notifies opponent.

create or replace function public.cancel_duel(_challenge_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_actor_name text;
  v_opponent uuid;
  v_challenge public.challenges%rowtype;
  v_message text;
begin
  v_actor := auth.uid();
  if v_actor is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_challenge
  from public.challenges
  where id = _challenge_id
    and type = 'duel'
  limit 1;

  if not found then
    raise exception 'challenge_not_found';
  end if;

  if v_challenge.creator_id <> v_actor and v_challenge.opponent_id <> v_actor then
    raise exception 'not_authorized';
  end if;

  select coalesce(p.full_name, 'Ton adversaire')
  into v_actor_name
  from public.profiles p
  where p.id = v_actor;

  v_opponent := case
    when v_challenge.creator_id = v_actor then v_challenge.opponent_id
    else v_challenge.creator_id
  end;

  -- Mark cancelled (idempotent)
  update public.challenges
    set status = 'cancelled',
        updated_at = now()
  where id = _challenge_id;

  -- Delete duel habits for both participants when duel targets a specific habit
  if v_challenge.duel_mode = 'specific_habit' and v_challenge.habit_name is not null then
    delete from public.habits
    where category = 'duel'
      and user_id in (v_challenge.creator_id, v_challenge.opponent_id)
      and name ilike ('%' || v_challenge.habit_name || '%');
  end if;

  -- Clear participants (idempotent)
  delete from public.challenge_participants
  where challenge_id = _challenge_id;

  -- Notify opponent
  if v_opponent is not null then
    if v_challenge.duel_mode = 'specific_habit' and v_challenge.habit_name is not null then
      v_message := format('%s a abandonné le duel "%s". Le défi est annulé. L''habitude "%s" a été retirée.', v_actor_name, v_challenge.title, v_challenge.habit_name);
    else
      v_message := format('%s a abandonné le duel "%s". Le défi est annulé.', v_actor_name, v_challenge.title);
    end if;

    insert into public.social_notifications (sender_id, recipient_id, type, message)
    values (v_actor, v_opponent, 'duel_update', v_message);
  end if;
end;
$$;

-- Lock down function execution to authenticated users only
revoke all on function public.cancel_duel(uuid) from public;
grant execute on function public.cancel_duel(uuid) to authenticated;