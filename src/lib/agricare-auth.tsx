import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = { user: User | null; loading: boolean };
const AuthContext = createContext<AuthState>({ user: null, loading: true });

export function AgriAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (alive) setState({ user: data.session?.user ?? null, loading: false });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      if (alive) setState({ user: session?.user ?? null, loading: false });
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAgriAuth() {
  return useContext(AuthContext);
}