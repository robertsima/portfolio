import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import {
  GET_UP,
  GROUND_Y,
  HEAD_R,
  HEAD_TOP,
  HIP_ANCHOR_Y,
  LYING,
  STAND,
  STANDING,
  STEP,
  STROKE,
  TORSO,
  VIEW_H,
  VIEW_W,
  WALL_REACH,
  clamp,
  cloneSkeleton,
  drawSkeleton,
  easeOutBack,
  effortForSpeed,
  gaitForEffort,
  gaitSkeleton,
  gaitSpeed,
  grounded,
  lerp,
  lowestPoint,
  mixGait,
  mixSkeleton,
  smoothstep,
  stillSpin,
  swingLimbs,
  swingTorso,
  type Side,
  type Skeleton,
  type Spin,
} from "./stickFigureRig";
import "./RunningStickFigureSvg.css";

const SCALE = 2; // CSS px per SVG unit
const FIG_W = VIEW_W * SCALE;
const FIG_H = VIEW_H * SCALE;

const STOP_SECONDS = 0.4; // braking time on the way into the wall
const TOUCH_SECONDS = 0.5;
const TURN_SECONDS = 0.3;
const SCARE_RADIUS = 100; // 150px
const SCARE_LINGER_SECONDS = 1;

const GRAVITY = 420;
const FLAIL = 140; // pulls the limbs up while he falls
const GRIP_STIFFNESS = 900; // how tightly he follows the cursor
const MAX_SHAKE = 1500; // cap on cursor acceleration fed to the limbs
const MAX_THROW = 600;
const CENTER_OF_MASS = 2; // up the torso from the hip
const LOWEST_GRIP = CENTER_OF_MASS + 4; // keeps the grip above his centre of mass so he hangs upright
const PHYSICS_STEP = 1 / 120;

const PLOP_SECONDS = 0.25;
const BOUNCE_SECONDS = 0.22;
const BOUNCE_HEIGHT = 3;
const LIE_SECONDS = 0.7;

type Mode = "move" | "brake" | "touch" | "turn" | "held" | "fall" | "plop" | "getUp";
type Vec = { x: number; y: number };

// Positions are in SVG units from the track's top-left corner, and (x, y) is his hip.
type Sim = {
  mode: Mode;
  elapsed: number; // seconds in the current mode
  time: number;
  dir: Side;
  yaw: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  effort: number;
  scaredUntil: number;
  brakeFrom: number;
  brakeDistance: number;
  brakeSeconds: number;
  skeleton: Skeleton; // last pose drawn
  rag: Skeleton; // pose while dangling or falling
  spin: Spin;
  landed: Skeleton;
  grip: number; // distance up the torso where he is held
  gripOffset: Vec; // cursor minus grip point
  pivot: Vec;
  pivotV: Vec;
};

const createSim = (): Sim => ({
  mode: "move",
  elapsed: 0,
  time: 0,
  dir: 1,
  yaw: 0,
  x: VIEW_W / 2,
  y: HIP_ANCHOR_Y,
  vx: 0,
  vy: 0,
  phase: 0,
  effort: 0,
  scaredUntil: 0,
  brakeFrom: 0,
  brakeDistance: 0,
  brakeSeconds: 0,
  skeleton: STANDING,
  rag: cloneSkeleton(STANDING),
  spin: stillSpin(),
  landed: STANDING,
  grip: 0,
  gripOffset: { x: 0, y: 0 },
  pivot: { x: 0, y: 0 },
  pivotV: { x: 0, y: 0 },
});

const enter = (s: Sim, mode: Mode) => {
  s.mode = mode;
  s.elapsed = 0;
};

const REST = drawSkeleton(STANDING, 0);

