'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Flame } from 'lucide-react';

// --- 配置数据 ---
const FORTUNE_TYPES = {
  GREAT_LUCK: { level: '大吉', type: 'good', color: 'text-red-600', bg: 'bg-red-100', desc: '万事如意，心想事成' },
  LUCK: { level: '吉', type: 'good', color: 'text-red-500', bg: 'bg-red-50', desc: '顺风顺水，吉星高照' },
  MIDDLE_LUCK: { level: '中吉', type: 'good', color: 'text-orange-500', bg: 'bg-orange-50', desc: '平稳上升，虽有波折无碍' },
  SMALL_LUCK: { level: '小吉', type: 'good', color: 'text-yellow-600', bg: 'bg-yellow-50', desc: '微小确幸，宜稳扎稳打' },
  BAD: { level: '凶', type: 'bad', color: 'text-gray-600', bg: 'bg-gray-200', desc: '诸事小心，宜守不宜进' },
  GREAT_BAD: { level: '大凶', type: 'bad', color: 'text-gray-800', bg: 'bg-gray-300', desc: '退一步海阔天空，切勿强求' },
};

// 签文库
const FORTUNES_DATA = [
  { ...FORTUNE_TYPES.GREAT_LUCK, poem: "长风破浪会有时，直挂云帆济沧海。" },
  { ...FORTUNE_TYPES.GREAT_LUCK, poem: "好雨知时节，当春乃发生。" },
  { ...FORTUNE_TYPES.LUCK, poem: "山重水复疑无路，柳暗花明又一村。" },
  { ...FORTUNE_TYPES.LUCK, poem: "欲穷千里目，更上一层楼。" },
  { ...FORTUNE_TYPES.MIDDLE_LUCK, poem: "采菊东篱下，悠然见南山。" },
  { ...FORTUNE_TYPES.SMALL_LUCK, poem: "小荷才露尖尖角，早有蜻蜓立上头。" },
  { ...FORTUNE_TYPES.BAD, poem: "黑云压城城欲摧，甲光向日金鳞开。（需谨慎）" },
  { ...FORTUNE_TYPES.GREAT_BAD, poem: "风急天高猿啸哀，渚清沙白鸟飞回。（宜静养）" },
];

