"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/app/hooks/useAuth";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(email, password);
      
      toast({
        title: "Login berhasil",
        description: "Selamat datang kembali!",
      });

      router.push('/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat login",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-background to-green-50/50 opacity-50" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md px-4 z-10"
      >
        <Card className="w-full shadow-xl border-muted bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-6 text-center pb-8">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="flex justify-center mb-2 relative"
            >
              <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-green-500/20 bg-white">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10" />
                <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-green-600">
                  T
                </div>
              </div>
            </motion.div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-foreground">
                TangkapIn
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sistem Informasi Kepolisian Terpadu
              </CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  required
                  className="w-full bg-background/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-background/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </motion.div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full"
              >
                <Button
                  type="submit"
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                    />
                  ) : null}
                  {isLoading ? "Memproses..." : "Masuk"}
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-center text-muted-foreground"
              >
                <a href="#" className="text-green-600 hover:text-green-700 hover:underline transition-colors">
                  Lupa password?
                </a>
              </motion.div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
} 