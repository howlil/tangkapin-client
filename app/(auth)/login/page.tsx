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
    <>
      <style jsx global>{`
        .glassmorphism-login {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
        }
        
        .accent-gradient {
          background: linear-gradient(135deg, #A1F553, #E3F553);
        }
        
        .accent-gradient-text {
          background: linear-gradient(135deg, #A1F553, #E3F553);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .soft-shadow {
          box-shadow: 0 4px 20px 0 rgba(161, 245, 83, 0.15);
        }
        
        .glass-input {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          transition: all 0.3s ease;
        }
        
        .glass-input:focus {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(161, 245, 83, 0.5);
          box-shadow: 0 0 0 3px rgba(161, 245, 83, 0.1);
        }
        
        .accent-button {
          background: linear-gradient(135deg, #A1F553, #E3F553);
          color: #1a1a1a;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px 0 rgba(161, 245, 83, 0.3);
        }
        
        .accent-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px 0 rgba(161, 245, 83, 0.4);
        }
        
        .accent-button:disabled {
          opacity: 0.7;
          transform: none;
        }
        
        .logo-glow {
          box-shadow: 0 0 40px rgba(161, 245, 83, 0.4);
        }
        
        .animated-bg {
          background: linear-gradient(-45deg, #f0f0f0, #ffffff, #f5f5f5, #e8e8e8);
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .floating {
          animation: floating 3s ease-in-out infinite;
        }
        
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
      
      <div className="min-h-screen flex items-center justify-center animated-bg">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-lime-50/50 via-transparent to-yellow-50/50" />
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-lime-200/30 to-yellow-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-yellow-200/30 to-lime-200/30 rounded-full blur-3xl" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md px-4 z-10"
        >
          <Card className="w-full glassmorphism-login border-0 overflow-hidden">
            <CardHeader className="space-y-6 text-center pb-8 pt-10">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                className="flex justify-center mb-4 relative"
              >
                <div className="relative floating">
                  <div className="w-28 h-28 rounded-3xl overflow-hidden bg-white soft-shadow logo-glow">
                    <div className="absolute inset-0 accent-gradient opacity-90" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl font-black text-gray-800 drop-shadow-lg">T</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full accent-gradient animate-pulse" />
                </div>
              </motion.div>
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CardTitle className="text-3xl font-black text-gray-800">
                  TangkapIn
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  Sistem Informasi Kepolisian Terpadu
                </CardDescription>
              </motion.div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 px-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    className="glass-input h-12 px-4 text-gray-800 placeholder:text-gray-500 rounded-xl border-0"
                    value={email ?? ''}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password" className="text-gray-700 font-semibold">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="glass-input h-12 px-4 text-gray-800 placeholder:text-gray-500 rounded-xl border-0"
                    value={password ?? ''}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </motion.div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-5 pb-10 px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full"
                >
                  <Button
                    type="submit"
                    className="w-full accent-button h-12 rounded-xl text-base border-0"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2 h-5 w-5 border-2 border-gray-800 border-t-transparent rounded-full"
                      />
                    ) : null}
                    {isLoading ? "Memproses..." : "Masuk"}
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-center"
                >
                  <a href="#" className="accent-gradient-text font-semibold hover:opacity-80 transition-opacity">
                    Lupa password?
                  </a>
                </motion.div>
              </CardFooter>
            </form>
          </Card>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-600">
              © 2024 TangkapIn. All rights reserved.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}