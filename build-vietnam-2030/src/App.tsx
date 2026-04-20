/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Rocket, 
  Shield, 
  Cpu, 
  Globe, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight, 
  ChevronRight, 
  RotateCcw,
  Zap,
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Settings,
  User,
  Factory,
  GraduationCap,
  Building2,
  FlaskConical,
  Scale
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types & Constants ---
type GameState = "hero" | "instruction" | "round1" | "round2" | "round3" | "round4" | "round5" | "loading" | "result" | "conclusion";

interface Scores {
  growth: number;
  autonomy: number;
  value: number;
  risk: number;
}

interface Choice {
  id: string;
  title: string;
  description: string;
  icon: any;
  effects: Partial<Scores>;
  tags: { label: string; type: "positive" | "negative" | "warning" }[];
  isRecommended?: boolean;
}

interface Round {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  choices: Choice[];
}

const INITIAL_SCORES: Scores = {
  growth: 50,
  autonomy: 50,
  value: 50,
  risk: 10,
};

const ROUNDS: Record<GameState, Round | null> = {
  hero: null,
  instruction: null,
  round1: {
    id: "round1",
    title: "Vòng 1: Chọn Chiến Lược",
    subtitle: "Xác định quỹ đạo vận hành của hệ thống. Mỗi lựa chọn sẽ thay đổi cấu trúc năng lượng và quyền kiểm soát của bạn.",
    image: "https://picsum.photos/seed/strategy-vn/1200/400",
    choices: [
      {
        id: "1a",
        title: "Tăng trưởng nhanh",
        description: "Ưu tiên mở rộng quy mô bằng mọi giá. Chấp nhận hy sinh quyền kiểm soát để đạt được thị phần tối đa trong thời gian ngắn nhất.",
        icon: Rocket,
        effects: { growth: 20, autonomy: -15, risk: 5 },
        tags: [{ label: "+ Growth", type: "positive" }, { label: "- Autonomy", type: "negative" }]
      },
      {
        id: "1b",
        title: "Cân bằng",
        description: "Duy trì sự ổn định giữa tốc độ phát triển và khả năng tự vận hành. Phù hợp cho mục tiêu phát triển bền vững lâu dài.",
        icon: Scale,
        effects: { growth: 10, autonomy: 5, value: 5 },
        tags: [{ label: "+ Growth", type: "positive" }, { label: "+ Autonomy (nhẹ)", type: "positive" }]
      },
      {
        id: "1c",
        title: "Tự chủ công nghệ",
        description: "Tập trung nguồn lực vào việc làm chủ lõi công nghệ. Chấp nhận phát triển chậm để đảm bảo tính độc lập tuyệt đối.",
        icon: Shield,
        effects: { growth: -10, autonomy: 25, value: 10 },
        tags: [{ label: "+ Autonomy", type: "positive" }, { label: "- Growth", type: "negative" }]
      }
    ]
  },
  round2: {
    id: "round2",
    title: "Vòng 2: Ưu Tiên Chính Sách",
    subtitle: "Xác định các trục chính sách cốt lõi để thúc đẩy nền kinh tế.",
    image: "https://picsum.photos/seed/policy-vn/1200/400",
    choices: [
      {
        id: "2a",
        title: "Thu hút FDI (Đầu tư nước ngoài)",
        description: "Ưu tiên thu hút dòng vốn quốc tế để bứt phá hạ tầng, nhưng chấp nhận sự phụ thuộc vào chuỗi cung ứng ngoại.",
        icon: Factory,
        effects: { growth: 15, autonomy: -10 },
        tags: [{ label: "+ Growth", type: "positive" }, { label: "- Autonomy", type: "negative" }]
      },
      {
        id: "2b",
        title: "Giáo dục & Đào tạo",
        description: "Xây dựng nền tảng tri thức nội tại vững chắc, nâng cao giá trị thặng dư của nguồn nhân lực.",
        icon: GraduationCap,
        effects: { autonomy: 10, value: 15 },
        tags: [{ label: "+ Autonomy", type: "positive" }, { label: "+ Value", type: "positive" }]
      },
      {
        id: "2c",
        title: "Hỗ trợ doanh nghiệp nội",
        description: "Trợ lực cho các tập đoàn trong nước làm chủ thị trường, tạo ra các thực thể kinh tế độc lập.",
        icon: Building2,
        effects: { autonomy: 15, growth: 5 },
        tags: [{ label: "+ Autonomy", type: "positive" }]
      },
      {
        id: "2d",
        title: "R&D (Nghiên cứu & Phát triển)",
        description: "Đầu tư vào tương lai công nghệ. Giảm thiểu rủi ro lạc hậu nhưng chi phí đầu tư rất lớn.",
        icon: FlaskConical,
        effects: { value: 20, autonomy: 5, risk: -5 },
        tags: [{ label: "+ Value", type: "positive" }, { label: "+ Autonomy", type: "positive" }, { label: "- Risk", type: "positive" }]
      }
    ]
  },
  round3: {
    id: "round3",
    title: "Vòng 3: Ngành Mũi Nhọn",
    subtitle: "Lựa chọn lĩnh vực công nghiệp sẽ đóng vai trò đầu tàu kinh tế.",
    image: "https://picsum.photos/seed/industry-vn/1200/400",
    choices: [
      {
        id: "3a",
        title: "Điện tử lắp ráp",
        description: "Tập trung vào quy mô sản xuất hạ nguồn, tối ưu hóa chuỗi cung ứng hiện hữu.",
        icon: Cpu,
        effects: { growth: 15, value: -10 },
        tags: [{ label: "+ Growth", type: "positive" }, { label: "- Value", type: "negative" }]
      },
      {
        id: "3b",
        title: "Sản xuất Bán dẫn",
        description: "Làm chủ công nghệ lõi, thiết kế chip và sản xuất linh kiện chiến lược.",
        icon: Zap,
        effects: { value: 20, autonomy: 15 },
        isRecommended: true,
        tags: [{ label: "+ Value", type: "positive" }, { label: "+ Autonomy", type: "positive" }]
      },
      {
        id: "3c",
        title: "AI - Trí tuệ Nhân tạo",
        description: "Đi đầu trong cuộc cách mạng thuật toán, tối ưu hóa toàn diện nền kinh tế số.",
        icon: Lightbulb,
        effects: { value: 25, risk: 15 },
        tags: [{ label: "+ High Value", type: "positive" }, { label: "+ Risk", type: "warning" }]
      },
      {
        id: "3d",
        title: "Sản xuất truyền thống",
        description: "Nâng cấp tự động hóa các ngành thâm dụng lao động, duy trì ổn định.",
        icon: Factory,
        effects: { growth: 5, value: -5 },
        tags: [{ label: "+ Growth nhẹ", type: "positive" }, { label: "- Value", type: "negative" }]
      }
    ]
  },
  round4: {
    id: "round4",
    title: "Vòng 4: Đối Tác Chiến Lược",
    subtitle: "Lựa chọn liên minh quốc tế để định hình vị thế toàn cầu.",
    image: "https://picsum.photos/seed/global-vn/1200/400",
    choices: [
      {
        id: "4a",
        title: "Liên minh Hoa Kỳ",
        description: "Hợp tác với các tập đoàn Silicon Valley. Tối ưu giá trị thương mại nhưng giảm quyền tự chủ.",
        icon: Globe,
        effects: { value: 15, autonomy: -10 },
        tags: [{ label: "Value: High", type: "positive" }, { label: "Autonomy: Low", type: "negative" }]
      },
      {
        id: "4b",
        title: "Đối tác Hàn Quốc",
        description: "Mô hình quản lý linh hoạt, tăng cường khả năng tự chủ vận hành dài hạn.",
        icon: Zap,
        effects: { value: 10, autonomy: 10 },
        isRecommended: true,
        tags: [{ label: "Value: Medium", type: "positive" }, { label: "Autonomy: High", type: "positive" }]
      },
      {
        id: "4c",
        title: "Thị trường Trung Quốc",
        description: "Khai thác hạ tầng khổng lồ, đẩy mạnh tốc độ tăng trưởng quy mô nhanh.",
        icon: Factory,
        effects: { growth: 20, autonomy: -20, risk: 10 },
        tags: [{ label: "Growth: Max", type: "positive" }, { label: "Autonomy: Critical", type: "warning" }]
      }
    ]
  },
  round5: {
    id: "round5",
    title: "Vòng 5: Bước Ngoặt Cuối",
    subtitle: "Quyết định hướng đi dài hạn cho tương lai đất nước.",
    image: "https://picsum.photos/seed/future-vn/1200/400",
    choices: [
      {
        id: "5a",
        title: "Tiếp tục Gia công",
        description: "Tập trung tối ưu hóa quy trình hiện tại, mở rộng quy mô sản xuất.",
        icon: Factory,
        effects: { growth: 15, value: -10 },
        tags: [{ label: "+ Growth", type: "positive" }, { label: "- Value", type: "negative" }]
      },
      {
        id: "5b",
        title: "Đầu tư Đột phá",
        description: "Tái cấu trúc nguồn lực để phát triển công nghệ lõi độc quyền.",
        icon: Lightbulb,
        effects: { value: 15, autonomy: 10, risk: 5 },
        tags: [{ label: "+ Value", type: "positive" }, { label: "+ Autonomy", type: "positive" }]
      },
      {
        id: "5c",
        title: "Cơ cấu Cân bằng",
        description: "Duy trì tăng trưởng ổn định trong khi đầu tư có chọn lọc mảng giá trị cao.",
        icon: Scale,
        effects: { growth: 10, value: 5 },
        tags: [{ label: "+ Growth", type: "positive" }, { label: "+ Value nhẹ", type: "positive" }]
      }
    ]
  },
  loading: null,
  result: null,
  conclusion: null
};