// --- 粒子火焰组件 (Canvas 实现) ---
const FireEffect = ({ width = 300, height = 400 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let particles = [];

    // 粒子类
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        // 从底部随机位置生成
        this.x = Math.random() * width;
        this.y = height;
        this.vx = (Math.random() - 0.5) * 2; // 左右随机漂移
        this.vy = -(Math.random() * 3 + 2);   // 向上速度
        this.life = Math.random() * 60 + 40;  // 生命周期
        this.maxLife = this.life;
        this.size = Math.random() * 15 + 10;
        this.decay = Math.random() * 0.5 + 0.5; // 衰减速度
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size -= 0.1;

        // 简单的风力/扰动模拟
        this.vx += (Math.random() - 0.5) * 0.2;

        // 如果粒子死了，重置到底部继续燃烧
        if (this.life <= 0 || this.size <= 0) {
          this.reset();
        }
      }

      draw(ctx) {
        ctx.beginPath();

        // 基于生命周期计算颜色：白 -> 黄 -> 橙 -> 红 -> 灰
        const lifeRatio = this.life / this.maxLife;
        let r = 255, g = 100, b = 0, a = lifeRatio;

        if (lifeRatio > 0.8) { // 核心热区：白/亮黄
          r = 255; g = 255; b = 200; a = 0.8;
        } else if (lifeRatio > 0.5) { // 中间：橙红
          r = 255; g = 150 + Math.random() * 50; b = 0; a = 0.7;
        } else { // 顶部：暗红/烟雾
          r = 150; g = 50; b = 50; a = 0.4;
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 初始化粒子
    for(let i=0; i<150; i++) {
      particles.push(new Particle());
    }

    const render = () => {
      // 拖尾效果：不完全清除画布，而是覆盖一层半透明背景
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // 使用 lighter 混合模式让火焰看起来发光
      ctx.globalCompositeOperation = 'lighter';

      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="absolute inset-0 pointer-events-none z-20 mix-blend-screen" />;
};


// --- 主组件 ---

export default function MainApp() {
  const [gameState, setGameState] = useState('idle'); // idle, shaking, result, burning
  const [currentFortune, setCurrentFortune] = useState(null);
  const [pinnedFortunes, setPinnedFortunes] = useState([]);

  // 模拟摇一摇检测
  const handleShake = () => {
    if (gameState !== 'idle' && gameState !== 'pinned') return;
    if (navigator.vibrate) navigator.vibrate(200);

    setGameState('shaking');

    setTimeout(() => {
      drawFortune();
    }, 2000);
  };

  const drawFortune = () => {
    const random = Math.floor(Math.random() * FORTUNES_DATA.length);
    setCurrentFortune(FORTUNES_DATA[random]);
    setGameState('result');
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  };

  const handleBurn = () => {
    setGameState('burning');
    // 燃烧动画持续时间延长一点，为了让用户看清火焰
    setTimeout(() => {
      setGameState('idle');
      setCurrentFortune(null);
    }, 3000);
  };

  const handlePin = () => {
    if (currentFortune) {
      setPinnedFortunes(prev => [currentFortune, ...prev]);
      setGameState('idle');
      setCurrentFortune(null);
    }
  };

  const resetAll = () => {
    if(confirm("确定要重置所有已固定的灵签吗？")) {
      setPinnedFortunes([]);
      setGameState('idle');
      setCurrentFortune(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#8B0000] text-amber-50 font-sans overflow-hidden flex flex-col items-center relative selection:bg-amber-200 selection:text-red-900">

      {/* 背景纹理 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
           style={{backgroundImage: 'radial-gradient(circle, #ffd700 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
      </div>

      {/* 顶部标题栏 */}
      <header className="w-full p-4 flex justify-between items-center z-10 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <h1 className="text-2xl font-bold tracking-widest text-amber-400 font-serif">每日灵签</h1>
        <div className="text-xs text-amber-200/80">
          心诚则灵
        </div>
      </header>

      {/* 主体区域 */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center p-6 relative z-0">

        {/* 已固定的好签展示区 */}
        {pinnedFortunes.length > 0 && gameState === 'idle' && (
          <div className="w-full mb-8 space-y-2 animate-fade-in-down">
            <div className="flex items-center justify-between text-amber-200/60 text-sm mb-2 px-1">
              <span>今日福运 ({pinnedFortunes.length})</span>
              <button onClick={resetAll} className="text-xs underline hover:text-white">重置</button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {pinnedFortunes.map((fortune, idx) => (
                <div key={idx} className="relative group animate-pop-in" style={{animationDelay: `${idx * 100}ms`}}>
                  <div className={`
                    w-12 h-32 border-2 border-amber-300/50 rounded-sm shadow-lg
                    flex flex-col items-center justify-center writing-vertical-lr
                    bg-gradient-to-b from-red-600 to-red-800 text-amber-100 font-serif font-bold tracking-widest cursor-default
                    hover:-translate-y-1 transition-transform duration-300
                  `}>
                    {fortune.level}
                  </div>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-400 shadow-sm border border-amber-600 z-10"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 签筒区域 */}
        {gameState === 'idle' && (
          <div className="flex flex-col items-center gap-8 animate-fade-in">
            <div
              onClick={handleShake}
              className="cursor-pointer relative group"
            >
              <div className="w-32 h-48 bg-gradient-to-b from-red-900 to-red-950 rounded-b-3xl rounded-t-lg border-4 border-amber-600 shadow-2xl flex items-center justify-center relative overflow-hidden transition-transform active:scale-95">
                <div className="absolute top-4 w-20 h-20 border-2 border-amber-500/30 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-serif text-amber-500/50">签</span>
                </div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-10 flex justify-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-2 h-12 bg-amber-200 rounded-t-sm transform translate-y-2"></div>
                  ))}
                </div>
                <p className="mt-12 text-amber-200/50 text-sm tracking-widest font-serif">点击摇签</p>
              </div>
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-amber-200 text-sm animate-pulse">摇一摇手机 或 点击签筒</span>
              </div>
            </div>
          </div>
        )}

        {/* 摇晃动画 */}
        {gameState === 'shaking' && (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-shake-hard origin-bottom">
              <div className="w-32 h-48 bg-gradient-to-b from-red-900 to-red-950 rounded-b-3xl rounded-t-lg border-4 border-amber-600 shadow-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl animate-ping opacity-20">🔲</span>
                </div>
              </div>
            </div>
            <p className="mt-8 text-xl text-amber-300 font-serif tracking-widest animate-pulse">诚心祈福...</p>
          </div>
        )}

        {/* 结果展示 */}
        {gameState === 'result' && currentFortune && (
          <div className="relative w-full max-w-sm bg-[#fffbf0] rounded-lg shadow-2xl border-4 border-amber-600 p-1 animate-zoom-in text-gray-800">
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-red-800"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-red-800"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-red-800"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-red-800"></div>

            <div className="border border-red-800/30 p-6 flex flex-col items-center text-center h-full">
              <div className={`text-5xl font-serif font-bold mb-4 ${currentFortune.color} drop-shadow-sm`}>
                {currentFortune.level}
              </div>
              <div className="w-full h-px bg-red-800/20 my-2"></div>
              <div className="flex-1 py-6 flex items-center justify-center">
                <p className="text-xl font-serif leading-loose text-gray-800 writing-vertical-cjk">
                  {currentFortune.poem}
                </p>
              </div>
              <div className="w-full h-px bg-red-800/20 my-2"></div>
              <p className="text-sm text-gray-500 mb-6 italic">
                {currentFortune.desc}
              </p>
              <div className="flex gap-4 w-full">
                {currentFortune.type === 'good' ? (
                  <button
                    onClick={handlePin}
                    className="flex-1 bg-red-700 hover:bg-red-800 text-amber-100 py-3 rounded shadow-md flex items-center justify-center gap-2 transition-colors"
                  >
                    <Sparkles size={18} />
                    <span>纳福固定</span>
                  </button>
                ) : (
                  <button
                    onClick={handleBurn}
                    className="flex-1 bg-gray-700 hover:bg-gray-800 text-white py-3 rounded shadow-md flex items-center justify-center gap-2 transition-colors"
                  >
                    <Flame size={18} />
                    <span>化解厄运</span>
                  </button>
                )}
                <button
                  onClick={() => {setGameState('idle'); setCurrentFortune(null);}}
                  className="px-4 py-3 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  放弃
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 增强版燃烧动画 */}
        {gameState === 'burning' && (
          <div className="relative flex flex-col items-center justify-center w-full max-w-sm h-96">

            {/* 燃烧的卡片：使用 mask 和 filter 模拟被烧毁的过程 */}
            <div className="relative z-10 w-64 h-80 bg-gray-200 rounded-lg shadow-2xl flex items-center justify-center overflow-hidden animate-charring">
              {/* 保持卡片内容，但在动画中会变黑变形 */}
              <span className="text-4xl text-gray-800 font-serif font-bold opacity-50">
                         {currentFortune?.level}
                     </span>
              <p className="absolute bottom-10 text-xs text-gray-500 writing-vertical-cjk">
                厄运退散
              </p>
            </div>

            {/* Canvas 火焰层 (叠加在卡片上方) */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="w-80 h-96 relative">
                <FireEffect width={320} height={384} />
              </div>
            </div>

            <p className="absolute -bottom-12 text-xl text-orange-400 font-serif animate-pulse z-30">
              烈火焚煞，百无禁忌
            </p>
          </div>
        )}

      </main>

      <footer className="w-full p-4 text-center text-amber-200/40 text-xs">
        © {new Date().getFullYear()} 灵签应用 · 每日一签
      </footer>

      <style>{`
        .writing-vertical-lr {
            writing-mode: vertical-lr;
            text-orientation: upright;
        }
        .writing-vertical-cjk {
             writing-mode: vertical-rl;
             text-orientation: upright;
        }

        @keyframes shake-hard {
            0% { transform: rotate(0deg) translate(0, 0); }
            10% { transform: rotate(-10deg) translate(-5px, 0); }
            20% { transform: rotate(10deg) translate(5px, 0); }
            30% { transform: rotate(-10deg) translate(-5px, 0); }
            40% { transform: rotate(10deg) translate(5px, 0); }
            50% { transform: rotate(-10deg) translate(-5px, 0); }
            60% { transform: rotate(10deg) translate(5px, 0); }
            70% { transform: rotate(-10deg) translate(-5px, 0); }
            80% { transform: rotate(10deg) translate(5px, 0); }
            90% { transform: rotate(-5deg) translate(-2px, 0); }
            100% { transform: rotate(0deg) translate(0, 0); }
        }
        .animate-shake-hard {
            animation: shake-hard 0.5s ease-in-out infinite;
        }

        @keyframes zoom-in {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-zoom-in {
            animation: zoom-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes pop-in {
            0% { transform: scale(0); opacity: 0; }
            80% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
            animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            opacity: 0; 
        }

        /* 复杂的焦化动画：变亮(燃烧) -> 变黑(碳化) -> 卷曲消失 */
        @keyframes charring {
            0% { 
                transform: scale(1); 
                filter: brightness(1) sepia(0);
                opacity: 1;
            }
            20% {
                /* 燃烧瞬间变亮 */
                filter: brightness(1.5) sepia(0.5) contrast(1.2);
            }
            50% {
                /* 变黑碳化 */
                transform: scale(0.95) translateY(-5px); 
                filter: brightness(0.4) sepia(1) grayscale(0.8) contrast(1.5);
                opacity: 0.9;
            }
            100% {
                /* 灰飞烟灭 */
                transform: scale(0.8) translateY(-40px); 
                filter: brightness(0) blur(4px); 
                opacity: 0;
            }
        }
        .animate-charring {
            animation: charring 2.8s forwards cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
