import { supabase } from "./supabaseClient";

export const loginUser = async (email, password) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const logoutUser = async () => {
  return await supabase.auth.signOut({ scope: "local" });
};

export const forgotPassword = async (email) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

export const onAuthChange = (callback) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
};

export const checkEmailRegistered = async (email) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (error || !data) {
    return { exists: false };
  }

  return { exists: true };
};
