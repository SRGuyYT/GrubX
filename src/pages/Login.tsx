import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await login(email, password);
      setLocation("/");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setErrorMsg("GX-AUTH-001: Invalid email or password.");
      } else if (code === "auth/too-many-requests") {
        setErrorMsg("GX-AUTH-003: Too many attempts. Please try again later.");
      } else {
        setErrorMsg("GX-AUTH-002: Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

      <div className="relative z-10 w-full max-w-md p-8 md:p-12 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-3xl tracking-tighter mb-2">
            <span>GRUBED</span>
            <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-sm leading-none">X</span>
          </Link>
          <h1 className="text-2xl font-semibold text-white mt-4">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to continue your cinematic journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 bg-white/5 border-white/10 text-white text-base rounded-lg focus-visible:ring-primary focus-visible:border-primary placeholder:text-white/40"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 bg-white/5 border-white/10 text-white text-base rounded-lg focus-visible:ring-primary focus-visible:border-primary placeholder:text-white/40"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-lg group"
            disabled={loading}
          >
            {loading ? (
              "Signing In..."
            ) : (
              <span className="flex items-center gap-2">
                Sign In <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-muted-foreground mt-8">
          New to Grubed X?{" "}
          <Link href="/register" className="text-white hover:text-primary transition-colors font-medium">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
