-- Stores achievements
 create table public.achievements(
  name text primary key,
  description text not null,
  level_up integer not null
 );

-- The achievements that are stored
 insert into public.achievements (name, description, level_up) values
 ('First Step', 'Earn your first point', 1),
 ('Sprouting', 'Level up your creature to its first stage', 100),
 ('Buddy', 'Level up your creature to its second stage', 300),
 ('Champion', 'Level up your creature to its final stage', 600);

-- Points view
 create view public.user_progress with (security_invoker = true) as
 select
  p.display_name,
  p.creature,
  sum(c.points_given) as points,
  count(c.task_id) as tasks_done,
  p.role
 from public.profiles p
 left join public.completion c on c.user_id= p.id where p.id= auth.uid()
 group by p.id;

-- Achievement view
 create view public.user_achievements with (security_invoker = true) as
 select
  a.name,
  a.description,
  a.level_up,
 (select points from public.user_progress) >= a.level_up as earned from public.achievements a;
