import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";
import { motion } from "framer-motion";

interface VortexProps {
  children?: any;
  className?: string;
  containerClassName?: string;
  particleCount?: number;
  rangeY?: number;
  baseHue?: number;
  baseSpeed?: number;
  rangeSpeed?: number;
  baseRadius?: number;
  rangeRadius?: number;
  backgroundColor?: string;
}

export const Vortex = (props: VortexProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef(null);
  const particleCount = props.particleCount || 700;
  const particlePropCount = 9;
  const particlePropsLength = particleCount * particlePropCount;
  const rangeY = props.rangeY || 100;
  const baseTTL = 50;
  const rangeTTL = 150;
  const baseSpeed = props.baseSpeed || 0.0;
  const rangeSpeed = props.rangeSpeed || 1.5;
  const baseRadius = props.baseRadius || 1;
  const rangeRadius = props.rangeRadius || 2;
  const baseHue = props.baseHue || 220;
  const rangeHue = 100;
  const noiseSteps = 3;
  const xOff = 0.00125;
  const yOff = 0.00125;
  const zOff = 0.0005;
  const backgroundColor = props.backgroundColor || "#000000";

  let tick = 0;
  const noise3D = createNoise3D();
  let particleProps = new Float32Array(particlePropsLength);
  let center: [number, number] = [0, 0];

  const HALF_PI: number = 0.5 * Math.PI;
  const TAU: number = 2 * Math.PI;
  const TO_RAD: number = Math.PI / 180;

  const rand = (n: number): number => n * Math.random();
  const randRange = (n: number): number => n - rand(2 * n);

  const fadeInOut = (t: number, m: number): number => {
    let hm = 0.5 * m;
    return Math.abs(((t + hm) % m) - hm) / hm;
  };

  const lerp = (n1: number, n2: number, speed: number): number =>
    (1 - speed) * n1 + speed * n2;

  /**
   * Desenha um dado (D6) no canvas
   */
  const drawDice = (
    x: number,
    y: number,
    size: number,
    rotation: number,
    opacity: number,
    ctx: CanvasRenderingContext2D
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;

    const s = size * 0.5;
    // Desenhar cubo simples (dado)
    ctx.strokeStyle = `hsla(${baseHue}, 100%, 70%, ${opacity})`;
    ctx.fillStyle = `hsla(${baseHue}, 80%, 20%, ${opacity * 0.3})`;
    ctx.lineWidth = 1;

    // Face frontal do dado
    ctx.beginPath();
    ctx.rect(-s, -s, s * 2, s * 2);
    ctx.fill();
    ctx.stroke();

    // Desenhar pontos (pips) do dado
    ctx.fillStyle = `hsla(${baseHue}, 100%, 70%, ${opacity})`;
    const pipSize = s * 0.15;
    const offset = s * 0.3;
    
    // Padrão de 3 pontos (um dos lados do dado)
    ctx.beginPath();
    ctx.arc(-offset, -offset, pipSize, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, pipSize, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(offset, offset, pipSize, 0, TAU);
    ctx.fill();

    ctx.restore();
  };

  /**
   * Desenha uma runa mágica no canvas
   */
  const drawRune = (
    x: number,
    y: number,
    size: number,
    rotation: number,
    opacity: number,
    ctx: CanvasRenderingContext2D
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;

    ctx.strokeStyle = `hsla(${baseHue + 30}, 100%, 60%, ${opacity})`;
    ctx.lineWidth = 1.5;

    // Desenhar símbolo de runa (padrão geométrico)
    const s = size * 0.4;
    ctx.beginPath();
    // Linha vertical central
    ctx.moveTo(0, -s);
    ctx.lineTo(0, s);
    // Linhas diagonais
    ctx.moveTo(-s * 0.6, -s * 0.3);
    ctx.lineTo(s * 0.6, s * 0.3);
    ctx.moveTo(-s * 0.6, s * 0.3);
    ctx.lineTo(s * 0.6, -s * 0.3);
    // Círculo no centro
    ctx.arc(0, 0, s * 0.2, 0, TAU);
    ctx.stroke();

    ctx.restore();
  };

  /**
   * Desenha um símbolo de espada no canvas
   */
  const drawSword = (
    x: number,
    y: number,
    size: number,
    rotation: number,
    opacity: number,
    ctx: CanvasRenderingContext2D
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;

    const s = size * 0.5;
    ctx.strokeStyle = `hsla(${baseHue + 60}, 100%, 50%, ${opacity})`;
    ctx.fillStyle = `hsla(${baseHue + 60}, 100%, 50%, ${opacity * 0.5})`;
    ctx.lineWidth = 1.5;

    // Lâmina
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(0, s * 0.7);
    ctx.stroke();

    // Guarda (cruz)
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, s * 0.3);
    ctx.lineTo(s * 0.3, s * 0.3);
    ctx.stroke();

    // Punho
    ctx.beginPath();
    ctx.rect(-s * 0.1, s * 0.3, s * 0.2, s * 0.3);
    ctx.fill();

    ctx.restore();
  };

  /**
   * Desenha um símbolo de escudo no canvas
   */
  const drawShield = (
    x: number,
    y: number,
    size: number,
    rotation: number,
    opacity: number,
    ctx: CanvasRenderingContext2D
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;

    const s = size * 0.5;
    ctx.strokeStyle = `hsla(${baseHue - 30}, 100%, 55%, ${opacity})`;
    ctx.fillStyle = `hsla(${baseHue - 30}, 80%, 25%, ${opacity * 0.3})`;
    ctx.lineWidth = 1.5;

    // Forma de escudo
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(-s * 0.8, 0, 0, s);
    ctx.quadraticCurveTo(s * 0.8, 0, 0, -s);
    ctx.fill();
    ctx.stroke();

    // Símbolo no centro
    ctx.strokeStyle = `hsla(${baseHue - 30}, 100%, 60%, ${opacity})`;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.3);
    ctx.lineTo(0, s * 0.3);
    ctx.moveTo(-s * 0.2, 0);
    ctx.lineTo(s * 0.2, 0);
    ctx.stroke();

    ctx.restore();
  };

  const setup = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        resize(canvas, ctx);
        initParticles();
        draw(canvas, ctx);
      }
    }
  };

  const initParticles = () => {
    tick = 0;
    particleProps = new Float32Array(particlePropsLength);
    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
      initParticle(i);
    }
  };

  const initParticle = (i: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let x, y, vx, vy, life, ttl, speed, radius, hue;

    x = rand(canvas.width);
    y = center[1] + randRange(rangeY);
    vx = 0;
    vy = 0;
    life = 0;
    ttl = baseTTL + rand(rangeTTL);
    speed = baseSpeed + rand(rangeSpeed);
    radius = baseRadius + rand(rangeRadius);
    hue = baseHue + rand(rangeHue);

    particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
  };

  const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    tick++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawParticles(ctx);
    renderGlow(canvas, ctx);
    renderToScreen(canvas, ctx);

    window.requestAnimationFrame(() => draw(canvas, ctx));
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
      updateParticle(i, ctx);
    }
  };

  const updateParticle = (i: number, ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let i2 = 1 + i,
      i3 = 2 + i,
      i4 = 3 + i,
      i5 = 4 + i,
      i6 = 5 + i,
      i7 = 6 + i,
      i8 = 7 + i,
      i9 = 8 + i;

    let n, x, y, vx, vy, life, ttl, speed, x2, y2, radius, hue;

    x = particleProps[i];
    y = particleProps[i2];
    n = noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU;
    vx = lerp(particleProps[i3], Math.cos(n), 0.5);
    vy = lerp(particleProps[i4], Math.sin(n), 0.5);
    life = particleProps[i5];
    ttl = particleProps[i6];
    speed = particleProps[i7];
    x2 = x + vx * speed;
    y2 = y + vy * speed;
    radius = particleProps[i8];
    hue = particleProps[i9];

    const opacity = fadeInOut(life, ttl);
    const rotation = (life / ttl) * TAU;
    const elementSize = radius * 8; // Tamanho dos elementos RPG

    // Alternar entre diferentes elementos RPG baseado no índice
    const elementType = i % 4;
    
    if (elementType === 0) {
      drawDice(x, y, elementSize, rotation, opacity, ctx);
    } else if (elementType === 1) {
      drawRune(x, y, elementSize, rotation, opacity, ctx);
    } else if (elementType === 2) {
      drawSword(x, y, elementSize, rotation, opacity, ctx);
    } else {
      drawShield(x, y, elementSize, rotation, opacity, ctx);
    }

    // Desenhar rastro/linha conectando movimento
    ctx.save();
    ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${opacity * 0.3})`;
    ctx.lineWidth = radius * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();

    life++;

    particleProps[i] = x2;
    particleProps[i2] = y2;
    particleProps[i3] = vx;
    particleProps[i4] = vy;
    particleProps[i5] = life;
    (checkBounds(x, y, canvas) || life > ttl) && initParticle(i);
  };

  const checkBounds = (x: number, y: number, canvas: HTMLCanvasElement) => {
    return x > canvas.width || x < 0 || y > canvas.height || y < 0;
  };

  const resize = (
    canvas: HTMLCanvasElement,
    ctx?: CanvasRenderingContext2D
  ) => {
    const { innerWidth, innerHeight } = window;
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    center[0] = 0.5 * canvas.width;
    center[1] = 0.5 * canvas.height;
  };

  const renderGlow = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) => {
    ctx.save();
    ctx.filter = "blur(8px) brightness(200%)";
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.filter = "blur(4px) brightness(200%)";
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  };

  const renderToScreen = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  };

  useEffect(() => {
    setup();
    window.addEventListener("resize", () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        resize(canvas, ctx);
      }
    });
  }, []);

  return (
    <div className={cn("relative h-full w-full", props.containerClassName)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        ref={containerRef}
        className="absolute h-full w-full inset-0 z-0 bg-transparent flex items-center justify-center"
      >
        <canvas ref={canvasRef}></canvas>
      </motion.div>
      <div className={cn("relative z-10", props.className)}>
        {props.children}
      </div>
    </div>
  );
};