const RESULTS = [
  {
    id: "con-xuong",
    title: "CÔNG XƯỞNG TOÀN CẦU",
    condition: (s: Scores) => s.growth > 80 && s.autonomy < 50,
    description: "Bạn đã biến Việt Nam thành mắt xích không thể thiếu trong chuỗi cung ứng thế giới. Tuy nhiên, sự phụ thuộc vào vốn ngoại vẫn còn rất cao.",
    image: "https://picsum.photos/seed/factory/1920/1080"
  },
  {
    id: "sang-tao",
    title: "TRUNG TÂM SÁNG TẠO",
    condition: (s: Scores) => s.autonomy > 70 && s.value > 70,
    description: "Một quốc gia tự chủ về công nghệ lõi, nơi tri thức và sự sáng tạo là động lực chính của nền kinh tế thịnh vượng.",
    image: "https://picsum.photos/seed/tech/1920/1080"
  },
  {
    id: "le-thuoc",
    title: "TĂNG TRƯỞNG LỆ THUỘC",
    condition: (s: Scores) => s.growth > 70 && s.value < 50,
    description: "Nền kinh tế mở rộng nhanh chóng về quy mô nhưng lại thiếu đi hàm lượng chất xám nội tại, khiến nước ta mắc kẹt trong bẫy gia công.",
    image: "https://picsum.photos/seed/shipment/1920/1080"
  },
  {
    id: "trung-gian",
    title: "MẮC KẸT TRUNG GIAN",
    condition: (s: Scores) => s.growth >= 50 && s.growth <= 70 && s.value >= 50 && s.value <= 70,
    description: "Việt Nam đang đứng ở ngã ba đường. Tăng trưởng vẫn được duy trì nhưng chưa bứt phá mạnh mẽ để trở thành cường quốc công nghệ.",
    image: "https://picsum.photos/seed/city/1920/1080"
  },
  {
    id: "but-pha",
    title: "BỨT PHÁ CÔNG NGHỆ",
    condition: (s: Scores) => s.value > 85,
    description: "Các quyết định táo bạo đã đưa Việt Nam trở thành kỳ lân của khu vực, dẫn đầu trong các lĩnh vực mới như Chip và AI.",
    image: "https://picsum.photos/seed/future/1920/1080"
  },
  {
    id: "khung-hoang",
    title: "KHỦNG HOẢNG CHIẾN LƯỢC",
    condition: (s: Scores) => s.risk > 40,
    description: "Những quyết định quá mạo hiểm hoặc thiếu nhất quán đã khiến hệ thống gặp bất ổn định nghiêm trọng.",
    image: "https://picsum.photos/seed/glitch/1920/1080"
  }
];

