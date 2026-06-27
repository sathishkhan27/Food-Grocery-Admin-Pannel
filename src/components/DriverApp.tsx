/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Navigation, ShieldAlert, CheckCircle2, MessageSquare, Phone, 
  ChevronRight, Play, Check, Power, Star, Send, Compass, Sparkles,
  User, Upload, ShieldCheck, HelpCircle, ArrowRight, BookOpen, Clock, FileText, Plus, Zap
} from "lucide-react";
import { AppState, Order, OrderStatus, Driver, LatLng } from "../types.js";
import SimulatedMap from "./SimulatedMap.js";

interface DriverOnboardingProps {
  onComplete: (registeredDriver: Driver) => void;
}

function DriverOnboarding({ onComplete }: DriverOnboardingProps) {
  const [step, setStep] = useState(0); // 0: Welcomes, 1: Forms, 2: Document uploads, 3: Background scan, 4: Quick tips
  const [tutorialIndex, setTutorialIndex] = useState(0);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("E-Bike ⚡️");
  const [plateNumber, setPlateNumber] = useState("");

  // Document states
  const [licenseFile, setLicenseFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Background state
  const [bgStatus, setBgStatus] = useState<"not_started" | "running_scan" | "running_dmv" | "approved">("not_started");
  const [bgProgress, setBgProgress] = useState(0);

  const tutorials = [
    {
      title: "💼 Deliver & Earn on Your Terms",
      desc: "Flexible shifts, instant payouts, and optimized delivery queues. Pick your preferred delivery hubs and transport.",
      image: "https://images.unsplash.com/photo-1526367790999-015078648c7e?w=400&h=240&fit=crop"
    },
    {
      title: "🧭 Intelligent AI-Suggested Paths",
      desc: "Avoid active construction blockages or morning gridlocks. Get optimized alternate routes computed instantly by Gemini.",
      image: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=400&h=240&fit=crop"
    },
    {
      title: "🤝 High Density Communication",
      desc: "Resolve delivery issues on the fly with real-time customer chats, read receipts, and handy quick response templates.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=240&fit=crop"
    }
  ];

  const handleNextTutorial = () => {
    if (tutorialIndex < tutorials.length - 1) {
      setTutorialIndex(prev => prev + 1);
    } else {
      setStep(1);
    }
  };

  const handleUploadDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      setUploadProgress(10);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setLicenseFile(e.target.files![0].name);
            return 100;
          }
          return prev + 30;
        });
      }, 400);
    }
  };

  const handleStartBackgroundCheck = () => {
    setBgStatus("running_scan");
    setBgProgress(10);
    const interval = setInterval(() => {
      setBgProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBgStatus("approved");
          return 100;
        }
        if (prev === 50) {
          setBgStatus("running_dmv");
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleRegisterDriver = async () => {
    try {
      const res = await fetch("/api/driver/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          vehicle,
          plateNumber: plateNumber || undefined
        })
      });
      const parsed = await res.json();
      if (parsed.success) {
        onComplete(parsed.driver);
      } else {
        alert(parsed.error || "Failed to register driver");
      }
    } catch (err) {
      console.error(err);
      alert("Registration error");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 font-sans select-none relative overflow-y-auto">
      {/* Device Header */}
      <div className="bg-white border-b border-slate-100 p-4 shrink-0 flex items-center justify-between shadow-xs pt-6">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-orange-600 rounded-full" />
          <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase">Driver Registration</h2>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full font-mono">STEP {step + 1}/5</span>
      </div>

      <div className="flex-1 p-5 flex flex-col justify-between space-y-6">
        {/* Step 0: Welcome Slide Tutorials */}
        {step === 0 && (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4 text-center">
              <div className="h-44 rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative">
                <img src={tutorials[tutorialIndex].image} alt={tutorials[tutorialIndex].title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{tutorials[tutorialIndex].title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed px-2">{tutorials[tutorialIndex].desc}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center gap-1.5">
                {tutorials.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === tutorialIndex ? "w-6 bg-orange-600" : "w-1.5 bg-slate-200"}`} />
                ))}
              </div>

              <button 
                onClick={handleNextTutorial}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Form details */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3 text-left">
              <h3 className="text-base font-extrabold text-slate-900">Vehicle Profile</h3>
              <p className="text-xs text-slate-400">Tell us what transport type and contact info you will use.</p>

              <div className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Sathish Khan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:bg-white focus:border-orange-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="E.g. +1 (555) 394-0238"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:bg-white focus:border-orange-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Vehicle Type</label>
                  <select 
                    value={vehicle} 
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:bg-white focus:border-orange-500 font-bold"
                  >
                    <option value="E-Bike ⚡️">E-Bike ⚡️</option>
                    <option value="Motorcycle 🛵">Motorcycle 🛵</option>
                    <option value="Sedan Car 🚗">Sedan Car 🚗</option>
                    <option value="Cargo Delivery Van 🚛">Cargo Delivery Van 🚛</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">License Plate Number</label>
                  <input 
                    type="text" 
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="E.g. PZ-9018 (Optional)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:bg-white focus:border-orange-500 font-bold"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (!name.trim()) return alert("Name is required");
                if (!phone.trim()) return alert("Phone is required");
                setStep(2);
              }}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>Upload Credentials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Document upload mock */}
        {step === 2 && (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3 text-left">
              <h3 className="text-base font-extrabold text-slate-900">Credentials Validation</h3>
              <p className="text-xs text-slate-400">Upload your Driver's License or state ID card to continue.</p>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-slate-100/50 transition-colors text-center space-y-2 cursor-pointer relative">
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={handleUploadDocument}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs font-bold text-slate-700">Drag & Drop or Click to Upload</div>
                <div className="text-[10px] text-slate-400">Supports PNG, JPG or PDF up to 5MB</div>
              </div>

              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>Extracting ID details...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {licenseFile && (
                <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2 text-xs text-green-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                  <div className="flex-1 truncate">
                    <span className="font-bold">Uploaded:</span> {licenseFile}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                if (!licenseFile) return alert("Please upload your license document first.");
                setStep(3);
              }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>Trigger Background Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Background scan check progress indicator */}
        {step === 3 && (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto border border-orange-100">
                {bgStatus === "approved" ? (
                  <ShieldCheck className="w-9 h-9 text-emerald-500" />
                ) : bgStatus !== "not_started" ? (
                  <Compass className="w-9 h-9 animate-spin text-orange-600" />
                ) : (
                  <FileText className="w-9 h-9" />
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900">National Registry Screening</h3>
                <p className="text-xs text-slate-400 leading-relaxed px-4">
                  All active fleet riders must initiate background verification. Click below to proceed securely.
                </p>
              </div>

              {bgStatus !== "not_started" && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-3 max-w-xs mx-auto">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${bgStatus !== "running_scan" ? "bg-green-500" : "bg-orange-500 animate-pulse"}`} />
                    <span className="font-bold text-slate-700">Criminal Database Registry Scan:</span>
                    <span className="ml-auto font-mono text-[10px] text-slate-400">{bgStatus === "running_scan" ? "RUNNING" : "APPROVED"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${bgStatus === "approved" ? "bg-green-500" : bgStatus === "running_dmv" ? "bg-orange-500 animate-pulse" : "bg-slate-300"}`} />
                    <span className="font-bold text-slate-700">State DMV License Records check:</span>
                    <span className="ml-auto font-mono text-[10px] text-slate-400">{bgStatus === "approved" ? "APPROVED" : bgStatus === "running_dmv" ? "RUNNING" : "PENDING"}</span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-orange-600 transition-all duration-300" style={{ width: `${bgProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {bgStatus === "approved" ? (
              <button 
                onClick={() => setStep(4)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Read Fleet Playbook</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : bgStatus === "not_started" ? (
              <button 
                onClick={handleStartBackgroundCheck}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Authorize & Run Screening</span>
              </button>
            ) : (
              <button 
                disabled 
                className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed"
              >
                Screening Active ({bgProgress}%)
              </button>
            )}
          </div>
        )}

        {/* Step 4: Short tutorial tips */}
        {step === 4 && (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4 text-left">
              <h3 className="text-base font-extrabold text-slate-900">PingZo Rider Playbook</h3>
              <p className="text-xs text-slate-400">Review these quick tips to get 5-star delivery reviews.</p>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2.5">
                  <div className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Select Alternative Routes</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Use the route choice drawer to dynamically switch paths if you hit heavy city traffic blockages.</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2.5">
                  <div className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Communication is Key</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Always ask customer for gate codes or delivery location notes via our built-in real-time chat room.</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2.5">
                  <div className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">3</div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Stay Safe & Secure</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Wear your helmet, maintain traffic guidelines, and enjoy 100% tipping benefits paid out weekly.</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleRegisterDriver}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-100" />
              <span>Complete Onboarding & Go Online</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface DriverAppProps {
  state: AppState;
  onRefresh: () => void;
  activeDeviceType: "ios" | "android";
}

export default function DriverApp({ state, onRefresh, activeDeviceType }: DriverAppProps) {
  const [isRegisteringNew, setIsRegisteringNew] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>(() => {
    return localStorage.getItem("pz_driver_id") || "driver_1";
  });
  const [driverChatText, setDriverChatText] = useState("");
  const [isSimulatingMovement, setIsSimulatingMovement] = useState(false);
  const [nodeIndex, setNodeIndex] = useState(0);

  const [activeTab, setActiveTab] = useState<"task" | "profile">("task");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const prevAssignedOrderIdRef = React.useRef<string | null>(null);

  const playBellSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.4, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      // Play beautiful high-pitched ding-dong bell chime!
      playTone(880, ctx.currentTime, 0.4);
      playTone(1320, ctx.currentTime + 0.15, 0.6);
    } catch (e) {
      console.warn("Audio bell sound blocked or failed:", e);
    }
  };

  const activeDriver = state.drivers.find(d => d.id === selectedDriverId) || state.drivers[0];

  // Find current order assigned to this driver
  const assignedOrder = state.orders.find(o => o.driverId === activeDriver?.id && o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED);

  useEffect(() => {
    if (activeDriver) {
      localStorage.setItem("pz_driver_id", activeDriver.id);
    }
  }, [activeDriver]);

  useEffect(() => {
    if (assignedOrder && assignedOrder.id !== prevAssignedOrderIdRef.current) {
      playBellSound();
      prevAssignedOrderIdRef.current = assignedOrder.id;
    } else if (!assignedOrder) {
      prevAssignedOrderIdRef.current = null;
    }
  }, [assignedOrder]);

  if (isRegisteringNew) {
    return (
      <DriverOnboarding 
        onComplete={(newDriver) => {
          onRefresh();
          setSelectedDriverId(newDriver.id);
          setIsRegisteringNew(false);
        }}
      />
    );
  }

  // Stop simulation if no order or delivered
  useEffect(() => {
    if (!assignedOrder) {
      setIsSimulatingMovement(false);
      setNodeIndex(0);
    }
  }, [assignedOrder]);

  // Simulated live movement loop
  useEffect(() => {
    if (!isSimulatingMovement || !assignedOrder || !assignedOrder.routeNodes) return;

    const interval = setInterval(async () => {
      const nodes = assignedOrder.routeNodes || [];
      if (nodeIndex < nodes.length) {
        const currentNode = nodes[nodeIndex];
        
        // Decide status dynamically during navigation
        let targetStatus = assignedOrder.status;

        if (nodeIndex === 0) {
          targetStatus = OrderStatus.PREPARING;
        } else if (nodeIndex === 1) {
          targetStatus = OrderStatus.OUT_FOR_DELIVERY;
        } else if (nodeIndex === nodes.length - 2) {
          targetStatus = OrderStatus.NEARBY;
        } else if (nodeIndex === nodes.length - 1) {
          targetStatus = OrderStatus.DELIVERED;
          setIsSimulatingMovement(false);
        }

        // Send coordinate update to backend
        try {
          await fetch("/api/driver/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              driverId: activeDriver.id,
              orderId: assignedOrder.id,
              status: targetStatus,
              lat: currentNode.lat,
              lng: currentNode.lng
            })
          });
          setNodeIndex(prev => prev + 1);
          onRefresh();
        } catch (err) {
          console.error(err);
        }
      } else {
        setIsSimulatingMovement(false);
      }
    }, 2000); // Step every 2 seconds for smooth simulation speed

    return () => clearInterval(interval);
  }, [isSimulatingMovement, nodeIndex, assignedOrder, activeDriver]);

  const handleStartSimulating = () => {
    if (!assignedOrder || !assignedOrder.routeNodes) return;
    setIsSimulatingMovement(true);
    setNodeIndex(0);
  };

  const handleStopSimulating = () => {
    setIsSimulatingMovement(false);
  };

  const handleDriverAction = async (status: OrderStatus) => {
    if (!assignedOrder) return;
    try {
      await fetch("/api/driver/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: activeDriver.id,
          orderId: assignedOrder.id,
          status: status,
          lat: activeDriver.currentLocation.lat,
          lng: activeDriver.currentLocation.lng
        })
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendDriverChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverChatText.trim() || !assignedOrder) return;

    try {
      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: assignedOrder.id,
          sender: "driver",
          text: driverChatText
        })
      });
      setDriverChatText("");
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleOnline = async () => {
    if (!activeDriver) return;
    const isCurrentlyOnline = activeDriver.status !== "offline";

    if (isCurrentlyOnline && assignedOrder) {
      alert("Finish your current task before going offline.");
      return;
    }

    try {
      await fetch("/api/driver/toggle-online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: activeDriver.id,
          online: !isCurrentlyOnline
        })
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 font-sans select-none relative pb-14">
      {state.isTrialMode && (
        <div className="bg-emerald-600 text-white py-1 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-center flex items-center justify-center gap-2 shrink-0">
          <Zap className="w-2.5 h-2.5 fill-white animate-pulse" />
          <span>Trial Version • UAT Mode</span>
          <Zap className="w-2.5 h-2.5 fill-white animate-pulse" />
        </div>
      )}
      
      {/* Driver Identity Switcher & Profile Header */}
      <div className="bg-white px-4 pt-6 pb-3 border-b border-slate-200 shrink-0 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-orange-600 rounded-full" />
            <h1 className="text-xs font-bold tracking-tight text-slate-800">Driver Partner Console</h1>
          </div>
          <span className="text-[9px] bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded font-bold font-sans">DELIVERY FLEET</span>
        </div>

        {/* Quick simulator profile switcher */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 p-1.5 rounded-xl text-left">
          <label className="text-[9px] text-slate-400 font-bold uppercase shrink-0">Selected Identity:</label>
          <select 
            value={selectedDriverId} 
            onChange={(e) => {
              setSelectedDriverId(e.target.value);
              setIsSimulatingMovement(false);
              setNodeIndex(0);
            }}
            className="flex-1 bg-white border border-slate-250 rounded-lg text-xs px-2 py-0.5 text-slate-700 focus:outline-none font-bold"
          >
            {state.drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.vehicle})</option>
            ))}
          </select>
          <button 
            onClick={() => setIsRegisteringNew(true)}
            className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[9px] font-bold shrink-0 transition-all"
          >
            + Register
          </button>
        </div>
      </div>

      {/* Main Content Area with Scroll Container */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        
        {/* Onboarding Timeline Blocker if Pending Approval */}
        {activeTab === "task" && activeDriver?.backgroundStatus === "pending" ? (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-left">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center border border-orange-100">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-sm font-black text-slate-900 font-sans">Application Status: Pending Approval</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                Thank you for applying to be a PingZo delivery partner! Our fleet operations team is currently running background verification checks on your profile.
              </p>
            </div>

            {/* Document Checkpoints Timeline */}
            <div className="border-l border-slate-150 pl-4 ml-2 space-y-4 py-1 relative font-sans">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h4 className="text-[11px] font-bold text-slate-800">1. Credentials Uploaded</h4>
                <p className="text-[9px] text-slate-400 mt-0.5">Government ID and license plate documentation scanned.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h4 className="text-[11px] font-bold text-slate-800">2. Criminal Registry Check</h4>
                <p className="text-[9px] text-slate-400 mt-0.5">State and national records clear. Check completed.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                <h4 className="text-[11px] font-bold text-orange-600">3. Admin Control Panel Activation</h4>
                <p className="text-[9px] text-slate-500 mt-0.5">Awaiting manual approval from the Fleet Operations manager dashboard.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-[10px] text-slate-600 leading-normal font-sans">
              💡 <span className="font-bold">Operations Demo Instruction:</span> To approve this partner and let them take orders, select the <span className="font-extrabold text-slate-850">"Admin Control Panel"</span> role at the top right, go to the <span className="font-bold">"Delivery Fleet"</span> tab, locate <span className="font-extrabold text-slate-850">{activeDriver?.name}</span> and click <span className="font-extrabold text-[#E01460]">"Verify Documents & Onboard Rider"</span>.
            </div>
          </div>
        ) : (
          <>
            {/* Shift status header card */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-150 shrink-0">
                    <img src={activeDriver?.avatar} alt="Driver Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{activeDriver?.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{activeDriver?.vehicle} • {activeDriver?.plateNumber || "PZ-7829"}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-[9px] text-slate-600 font-bold font-mono">{activeDriver?.rating} Rating</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                    activeDriver?.status === "offline" 
                      ? "bg-slate-100 text-slate-500 border-slate-200" 
                      : activeDriver?.status === "delivering" 
                      ? "bg-amber-50 text-amber-700 border-amber-100 animate-pulse" 
                      : "bg-emerald-50 text-emerald-700 border-emerald-100"
                  }`}>
                    {activeDriver?.status === "offline" ? "OFFLINE" : activeDriver?.status === "delivering" ? "ON TASK" : "ONLINE IDLE"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shift Status</span>
                <button
                  onClick={handleToggleOnline}
                  disabled={activeDriver?.backgroundStatus === "pending" || !!assignedOrder}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1 ${
                    activeDriver?.status !== "offline"
                      ? "bg-slate-950 border-slate-950 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      : "bg-white border-slate-250 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  <Power className="w-3.5 h-3.5 text-orange-600" />
                  <span>{activeDriver?.status !== "offline" ? "Go Offline" : "Go Online to Get Tasks"}</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Task navigation tab */}
        {activeTab === "task" && activeDriver?.backgroundStatus !== "pending" && (
          <div className="space-y-4">
            
            {/* Offline Blocker Screen */}
            {activeDriver?.status === "offline" ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-3 shadow-xs">
                <Power className="w-12 h-12 mx-auto text-slate-300 animate-pulse" />
                <div>
                  <p className="text-xs font-bold text-slate-700">Rider Shift is Offline</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Turn your shift status to Online using the toggle above to start receiving nearest grocery orders automatically.</p>
                </div>
                <button
                  onClick={handleToggleOnline}
                  className="mt-2 px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[10px] font-bold transition-colors shadow-sm"
                >
                  Go Online Now
                </button>
              </div>
            ) : !assignedOrder ? (
              /* Scanning/Searching Screen */
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-4 shadow-xs">
                <Compass className="w-12 h-12 mx-auto text-slate-400 animate-spin" style={{ animationDuration: "12s" }} />
                <div>
                  <p className="text-xs font-bold text-slate-700">Scanning For Orders Near SOMA...</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">PingZo automatically assigns groceries based on proximity priority. Orders will chime when available!</p>
                </div>
              </div>
            ) : (
              /* If order is unconfirmed, show Accept/Reject offer panel. Else show navigation details and chat */
              !assignedOrder.assignmentConfirmed ? (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-500 rounded-3xl p-5 space-y-4 shadow-md text-left animate-bounce" style={{ animationDuration: "3s" }}>
                  <div className="flex justify-between items-center border-b border-orange-200 pb-2">
                    <span className="text-[9px] font-bold text-orange-700 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Auto Assigned Offer
                    </span>
                    <span className="text-[9px] bg-orange-600 text-white px-2.5 py-0.5 rounded font-extrabold animate-pulse">CHIME ALERT</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    <p className="font-extrabold text-slate-800 text-sm">Order #{assignedOrder.id}</p>
                    <p><span className="text-slate-400 font-bold uppercase text-[9px] block">Merchant:</span> <span className="font-extrabold text-slate-800">{assignedOrder.restaurantName}</span></p>
                    <p><span className="text-slate-400 font-bold uppercase text-[9px] block">Customer:</span> <span className="font-extrabold text-slate-800">{assignedOrder.customerName}</span></p>
                    <p><span className="text-slate-400 font-bold uppercase text-[9px] block">Address:</span> <span className="font-extrabold text-slate-800 truncate block max-w-full">{assignedOrder.deliveryAddress}</span></p>
                    
                    {/* New Map Preview for Offered Task */}
                    <div className="pt-2">
                      <SimulatedMap 
                        customerLocation={assignedOrder.deliveryLocation}
                        restaurantLocation={assignedOrder.restaurantLocation}
                        driverLocation={activeDriver.currentLocation}
                        interactive={false}
                        height="h-32"
                      />
                    </div>

                    <p className="pt-2 border-t border-orange-100 mt-2 flex justify-between items-center text-slate-800">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Earnings Payout:</span>
                      <span className="font-black text-sm text-orange-600">₹{assignedOrder.totalPrice.toFixed(2)}</span>
                    </p>
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      onClick={async () => {
                        try {
                          await fetch("/api/order/reject-assignment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ orderId: assignedOrder.id, driverId: activeDriver.id })
                          });
                          onRefresh();
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="flex-1 py-2 bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 text-xs font-bold rounded-xl transition-all text-center"
                    >
                      Reject Offer
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await fetch("/api/order/confirm-assignment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ orderId: assignedOrder.id, driverId: activeDriver.id })
                          });
                          onRefresh();
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md transition-all text-center"
                    >
                      Accept & Confirm
                    </button>
                  </div>
                </div>
              ) : (
                /* Regular active task UI with Map & progressions */
                <div className="space-y-4">
                  
                  {/* Task Metadata */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs text-left">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-[9px] font-bold text-orange-600 uppercase">Current Task Details</span>
                        <h4 className="text-xs font-bold text-slate-800 mt-0.5">Order ID: #{assignedOrder.id}</h4>
                      </div>
                      <span className="text-[10px] font-mono bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded border border-orange-100">
                        {assignedOrder.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Merchant Name:</span>
                        <span className="font-bold text-slate-700">{assignedOrder.restaurantName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Recipient Name:</span>
                        <span className="font-bold text-slate-700">{assignedOrder.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Delivery Address:</span>
                        <span className="font-bold text-slate-700 truncate max-w-[60%] text-right">{assignedOrder.deliveryAddress}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-100 pt-2 font-bold">
                        <span>Grand Subtotal:</span>
                        <span className="text-orange-600">₹{assignedOrder.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Live Route navigation */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-3 shadow-xs text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700">Navigation Route Overlay</h4>
                      {isSimulatingMovement ? (
                        <span className="text-[10px] text-orange-600 font-bold animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-ping" /> In Motion (Step {nodeIndex}/{assignedOrder.routeNodes?.length || 0})
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">Parked</span>
                      )}
                    </div>

                    <SimulatedMap 
                      customerLocation={assignedOrder.deliveryLocation}
                      restaurantLocation={assignedOrder.restaurantLocation}
                      driverLocation={activeDriver.currentLocation}
                      routeNodes={assignedOrder.routeNodes}
                      interactive={false}
                      height="h-44"
                    />

                    {/* AI optimized Route instruction display */}
                    <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 space-y-1">
                      <p className="text-[10px] font-sans font-bold text-orange-700 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> AI ROUTER TRAFFIC ANALYSIS
                      </p>
                      <p className="text-[10px] text-slate-600 leading-relaxed italic">
                        "{assignedOrder.aiRouteExplanation || 'AI Router predicts low morning density, recommending primary arterial routes.'}"
                      </p>
                    </div>

                    {/* Auto Simulation Trigger Controls */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase text-center">Simulated Auto-GPS Movement</p>
                      
                      {isSimulatingMovement ? (
                        <button 
                          onClick={handleStopSimulating}
                          className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-100 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          Pause GPS Simulation
                        </button>
                      ) : (
                        <button 
                          onClick={handleStartSimulating}
                          className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" /> Start GPS Route Simulation
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Manual Status progression controls */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs text-left">
                    <h4 className="text-xs font-bold text-slate-700">Manual Task Updates</h4>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <button 
                        onClick={() => handleDriverAction(OrderStatus.PREPARING)}
                        className={`py-2 px-2 rounded-xl border font-bold transition-all ${
                          assignedOrder.status === OrderStatus.ASSIGNED ? "bg-orange-50 border-orange-200 text-orange-700 shadow-xs" : "bg-white border-slate-100 text-slate-300"
                        }`}
                      >
                        Mark Prep/Cooking
                      </button>
                      <button 
                        onClick={() => handleDriverAction(OrderStatus.OUT_FOR_DELIVERY)}
                        className={`py-2 px-2 rounded-xl border font-bold transition-all ${
                          assignedOrder.status === OrderStatus.PREPARING ? "bg-orange-50 border-orange-200 text-orange-700 shadow-xs" : "bg-white border-slate-100 text-slate-300"
                        }`}
                      >
                        Mark Picked Up (In-Transit)
                      </button>
                      <button 
                        onClick={() => handleDriverAction(OrderStatus.NEARBY)}
                        className={`py-2 px-2 rounded-xl border font-bold transition-all ${
                          assignedOrder.status === OrderStatus.OUT_FOR_DELIVERY ? "bg-orange-50 border-orange-200 text-orange-700 shadow-xs" : "bg-white border-slate-100 text-slate-300"
                        }`}
                      >
                        Mark Driver Arrived Nearby
                      </button>
                      <button 
                        onClick={() => handleDriverAction(OrderStatus.DELIVERED)}
                        className={`py-2 px-2 rounded-xl border font-bold transition-all ${
                          assignedOrder.status === OrderStatus.NEARBY ? "bg-green-50 border-green-200 text-green-700 shadow-xs" : "bg-white border-slate-100 text-slate-300"
                        }`}
                      >
                        Mark Delivered!
                      </button>
                    </div>
                  </div>

                  {/* Chat Room with Client */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs text-left">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-orange-600" /> Chat with Customer
                      </span>
                      <a 
                        href={`tel:${assignedOrder.customerPhone}`}
                        className="p-1.5 text-green-700 bg-green-50 hover:bg-green-100 border border-green-100 rounded-lg flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Phone className="w-3 h-3" /> Call Customer
                      </a>
                    </div>

                    {/* Chats box */}
                    <div className="h-32 overflow-y-auto bg-slate-50 rounded-xl p-2.5 space-y-2 border border-slate-100">
                      {state.chats.filter(c => c.orderId === assignedOrder.id).length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic text-center py-8">No messages. Tap below to check coordinates.</p>
                      ) : (
                        state.chats.filter(c => c.orderId === assignedOrder.id).map(msg => (
                          <div key={msg.id} className={`flex flex-col ${msg.sender === "driver" ? "items-end" : "items-start"}`}>
                            <span className="text-[9px] text-slate-400 mb-0.5 font-sans font-medium">{msg.sender === "driver" ? "You" : "Customer"}</span>
                            <div className={`px-2.5 py-1.5 rounded-xl text-xs max-w-[85%] ${
                              msg.sender === "driver" ? "bg-orange-600 text-white rounded-tr-none font-semibold" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs"
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleSendDriverChat} className="flex gap-2">
                      <input 
                        type="text" 
                        value={driverChatText}
                        onChange={(e) => setDriverChatText(e.target.value)}
                        placeholder="Ask customer for gate code..."
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                      <button type="submit" className="p-2 bg-orange-600 text-white rounded-xl hover:bg-orange-500 shadow-xs transition-colors">
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>

                </div>
              )
            )}
          </div>
        )}

        {/* Profile tab view */}
        {activeTab === "profile" && (
          <div className="space-y-4 text-left">
            {/* Delivery count and rating details block */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                📊 Partner Metrics Summary
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Completed Tasks</span>
                  <span className="text-sm font-black text-slate-800 mt-1 block">
                    {activeDriver?.completedDeliveries || 0} Deliveries
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Current Rating</span>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-base font-black text-slate-800">
                      {activeDriver?.rating || "5.0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rider details block */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3.5 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                👤 Rider Credentials
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-50 pb-1.5">
                  <span className="text-slate-400">Driver Name:</span>
                  <span className="font-bold text-slate-800">{activeDriver?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1.5">
                  <span className="text-slate-400">Registered Phone:</span>
                  <span className="font-bold text-slate-800">{activeDriver?.phone}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1.5">
                  <span className="text-slate-400">Vehicle Type:</span>
                  <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 text-[10px]">
                    {activeDriver?.vehicle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">License Plate:</span>
                  <span className="font-bold text-slate-800">{activeDriver?.plateNumber || "PZ-7829"}</span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-4 h-4 text-orange-600" /> Rider Support & FAQ
              </h4>
              
              <div className="divide-y divide-slate-100 border border-slate-150 rounded-xl overflow-hidden bg-slate-50/50">
                {[
                  {
                    q: "📞 Customer not responding?",
                    a: "Try calling the customer directly via the green 'Call Customer' button. If no response after 5 minutes, mark delivery status as delivered at gate and add comments."
                  },
                  {
                    q: "💰 How do I receive weekly earnings?",
                    a: "Earnings are deposited automatically to your connected bank account every Tuesday morning. Tipping is paid out 100% directly to you!"
                  },
                  {
                    q: "🧭 How does nearest-driver routing work?",
                    a: "The auto-assignment queue calculates the flat distance to SOMA Organic Grocers. Online idle drivers closest to the grocery store get priority assignments first."
                  },
                  {
                    q: "❌ Can I decline an auto-assigned order?",
                    a: "Yes. You have the freedom to reject any assigned offer. The system will automatically and instantly re-assign the order to the next available delivery partner."
                  }
                ].map((faq, index) => {
                  const isOpen = activeFaq === index;
                  return (
                    <div key={index} className="px-3 py-2.5 bg-white">
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : index)}
                        className="w-full flex justify-between items-center text-left text-xs font-bold text-slate-700 hover:text-orange-600 transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-90 text-orange-600" : ""}`} />
                      </button>
                      {isOpen && (
                        <p className="text-[11px] text-slate-500 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-150 px-4 py-2 flex items-center justify-around shrink-0 z-20 shadow-md">
        <button 
          onClick={() => setActiveTab("task")}
          className={`flex flex-col items-center p-1 transition-colors ${activeTab === "task" ? "text-orange-600 font-extrabold" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Active Tasks</span>
        </button>

        <button 
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center p-1 transition-colors ${activeTab === "profile" ? "text-orange-600 font-extrabold" : "text-slate-400 hover:text-slate-600"}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">My Profile</span>
        </button>
      </div>

    </div>
  );
}
