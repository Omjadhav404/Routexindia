'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Sparkles, 
  Shield, 
  User, 
  Truck, 
  UserCheck, 
  Sliders 
} from "lucide-react";
import { cn } from "@/lib/utils";

type RoleType = 'admin' | 'customer' | 'provider' | 'driver' | 'manager';

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({ 
  size = 12, 
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY
}: PupilProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall = ({ 
  size = 48, 
  pupilSize = 16, 
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY
}: EyeBallProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
};

interface InteractiveLoginContainerProps {
  isTyping: boolean;
  passwordLength: number;
  showPassword: boolean;
  children: React.ReactNode;
}

const InteractiveLoginContainer = ({
  isTyping,
  passwordLength,
  showPassword,
  children
}: InteractiveLoginContainerProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Blinking effect for purple character
  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;
    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());
      return blinkTimeout;
    };
    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Blinking effect for black character
  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;
    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());
      return blinkTimeout;
    };
    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Looking at each other animation when typing starts
  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => {
        setIsLookingAtEachOther(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  // Purple sneaky peeking animation when typing password and it's visible
  useEffect(() => {
    if (passwordLength > 0 && showPassword) {
      const schedulePeek = () => {
        const peekInterval = setTimeout(() => {
          setIsPurplePeeking(true);
          setTimeout(() => {
            setIsPurplePeeking(false);
          }, 800);
        }, Math.random() * 3000 + 2000);
        return peekInterval;
      };
      const firstPeek = schedulePeek();
      return () => clearTimeout(firstPeek);
    } else {
      setIsPurplePeeking(false);
    }
  }, [passwordLength, showPassword, isPurplePeeking]);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));
    return { faceX, faceY, bodySkew };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Content Section */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 text-primary-foreground">
        <div className="relative z-20">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="size-8 rounded-lg bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <span>RouteXIndia.AI</span>
          </div>
        </div>

        <div className="relative z-20 flex items-end justify-center h-[500px]">
          {/* Cartoon Characters */}
          <div className="relative" style={{ width: '550px', height: '400px' }}>
            {/* Purple tall rectangle character - Back layer */}
            <div 
              ref={purpleRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '70px',
                width: '180px',
                height: (isTyping || (passwordLength > 0 && !showPassword)) ? '440px' : '400px',
                backgroundColor: '#6C3FF5',
                borderRadius: '10px 10px 0 0',
                zIndex: 1,
                transform: (passwordLength > 0 && showPassword)
                  ? `skewX(0deg)`
                  : (isTyping || (passwordLength > 0 && !showPassword))
                    ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)` 
                    : `skewX(${purplePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              {/* Eyes */}
              <div 
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: (passwordLength > 0 && showPassword) ? `${20}px` : isLookingAtEachOther ? `${55}px` : `${45 + purplePos.faceX}px`,
                  top: (passwordLength > 0 && showPassword) ? `${35}px` : isLookingAtEachOther ? `${65}px` : `${40 + purplePos.faceY}px`,
                }}
              >
                <EyeBall 
                  size={18} 
                  pupilSize={7} 
                  maxDistance={5} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isPurpleBlinking}
                  forceLookX={(passwordLength > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={(passwordLength > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                />
                <EyeBall 
                  size={18} 
                  pupilSize={7} 
                  maxDistance={5} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isPurpleBlinking}
                  forceLookX={(passwordLength > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={(passwordLength > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                />
              </div>
            </div>

            {/* Black tall rectangle character - Middle layer */}
            <div 
              ref={blackRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '240px',
                width: '120px',
                height: '310px',
                backgroundColor: '#2D2D2D',
                borderRadius: '8px 8px 0 0',
                zIndex: 2,
                transform: (passwordLength > 0 && showPassword)
                  ? `skewX(0deg)`
                  : isLookingAtEachOther
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                    : (isTyping || (passwordLength > 0 && !showPassword))
                      ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)` 
                      : `skewX(${blackPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              {/* Eyes */}
              <div 
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: (passwordLength > 0 && showPassword) ? `${10}px` : isLookingAtEachOther ? `${32}px` : `${26 + blackPos.faceX}px`,
                  top: (passwordLength > 0 && showPassword) ? `${28}px` : isLookingAtEachOther ? `${12}px` : `${32 + blackPos.faceY}px`,
                }}
              >
                <EyeBall 
                  size={16} 
                  pupilSize={6} 
                  maxDistance={4} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isBlackBlinking}
                  forceLookX={(passwordLength > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={(passwordLength > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
                <EyeBall 
                  size={16} 
                  pupilSize={6} 
                  maxDistance={4} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isBlackBlinking}
                  forceLookX={(passwordLength > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={(passwordLength > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
              </div>
            </div>

            {/* Orange semi-circle character - Front left */}
            <div 
              ref={orangeRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '0px',
                width: '240px',
                height: '200px',
                zIndex: 3,
                backgroundColor: '#FF9B6B',
                borderRadius: '120px 120px 0 0',
                transform: (passwordLength > 0 && showPassword) ? `skewX(0deg)` : `skewX(${orangePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              {/* Eyes - just pupils, no white */}
              <div 
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: (passwordLength > 0 && showPassword) ? `${50}px` : `${82 + (orangePos.faceX || 0)}px`,
                  top: (passwordLength > 0 && showPassword) ? `${85}px` : `${90 + (orangePos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(passwordLength > 0 && showPassword) ? -5 : undefined} forceLookY={(passwordLength > 0 && showPassword) ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(passwordLength > 0 && showPassword) ? -5 : undefined} forceLookY={(passwordLength > 0 && showPassword) ? -4 : undefined} />
              </div>
            </div>

            {/* Yellow tall rectangle character - Front right */}
            <div 
              ref={yellowRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '310px',
                width: '140px',
                height: '230px',
                backgroundColor: '#E8D754',
                borderRadius: '70px 70px 0 0',
                zIndex: 4,
                transform: (passwordLength > 0 && showPassword) ? `skewX(0deg)` : `skewX(${yellowPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              {/* Eyes - just pupils, no white */}
              <div 
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: (passwordLength > 0 && showPassword) ? `${20}px` : `${52 + (yellowPos.faceX || 0)}px`,
                  top: (passwordLength > 0 && showPassword) ? `${35}px` : `${40 + (yellowPos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(passwordLength > 0 && showPassword) ? -5 : undefined} forceLookY={(passwordLength > 0 && showPassword) ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(passwordLength > 0 && showPassword) ? -5 : undefined} forceLookY={(passwordLength > 0 && showPassword) ? -4 : undefined} />
              </div>
              {/* Horizontal line for mouth */}
              <div 
                className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                style={{
                  left: (passwordLength > 0 && showPassword) ? `${10}px` : `${40 + (yellowPos.faceX || 0)}px`,
                  top: (passwordLength > 0 && showPassword) ? `${88}px` : `${88 + (yellowPos.faceY || 0)}px`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 flex items-center gap-8 text-sm text-primary-foreground/60 font-sans">
          <a href="#" className="hover:text-primary-foreground transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-primary-foreground transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-primary-foreground transition-colors">
            Contact
          </a>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute top-1/4 right-1/4 size-64 bg-primary-foreground/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      {/* Right Login Section */}
      <div className="flex items-center justify-center p-8 bg-background">
        {children}
      </div>
    </div>
  );
};

const ClerkLoginForm = () => {
  const { signIn } = useSignIn();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setError("");
    setIsLoading(true);

    try {
      const { error: signInError } = await signIn.create({
        identifier: email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Failed to sign in. Please verify your credentials.");
        setIsLoading(false);
        return;
      }

      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setError(finalizeError.message || "Failed to finalize session.");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(`Sign in status: ${signIn.status}. Additional verification may be required.`);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!signIn) return;
    try {
      const { error: ssoError } = await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/dashboard`,
        redirectCallbackUrl: `${window.location.origin}/sign-in`,
      });
      if (ssoError) {
        setError(ssoError.message || "Failed to start Google sign in.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to start Google sign in.");
    }
  };

  return (
    <InteractiveLoginContainer
      isTyping={isTyping}
      passwordLength={password.length}
      showPassword={showPassword}
    >
      <div className="w-full max-w-[420px] space-y-6">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-4">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="size-4 text-primary" />
          </div>
          <span>RouteXIndia.AI</span>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back!</h1>
          <p className="text-muted-foreground text-sm">Please enter your details</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="anna@gmail.com"
              value={email}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
              required
              className="h-12 bg-background border-border/60 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 pr-10 bg-background border-border/60 focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                Remember for 30 days
              </Label>
            </div>
            <Link
              href="/"
              className="text-sm text-primary hover:underline font-medium animate-fade-in"
            >
              Back to Home
            </Link>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-medium cursor-pointer" 
            size="lg" 
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Log in"}
          </Button>
        </form>

        {/* Social Login */}
        <div className="pt-2 border-t border-border/40">
          <Button 
            variant="outline" 
            className="w-full h-12 bg-background border-border/60 hover:bg-accent cursor-pointer"
            type="button"
            onClick={handleGoogleSignIn}
          >
            <Mail className="mr-2 size-5" />
            Log in with Google
          </Button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center text-sm text-muted-foreground mt-4">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-foreground font-medium hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </InteractiveLoginContainer>
  );
};

const MockLoginForm = () => {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleType>('customer');

  const roleEmails: Record<RoleType, string> = {
    admin: 'admin@routexindia.ai',
    customer: 'logistics@tatasteel.com',
    provider: 'dispatch@mahindra.com',
    driver: 'ramesh@driver.routexindia.ai',
    manager: 'pune.manager@routexindia.ai'
  };

  const roleNames: Record<RoleType, string> = {
    admin: 'Chief Dispatcher',
    customer: 'Tata Steel Operations',
    provider: 'Mahindra Transport Operator',
    driver: 'Ramesh Kumar (Driver)',
    manager: 'Pune Hub Manager'
  };

  // When a quick-fill role is selected, update email
  const selectRole = (role: RoleType) => {
    setSelectedRole(role);
    setEmail(roleEmails[role]);
    setPassword("1234");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API delay (quick)
    await new Promise(resolve => setTimeout(resolve, 300));

    // Simple validation
    if (!email || !password) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    // Determine role based on email or selectedRole fallback
    let matchedRole: RoleType = selectedRole;
    let matchedName = roleNames[selectedRole];

    // Check if email belongs to one of our special roles
    const emailToRole = Object.entries(roleEmails).find(([_, rEmail]) => rEmail === email);
    if (emailToRole) {
      matchedRole = emailToRole[0] as RoleType;
      matchedName = roleNames[matchedRole];
    } else if (email === "erik@gmail.com") {
      matchedRole = "customer";
      matchedName = "Erik (Demo User)";
    }

    localStorage.setItem('routex_demo_role', matchedRole);
    localStorage.setItem('routex_demo_name', matchedName);
    localStorage.setItem('routex_demo_email', email);
    localStorage.setItem('routex_authenticated', 'true');

    router.push('/dashboard');
    setIsLoading(false);
  };

  const handleMockGoogleLogin = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    localStorage.setItem('routex_demo_role', 'customer');
    localStorage.setItem('routex_demo_name', 'Google User (Demo)');
    localStorage.setItem('routex_demo_email', 'google.demo@routexindia.ai');
    localStorage.setItem('routex_authenticated', 'true');
    router.push('/dashboard');
    setIsLoading(false);
  };

  return (
    <InteractiveLoginContainer
      isTyping={isTyping}
      passwordLength={password.length}
      showPassword={showPassword}
    >
      <div className="w-full max-w-[420px] space-y-6">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-4">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="size-4 text-primary" />
          </div>
          <span>RouteXIndia.AI</span>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Welcome back!</h1>
          <p className="text-muted-foreground text-xs">Enter credentials or choose a quick demo role</p>
        </div>

        {/* Quick-fill Roles Selector */}
        <div className="space-y-2">
          <span className="block text-[10px] uppercase font-bold font-mono text-slate-500 text-center">
            Quick-Fill Operational Roles
          </span>
          <div className="grid grid-cols-5 gap-1">
            {[
              { id: 'customer', label: 'Cust', icon: User },
              { id: 'provider', label: 'Carr', icon: Truck },
              { id: 'driver', label: 'Drive', icon: UserCheck },
              { id: 'manager', label: 'Mgr', icon: Sliders },
              { id: 'admin', label: 'Admin', icon: Shield },
            ].map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id && email === roleEmails[role.id as RoleType];
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => selectRole(role.id as RoleType)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-md border text-[10px] font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary/15 border-primary text-primary shadow-[0_0_8px_rgba(37,99,235,0.15)] scale-[1.03]'
                      : 'bg-card border-border/40 text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <Icon className="size-4" />
                  <span className="truncate w-full text-center">{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="anna@gmail.com"
              value={email}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
              required
              className="h-10 bg-background border-border/60 focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 pr-10 bg-background border-border/60 focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label
                htmlFor="remember"
                className="text-xs font-normal cursor-pointer"
              >
                Remember for 30 days
              </Label>
            </div>
            <Link
              href="/"
              className="text-xs text-primary hover:underline font-medium"
            >
              Back to Home
            </Link>
          </div>

          {error && (
            <div className="p-2.5 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 text-sm font-medium cursor-pointer" 
            size="default" 
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Log in"}
          </Button>
        </form>

        {/* Social Login */}
        <div className="pt-1 border-t border-border/40">
          <Button 
            variant="outline" 
            className="w-full h-11 bg-background border-border/60 hover:bg-accent cursor-pointer text-xs"
            type="button"
            onClick={handleMockGoogleLogin}
          >
            <Mail className="mr-2 size-4" />
            Log in with Google
          </Button>
        </div>

        {/* Demo Notice */}
        <div className="p-2.5 rounded-lg bg-accent/5 border border-accent/20 text-[9px] text-accent-foreground/80 leading-normal flex gap-1.5">
          <Sparkles className="size-3 flex-shrink-0 text-accent" />
          <span>
            <strong>Note:</strong> Demonstration mode active. Select a quick role or enter credentials to sign in instantly.
          </span>
        </div>
      </div>
    </InteractiveLoginContainer>
  );
};

export default function SignInPage() {
  const [isMounted, setIsMounted] = useState(false);
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (hasClerkKey) {
    return <ClerkLoginForm />;
  }

  return <MockLoginForm />;
}
