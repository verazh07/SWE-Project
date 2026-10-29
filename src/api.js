import {supabase} from "./SupabaseClient.js";

// Sign-Up, adds email + password to Supabase table
export async function signUp(email, password, name){
  // Supabase answers with data and an error (null if there isn't any)
  const {data, error}= await supabase.auth.signUp({email, password});
  // If Supabase returns an error, return it to user
  if (error){
    return error.message;
  }
  // Inserts row with info into profiles table
  const result= await supabase.from("profiles").insert({id: data.user.id, display_name: name});
  if (result.error){
    return result.error.message;
  }
  return null;
}

// Login, checks for email and password
export async function login(email, password){
  // Supabase answers with error or null
  const {error}= await supabase.auth.signInWithPassword({email, password});
  // If Supabase returns an error, return it to user
  if (error){
    return error.message;
  }
  return null;
}

// Logout function, removes login
export async function logout(){
  await supabase.auth.signOut();
}

// Get the logged-in user's name and points from the user_progress table.
export async function getProgress() {
  const { data, error } = await supabase
    .from("user_progress")
    .select("display_name, points, role")
    .single();

  if (error) {
    console.error(error);
    return null;
  }
  return { name: data.display_name, points: data.points ?? 0, role: data.role };
}

// Update user's display name in profiles table when changed
export async function updateName(userId, newName){
  const {error}= await supabase.from("profiles").update({display_name: newName}).eq("id", userId);
  if(error){
    return error.message;
  }
  return null;
}

// Achievements. Check if logged in user has earned them.
export async function getAchievements(){
  const {data, error}= await supabase.from("user_achievements").select("*").order("level_up");
  if(error){
    console.error(error);
    return [];
  }
  return data.map(function (a) {
    return {
      id: a.name,
      icon: "★",
      name: a.name,
      description: a.description,
      earned: a.earned === true,
    };
  });
}

