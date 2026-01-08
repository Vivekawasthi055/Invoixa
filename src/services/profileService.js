import { supabase } from "./supabaseClient";

// 🔹 Get auth profile (role, profile_completed)
export const getProfile = async (userId) => {
  return await supabase
    .from("profiles")
    .select("id, role, profile_completed")
    .eq("id", userId)
    .single();
};

// 🔹 Update hotel profile completion flag
export const markProfileCompleted = async (userId) => {
  return await supabase
    .from("profiles")
    .update({ profile_completed: true })
    .eq("id", userId);
};