// Walks back and forth along the bottom of the hero. He runs when the cursor gets close,
// touches the edge of the screen before turning round, and can be picked up and dropped.
const RunningStickFigureSvg = () => {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const trackWidth = useRef(0);
  const pointer = useRef<Vec | null>(null); // client px
  const sim = useRef(createSim());

  const boxX = useMotionValue(0);
  const boxY = useMotionValue(0);
  const torso = useMotionValue(REST.torso);
  const frontLeg = useMotionValue(REST.front.leg);
  const frontArm = useMotionValue(REST.front.arm);
  const backLeg = useMotionValue(REST.back.leg);
  const backArm = useMotionValue(REST.back.arm);
  const backOpacity = useMotionValue(REST.backOpacity);
  const headX = useMotionValue(REST.head.x);
  const headY = useMotionValue(REST.head.y);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(([entry]) => {
      trackWidth.current = entry.contentRect.width;
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
    };
    const leave = (e: PointerEvent) => {
      if (!e.relatedTarget) pointer.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerout", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
    };
  }, []);

  // Client px to track units.
  const toTrack = (client: Vec, track: HTMLElement): Vec => {
    const rect = track.getBoundingClientRect();
    return { x: (client.x - rect.left) / SCALE, y: (client.y - rect.top) / SCALE };
  };

  const pickUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = sim.current;
    const track = trackRef.current;
    if (!track) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointer.current = { x: e.clientX, y: e.clientY };
    const cursor = toTrack(pointer.current, track);

    if (s.mode === "turn" && s.elapsed > TURN_SECONDS / 2) s.dir = s.dir > 0 ? -1 : 1;
    // Hold him by the point on his torso nearest the cursor.
    const { lean } = s.skeleton;
    const up = { x: Math.sin(lean) * Math.cos(s.yaw), y: -Math.cos(lean) };
    const reach =
      ((cursor.x - s.x) * up.x + (cursor.y - s.y) * up.y) / Math.max(0.01, up.x ** 2 + up.y ** 2);
    s.grip = clamp(reach, LOWEST_GRIP, HEAD_TOP);
    const grip = { x: s.x + up.x * s.grip, y: s.y + up.y * s.grip };
    s.gripOffset = { x: cursor.x - grip.x, y: cursor.y - grip.y };
    s.pivot = grip;
    s.pivotV = s.mode === "fall" ? { x: s.vx, y: s.vy } : { x: 0, y: 0 };
    if (s.mode !== "fall") s.spin = stillSpin();
    s.rag = cloneSkeleton(s.skeleton);
    enter(s, "held");
  };

  const letGo = () => {
    const s = sim.current;
    if (s.mode !== "held") return;
    s.vx = clamp(s.pivotV.x, -MAX_THROW, MAX_THROW);
    s.vy = clamp(s.pivotV.y, -MAX_THROW, MAX_THROW);
    enter(s, "fall");
  };

  useAnimationFrame((_, deltaMs) => {
    const s = sim.current;
    const track = trackRef.current;
    if (reduceMotion || !track || trackWidth.current === 0) return;

    // Cap the step so returning to a background tab doesn't teleport him.
    const dt = Math.min(deltaMs / 1000, 0.05);
    const steps = Math.ceil(dt / PHYSICS_STEP);
    const h = dt / steps;
    const width = trackWidth.current / SCALE;
    const cursor = pointer.current && toTrack(pointer.current, track);
    const facing = s.dir > 0 ? 0 : Math.PI;
    s.time += dt;
    s.elapsed += dt;

    let sk: Skeleton;
    switch (s.mode) {
      case "move": {
        if (cursor && Math.hypot(cursor.x - s.x, cursor.y - (s.y - TORSO / 2)) < SCARE_RADIUS) {
          s.scaredUntil = s.time + SCARE_LINGER_SECONDS;
        }
        const target = s.time < s.scaredUntil ? 2 : 1;
        const settleSeconds = target > s.effort ? 0.35 : 0.8;
        s.effort += (target - s.effort) * (1 - Math.exp(-dt / settleSeconds));
        const gait = gaitForEffort(s.effort);
        const speed = gaitSpeed(gait);

        const wallX = s.dir > 0 ? width - WALL_REACH : WALL_REACH;
        const remaining = (wallX - s.x) * s.dir;
        if (remaining <= (speed * STOP_SECONDS) / 2) {
          // Brake evenly so he comes to rest with his hand on the edge.
          s.brakeFrom = s.x;
          s.brakeDistance = Math.max(0, remaining);
          s.brakeSeconds = speed > 0 ? Math.max(0.2, (2 * s.brakeDistance) / speed) : 0.2;
          enter(s, "brake");
        } else {
          s.x = clamp(s.x + s.dir * speed * dt, WALL_REACH, width - WALL_REACH);
        }
        s.phase += 2 * Math.PI * gait.cadence * dt;
        sk = gaitSkeleton(gait, s.phase, 0, s.dir);
        break;
      }

      case "brake": {
        const u = Math.min(1, s.elapsed / s.brakeSeconds);
        s.x = s.brakeFrom + s.dir * s.brakeDistance * (2 * u - u * u);
        s.effort = effortForSpeed(((2 * s.brakeDistance) / s.brakeSeconds) * (1 - u));
        const gait = gaitForEffort(s.effort);
        s.phase += 2 * Math.PI * gait.cadence * dt;
        sk = gaitSkeleton(gait, s.phase, smoothstep((u - 0.35) / 0.65), s.dir);
        if (u === 1) enter(s, "touch");
        break;
      }

      case "touch":
        sk = gaitSkeleton(STAND, s.phase, 1, s.dir);
        if (s.elapsed > TOUCH_SECONDS) enter(s, "turn");
        break;

      case "turn": {
        // He swings round to face the viewer, then away, with a couple of small steps.
        const u = Math.min(1, s.elapsed / TURN_SECONDS);
        const gait = mixGait(STAND, STEP, Math.sin(Math.PI * u));
        s.phase += 2 * Math.PI * gait.cadence * dt;
        s.yaw = lerp(facing, Math.PI - facing, smoothstep(u));
        sk = gaitSkeleton(gait, s.phase, 1 - smoothstep(u / 0.4), s.dir);
        if (u === 1) {
          s.dir = s.dir > 0 ? -1 : 1;
          s.effort = 0;
          enter(s, "move");
        }
        break;
      }

      case "held": {
        const target = cursor
          ? { x: cursor.x - s.gripOffset.x, y: cursor.y - s.gripOffset.y }
          : { ...s.pivot };
        const swing = Math.max(3, s.grip - CENTER_OF_MASS);
        for (let i = 0; i < steps; i++) {
          // The grip trails the cursor on a stiff spring, which smooths out jerky mouse input.
          const ax = GRIP_STIFFNESS * (target.x - s.pivot.x) - 60 * s.pivotV.x;
          const ay = GRIP_STIFFNESS * (target.y - s.pivot.y) - 60 * s.pivotV.y;
          s.pivotV.x += ax * h;
          s.pivotV.y += ay * h;
          s.pivot.x = clamp(s.pivot.x + s.pivotV.x * h, 0, width);
          s.pivot.y += s.pivotV.y * h;
          const gx = -clamp(ax, -MAX_SHAKE, MAX_SHAKE) * Math.cos(s.yaw);
          const gy = GRAVITY - clamp(ay, -MAX_SHAKE, MAX_SHAKE);
          swingTorso(s.rag, s.spin, swing, gx, gy, h);
          swingLimbs(s.rag, s.spin, gx, gy, h);
        }
        const { lean } = s.rag;
        s.x = s.pivot.x - s.grip * Math.sin(lean) * Math.cos(s.yaw);
        s.y = s.pivot.y + s.grip * Math.cos(lean);
        // Dragging him along the floor scrapes his feet instead of sinking them.
        const floor = GROUND_Y - lowestPoint(s.rag);
        if (s.y > floor) {
          s.y = floor;
          s.pivot.y = floor - s.grip * Math.cos(lean);
          s.pivotV.y = Math.min(0, s.pivotV.y);
        }
        s.rag.y = s.y;
        sk = s.rag;
        break;
      }

      case "fall": {
        for (let i = 0; i < steps; i++) {
          s.vy += GRAVITY * h;
          s.x += s.vx * h;
          s.y += s.vy * h;
          s.spin.lean *= Math.exp(-0.8 * h);
          s.rag.lean += s.spin.lean * h;
          swingLimbs(s.rag, s.spin, 0, -FLAIL, h);
        }
        if (s.x < WALL_REACH || s.x > width - WALL_REACH) {
          s.x = clamp(s.x, WALL_REACH, width - WALL_REACH);
          s.vx *= -0.4;
        }
        s.rag.y = s.y;
        const floor = GROUND_Y - lowestPoint(s.rag);
        if (s.y >= floor) {
          s.y = s.rag.y = floor;
          s.landed = cloneSkeleton(s.rag);
          enter(s, "plop");
        }
        sk = s.rag;
        break;
      }

      case "plop": {
        // Flop onto his back, then a small bounce.
        sk = grounded(mixSkeleton(s.landed, LYING, easeOutBack(s.elapsed / PLOP_SECONDS)));
        const bounce = (s.elapsed - PLOP_SECONDS) / BOUNCE_SECONDS;
        if (bounce > 0 && bounce < 1) sk.y -= BOUNCE_HEIGHT * Math.sin(Math.PI * bounce);
        if (s.elapsed > PLOP_SECONDS + BOUNCE_SECONDS + LIE_SECONDS) enter(s, "getUp");
        break;
      }

      case "getUp": {
        let t = s.elapsed;
        let i = 1;
        while (i < GET_UP.length - 1 && t > GET_UP[i].seconds) {
          t -= GET_UP[i].seconds;
          i++;
        }
        const { pose, seconds } = GET_UP[i];
        const u = t / seconds;
        sk = grounded(mixSkeleton(GET_UP[i - 1].pose, pose, smoothstep(u)));
        if (i === GET_UP.length - 1 && u >= 1) {
          s.effort = 0;
          enter(s, "move");
        }
        break;
      }
    }

    if (s.mode !== "turn") s.yaw += (facing - s.yaw) * (1 - Math.exp(-dt / 0.12));
    s.y = sk.y;
    s.skeleton = sk;

    const drawn = drawSkeleton(sk, s.yaw);
    boxX.set((s.x - VIEW_W / 2) * SCALE);
    boxY.set((sk.y - HIP_ANCHOR_Y) * SCALE);
    torso.set(drawn.torso);
    frontLeg.set(drawn.front.leg);
    frontArm.set(drawn.front.arm);
    backLeg.set(drawn.back.leg);
    backArm.set(drawn.back.arm);
    backOpacity.set(drawn.backOpacity);
    headX.set(drawn.head.x);
    headY.set(drawn.head.y);
  });

  return (
    <div ref={trackRef} className="stick-figure-track" aria-hidden="true">
      <motion.div
        className={reduceMotion ? "stick-figure" : "stick-figure stick-figure--draggable"}
        style={{ x: boxX, y: boxY }}
        onPointerDown={reduceMotion ? undefined : pickUp}
        onPointerUp={letGo}
        onPointerCancel={letGo}
        onLostPointerCapture={letGo}
      >
        <svg
          width={FIG_W}
          height={FIG_H}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.g style={{ opacity: backOpacity }}>
            <motion.path d={backArm} />
            <motion.path d={backLeg} />
          </motion.g>
          <motion.path d={torso} />
          <motion.circle cx={headX} cy={headY} r={HEAD_R} fill="currentColor" stroke="none" />
          <motion.path d={frontLeg} />
          <motion.path d={frontArm} />
        </svg>
      </motion.div>
    </div>
  );
};

export default RunningStickFigureSvg;