// --- Components ---

const ProgressBar = ({ value, color, label }: { value: number; color: string; label: string }) => {
  const segments = 10;
  const activeSegments = Math.round((value / 100) * segments);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{label}</span>
        <span className={cn("text-lg font-headline font-bold", color)}>{value}%</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-sm transition-all duration-500",
              i < activeSegments ? color.replace("text-", "bg-") : "bg-slate-700/50"
            )}
            style={{ boxShadow: i < activeSegments ? `0 0 10px ${color.replace("text-", "")}` : "none" }}
          />
        ))}
      </div>
    </div>
  );
};

const NavBar = ({ activeTab }: { activeTab: string }) => (
  <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#0b0e14]/80 backdrop-blur-2xl border-t border-primary/20 h-20 px-6 pb-safe flex justify-around items-center">
    {[
      { id: "hero", label: "Chiến dịch", icon: Rocket },
      { id: "data", label: "Dữ liệu", icon: BarChart3 },
      { id: "report", label: "Báo cáo", icon: TrendingUp },
      { id: "doctrine", label: "Học thuyết", icon: BookOpen },
    ].map((item) => (
      <button
        key={item.id}
        className={cn(
          "flex flex-col items-center gap-1 p-2 transition-all",
          activeTab === item.id || (activeTab.startsWith("round") && item.id === "hero")
            ? "text-tertiary bg-tertiary/10 rounded-lg"
            : "text-slate-500 hover:text-secondary"
        )}
      >
        <item.icon size={20} />
        <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
      </button>
    ))}
  </nav>
);

