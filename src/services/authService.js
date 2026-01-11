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
    redirectTo: "https://invoixa-two.vercel.app/reset-password",
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