const Header = () => (
  <header className="fixed top-0 left-0 w-full z-50 bg-[#0b0e14]/60 backdrop-blur-2xl border-b border-primary/10 px-6 py-4 flex justify-between items-center shadow-2xl">
    <div className="flex items-center gap-3">
      <div className="text-secondary">
        <LayoutDashboard size={24} />
      </div>
      <h1 className="text-lg font-headline font-bold text-primary tracking-widest uppercase">TRUNG TÂM CHỈ HUY</h1>
    </div>
    <div className="flex items-center gap-4">
      <div className="hidden md:flex gap-6">
        <span className="text-slate-400 font-headline text-xs uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">Thiết lập</span>
        <span className="text-slate-400 font-headline text-xs uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">Bản đồ</span>
      </div>
      <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center overflow-hidden bg-slate-800">
        <img 
          src="https://picsum.photos/seed/avatar/200" 
          alt="Avatar" 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  </header>
);

export default function App() {
  const [gameState, setGameState] = useState<GameState>("hero");
  const [scores, setScores] = useState<Scores>(INITIAL_SCORES);
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  
  const handleChoice = (roundId: GameState, choice: Choice) => {
    // Update scores
    setScores(prev => ({
      growth: Math.min(100, Math.max(0, prev.growth + (choice.effects.growth || 0))),
      autonomy: Math.min(100, Math.max(0, prev.autonomy + (choice.effects.autonomy || 0))),
      value: Math.min(100, Math.max(0, prev.value + (choice.effects.value || 0))),
      risk: Math.min(100, Math.max(0, prev.risk + (choice.effects.risk || 0))),
    }));
    
    // Transitions
    if (roundId === "round5") {
      setGameState("loading");
    } else {
      const rounds: GameState[] = ["round1", "round2", "round3", "round4", "round5"];
      const currentIndex = rounds.indexOf(roundId);
      setGameState(rounds[currentIndex + 1]);
    }
  };

  useEffect(() => {
    if (gameState === "loading") {
      const timer = setTimeout(() => {
        setGameState("result");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const getOutcome = () => {
    return RESULTS.find(r => r.condition(scores)) || RESULTS[3]; // default to trung-gian
  };

  const resetGame = () => {
    setScores(INITIAL_SCORES);
    setGameState("hero");
    setSelectedChoices([]);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 selection:bg-primary/30 font-body relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/20 rounded-full blur-[100px]" />
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: "linear-gradient(rgba(199, 153, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(199, 153, 255, 0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} 
        />
      </div>

      <Header />

      <main className="relative z-10 pt-28 pb-32 px-6 max-w-6xl mx-auto flex flex-col items-center">
        <AnimatePresence mode="wait">
          {/* --- HERO SCREEN --- */}
          {gameState === "hero" && (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-12 py-12 relative w-full"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] opacity-10 pointer-events-none overflow-hidden rounded-[100px]">
                <img 
                  src="https://picsum.photos/seed/cyan-cyber/1920/1080" 
                  alt="Background Decor" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover blur-2xl scale-125"
                />
              </div>

              <div className="relative z-10 space-y-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-tertiary/30 bg-tertiary/5 text-tertiary text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">
                  <Zap size={12} className="fill-current" />
                  Hệ thống đã sẵn sàng
                </div>
                
                <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tight leading-[0.9]">
                  HÀNH TRÌNH <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
                    TỰ CHỦ CÔNG NGHỆ
                  </span>
                </h1>
                
                <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden border border-white/5 shadow-2xl aspect-video md:aspect-[21/9]">
                  <img 
                    src="https://picsum.photos/seed/vietnam-future-city/1200/600" 
                    alt="Vietnam 2030" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className="max-w-2xl mx-auto text-on-surface-variant text-lg leading-relaxed opacity-80">
                  Trong kỷ nguyên số, quyền lực thuộc về những ai làm chủ thuật toán. 
                  <span className="text-tertiary font-bold block mt-2 underline decoration-tertiary/30">Quyết định của bạn sẽ định hình tương lai đất nước.</span>
                </p>

                <div className="pt-8">
                  <button 
                    onClick={() => setGameState("instruction")}
                    className="group relative inline-flex items-center gap-4 bg-primary text-on-primary px-12 py-5 rounded-2xl font-headline text-xl font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(199,153,255,0.4)]"
                  >
                    Bắt đầu
                    <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- INSTRUCTION SCREEN --- */}
          {gameState === "instruction" && (
            <motion.div 
              key="instruction"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl w-full flex flex-col items-center text-center space-y-10"
            >
              <div className="w-full h-40 rounded-3xl overflow-hidden border border-white/5 opacity-80">
                <img 
                  src="https://picsum.photos/seed/blueprint/1200/300" 
                  alt="Instruction Header" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest">
                  Mission Briefing
                </div>
                <h2 className="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tight">HƯỚNG DẪN CHIẾN DỊCH</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
                {[
                  { label: "GROWTH (TĂNG TRƯỞNG)", desc: "Tốc độ mở rộng quy mô và thị phần kinh tế trong kỷ nguyên số hóa.", icon: TrendingUp, color: "text-tertiary" },
                  { label: "AUTONOMY (TỰ CHỦ)", desc: "Khả năng làm chủ công nghệ lõi và bộ máy bộ vận hành độc lập.", icon: Shield, color: "text-secondary" },
                  { label: "VALUE (GIÁ TRỊ)", desc: "Chất lượng chất xám và hàm lượng sáng tạo độc nhất trong từng sản phẩm.", icon: Lightbulb, color: "text-primary" },
                  { label: "RISK (RỦI RO)", desc: "Các mối đe dọa về an ninh mạng, lỗ hổng hệ thống và bất ổn định.", icon: AlertTriangle, color: "text-error" },
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.1 } }}
                    className="p-6 bg-surface-container-high rounded-xl border border-outline-variant/10 hover:border-primary/20 transition-all group"
                  >
                    <div className={cn("inline-block p-2 rounded-lg mb-4 bg-white/5 group-hover:scale-110 transition-transform", item.color)}>
                      <item.icon size={24} />
                    </div>
                    <h3 className={cn("text-lg font-headline font-bold mb-2 uppercase", item.color)}>{item.label}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="bg-surface-container p-6 rounded-xl border border-primary/20 w-full text-sm leading-relaxed">
                Bạn sẽ đóng vai người hoạch định chiến lược cho Việt Nam qua 5 vòng lựa chọn. 
                Mỗi lựa chọn sẽ tác động trực tiếp đến các chỉ số quốc gia. 
                Hãy cân nhắc cẩn thận để xem đất nước sẽ trở thành <span className="text-primary font-bold">CÔNG XƯỞNG</span> hay <span className="text-tertiary font-bold">TRUNG TÂM SÁNG TẠO</span>.
              </div>

              <button 
                onClick={() => setGameState("round1")}
                className="group inline-flex items-center gap-3 bg-tertiary text-on-tertiary px-10 py-4 rounded-xl font-headline font-bold uppercase tracking-widest hover:shadow-[0_0_30px_rgba(185,255,232,0.3)] transition-all"
              >
                Chơi ngay
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {/* --- ROUNDS 1-5 --- */}
          {gameState.startsWith("round") && (
            <motion.div 
              key={gameState}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="w-full space-y-10"
            >
              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
                <ProgressBar label="Growth" value={scores.growth} color="text-tertiary" />
                <ProgressBar label="Autonomy" value={scores.autonomy} color="text-secondary" />
                <ProgressBar label="Value" value={scores.value} color="text-primary" />
                <ProgressBar label="Risk" value={scores.risk} color="text-error" />
              </div>

              {/* Round Illustration */}
              <div className="w-full h-48 md:h-64 rounded-3xl overflow-hidden border border-white/5 shadow-inner">
                <img 
                  src={ROUNDS[gameState]?.image} 
                  alt={ROUNDS[gameState]?.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale-[0.5] hover:grayscale-0 transition-all duration-700"
                />
              </div>

              {/* Round Content */}
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-on-surface">
                  {ROUNDS[gameState]?.title}
                </h2>
                <p className="text-on-surface-variant max-w-2xl">{ROUNDS[gameState]?.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(ROUNDS[gameState]?.choices || []).map((choice, idx) => (
                  <motion.div 
                    key={choice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.1 } }}
                    className="group relative flex flex-col bg-surface-container-high rounded-2xl p-8 border border-transparent hover:border-primary/30 transition-all cursor-pointer overflow-hidden shadow-lg active:scale-[0.98]"
                    onClick={() => handleChoice(gameState, choice)}
                  >
                    {/* Decor Icons */}
                    <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                      <choice.icon size={120} />
                    </div>
                    
                    {choice.isRecommended && (
                      <div className="absolute top-4 right-4 bg-primary/20 text-primary px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border border-primary/20 backdrop-blur-sm z-10">
                        Đề xuất
                      </div>
                    )}

                    <div className="mb-6">
                      <div className="inline-flex p-4 rounded-xl bg-slate-800/80 mb-6 group-hover:scale-110 transition-transform shadow-inner">
                        <choice.icon className="text-primary" size={28} />
                      </div>
                      <h3 className="text-xl font-headline font-bold text-on-surface">{choice.title}</h3>
                    </div>

                    <div className="flex-grow space-y-6">
                      <div className="flex flex-wrap gap-2">
                        {choice.tags.map((tag, tIdx) => (
                          <span 
                            key={tIdx} 
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
                              tag.type === "positive" ? "bg-tertiary/10 text-tertiary border-tertiary/20" :
                              tag.type === "negative" ? "bg-error/10 text-error border-error/20" : 
                              "bg-secondary/10 text-secondary border-secondary/20"
                            )}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{choice.description}</p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-outline-variant/10 flex items-center justify-between group-hover:text-primary transition-colors">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Triển khai phương án</span>
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* --- LOADING --- */}
          {gameState === "loading" && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-12 py-20 relative w-full h-[600px]"
            >
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <img 
                  src="https://picsum.photos/seed/data-center/1920/1080" 
                  alt="Loading Background" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover blur-xl"
                />
              </div>
              <div className="relative z-10 flex flex-col items-center space-y-12">
                <div className="relative w-48 h-48">
                <motion.div 
                  className="absolute inset-0 border-4 border-t-primary border-r-secondary border-b-tertiary border-l-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
                <motion.div 
                  className="absolute inset-4 border-2 border-primary/20 rounded-full"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <BarChart3 className="text-primary" size={40} />
                  </motion.div>
                </div>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-2xl md:text-4xl font-headline font-bold text-on-surface uppercase tracking-[0.2em]">Đang phân tích chiến lược...</h2>
                <p className="text-tertiary font-headline font-bold text-lg animate-pulse uppercase">Tính toán tác động kinh tế 2030</p>
              </div>
            </div>
          </motion.div>
          )}

          {/* --- RESULT SCREEN --- */}
          {gameState === "result" && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary/10 border border-tertiary/20 rounded-full">
                    <Shield size={14} className="text-tertiary fill-current" />
                    <span className="text-tertiary text-[10px] font-bold uppercase tracking-widest">Báo cáo tổng kết chiến dịch</span>
                  </div>
                  <h2 className="text-6xl md:text-8xl font-headline font-bold text-on-surface leading-tight tracking-tight">
                    {getOutcome().title}
                  </h2>
                  <p className="text-on-surface-variant text-xl leading-relaxed max-w-xl">
                    {getOutcome().description}
                  </p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setGameState("conclusion")}
                      className="bg-primary text-on-primary font-bold px-10 py-4 rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm"
                    >
                      Xác nhận học thuyết
                    </button>
                    <button 
                      onClick={resetGame}
                      className="border border-outline-variant text-on-surface font-bold px-10 py-4 rounded-xl hover:bg-white/5 transition-all uppercase tracking-widest text-sm"
                    >
                      Lưu dữ liệu
                    </button>
                  </div>
                </div>

                <div className="relative group rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/5] lg:aspect-square">
                  <img 
                    src={getOutcome().image} 
                    alt={getOutcome().title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-10 left-10 space-y-1">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Visual ID: 2030-VN-OMEGA</p>
                    <p className="text-2xl font-headline font-bold">KỊCH BẢN TƯƠNG LAI</p>
                  </div>
                </div>
              </div>

              {/* Final Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-12 border-t border-white/5">
                <ProgressBar label="Tăng trưởng" value={scores.growth} color="text-tertiary" />
                <ProgressBar label="Tự chủ" value={scores.autonomy} color="text-secondary" />
                <ProgressBar label="Giá trị" value={scores.value} color="text-primary" />
                <ProgressBar label="Rủi ro" value={scores.risk} color="text-error" />
              </div>

              <div className="bg-surface-container p-10 rounded-3xl border border-white/5 space-y-6">
                <h3 className="text-2xl font-headline font-bold flex items-center gap-3">
                  <BarChart3 className="text-secondary" />
                  MÔ PHỎNG CHI TIẾT
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-on-surface-variant leading-loose">
                  <p>
                    Với các chỉ số <span className="text-tertiary font-bold">Growth</span> và <span className="text-secondary font-bold">Autonomy</span> này, 
                    quốc gia của bạn đã tạo ra một vị thế độc lập trên bản đồ công nghệ. Bạn đã thành công trong việc xây dựng hệ sinh thái R&D nội lực mạnh mẽ.
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="opacity-60 text-sm"> GDP Dự phóng 2030</span>
                      <span className="text-tertiary font-bold">+{Math.round(scores.growth / 5)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="opacity-60 text-sm">Chỉ số Sáng tạo</span>
                      <span className="text-primary font-bold">{Math.round(scores.value / 10)}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- CONCLUSION SCREEN --- */}
          {gameState === "conclusion" && (
            <motion.div 
              key="conclusion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-12 text-center py-24 relative w-full min-h-[600px]"
            >
              <div className="absolute inset-0 z-0 opacity-10">
                <img 
                  src="https://picsum.photos/seed/philosophy-art/1920/1080?grayscale" 
                  alt="Conclusion Backdrop" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover blur-sm"
                />
              </div>

              <div className="relative z-10 space-y-12">
                <div className="inline-block px-4 py-1.5 bg-surface-container-high rounded-full border border-primary/20">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Phase 09: Doctrine Analysis</span>
                </div>
                
                <h2 className="text-5xl md:text-8xl font-headline font-bold tracking-tighter text-on-surface">
                  Lượng đổi <span className="text-primary mx-4">→</span> có dẫn tới <span className="text-tertiary italic">chất</span> không?
                </h2>

                <p className="max-w-2xl mx-auto text-on-surface-variant text-xl leading-relaxed font-light italic">
                  “Tăng trưởng không đồng nghĩa với phát triển nếu không làm chủ công nghệ. 
                  Trong một hệ thống vĩ mô, việc tích lũy các biến đổi nhỏ lẻ cuối cùng sẽ tạo ra một bước nhảy vọt về bản chất, hay chỉ đơn giản là sự phình to của cái cũ?”
                </p>

                <div className="pt-12">
                  <button 
                    onClick={resetGame}
                    className="group relative flex items-center gap-4 bg-surface-container-high border border-primary/20 text-primary px-12 py-5 rounded-full font-headline font-bold uppercase tracking-widest transition-all hover:bg-primary/10 active:scale-95 shadow-[0_0_20px_rgba(199,153,255,0.1)]"
                  >
                    <RotateCcw className="group-hover:rotate-180 transition-transform duration-500" />
                    Chơi lại
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <NavBar activeTab={gameState} />
    </div>
  );
}
