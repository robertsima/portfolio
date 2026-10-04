// Skeleton, gaits and drawing for the stick figure. Everything is in SVG units with y
// pointing down. Limb angles are measured from straight down, and positive points the
// way he faces.

export const deg = (d: number) => (d * Math.PI) / 180;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
export const smoothstep = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
export const easeOutBack = (t: number) => {
  const x = clamp(t, 0, 1) - 1;
  return 1 + 2.7 * x * x * x + 1.7 * x * x;
};
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const lerpAngle = (a: number, b: number, t: number) => a + wrapAngle(b - a) * t;

const THIGH = 11;
const SHIN = 11;
export const TORSO = 15;
const SHOULDER = TORSO - 2; // hip to shoulders, along the torso
const UPPER_ARM = 8;
const FOREARM = 7;
export const HEAD_R = 4;
const HEAD_CENTER = TORSO + 1.5 + HEAD_R;
export const HEAD_TOP = HEAD_CENTER + HEAD_R;
// Half widths across the body. They only show while he is turned towards the viewer.
const HIP_HALF = 1.8;
const SHOULDER_HALF = 2.4;
export const STROKE = 2.6;

export const VIEW_W = 48;
export const VIEW_H = 425; //sets the ground from the top
export const GROUND_Y = VIEW_H - 2;
// Where the hip sits inside the SVG box. The box travels with the hip.
export const HIP_ANCHOR_Y = GROUND_Y - THIGH - SHIN;

export type Limb = { upper: number; lower: number };
// Index 0 is the side facing the viewer while he faces right, index 1 the other side.
export type Skeleton = { y: number; lean: number; legs: [Limb, Limb]; arms: [Limb, Limb] };
export type Spin = Omit<Skeleton, "y">; // angular velocities
export type Side = 1 | -1;

type Local = { f: number; y: number }; // offset from the hip: forward, down
type Pt = { x: number; y: number };

const along = (from: Local, angle: number, length: number): Local => ({
  f: from.f + Math.sin(angle) * length,
  y: from.y + Math.cos(angle) * length,
});

function joints(sk: Skeleton) {
  const hip = { f: 0, y: 0 };
  const up = Math.PI - sk.lean;
  const shoulder = along(hip, up, SHOULDER);
  const chain = (root: Local, limb: Limb, first: number, second: number) => {
    const mid = along(root, limb.upper, first);
    return { mid, end: along(mid, limb.lower, second) };
  };
  return {
    hip,
    shoulder,
    neck: along(hip, up, TORSO),
    head: along(hip, up, HEAD_CENTER),
    legs: sk.legs.map((leg) => chain(hip, leg, THIGH, SHIN)),
    arms: sk.arms.map((arm) => chain(shoulder, arm, UPPER_ARM, FOREARM)),
  };
}

// Distance from the hip down to the lowest point of the figure.
export function lowestPoint(sk: Skeleton) {
  const j = joints(sk);
  const limbs = [...j.legs, ...j.arms].flatMap((c) => [c.mid.y, c.end.y]);
  return Math.max(0, j.shoulder.y, j.head.y + HEAD_R - STROKE / 2, ...limbs);
}

export const grounded = (sk: Skeleton): Skeleton => ({ ...sk, y: GROUND_Y - lowestPoint(sk) });

export function mixSkeleton(a: Skeleton, b: Skeleton, t: number): Skeleton {
  const limb = (p: Limb, q: Limb) => ({
    upper: lerpAngle(p.upper, q.upper, t),
    lower: lerpAngle(p.lower, q.lower, t),
  });
  return {
    y: lerp(a.y, b.y, t),
    lean: lerpAngle(a.lean, b.lean, t),
    legs: [limb(a.legs[0], b.legs[0]), limb(a.legs[1], b.legs[1])],
    arms: [limb(a.arms[0], b.arms[0]), limb(a.arms[1], b.arms[1])],
  };
}

export const cloneSkeleton = (sk: Skeleton): Skeleton => ({
  y: sk.y,
  lean: sk.lean,
  legs: [{ ...sk.legs[0] }, { ...sk.legs[1] }],
  arms: [{ ...sk.arms[0] }, { ...sk.arms[1] }],
});

// ---------------------------------------------------------------- gaits

export type Gait = {
  cadence: number; // full strides (two steps) per second
  hipSwing: number;
  hipBias: number; // runners reach further forward than back
  kneeStance: number;
  kneeKick: number; // extra knee bend through the swing
  armSwing: number;
  elbow: number;
  lean: number;
  lift: number; // hip rise while both feet are off the ground
};

export const STAND: Gait = {
  cadence: 0,
  hipSwing: 0,
  hipBias: 0,
  kneeStance: deg(2),
  kneeKick: 0,
  armSwing: 0,
  elbow: deg(8),
  lean: 0,
  lift: 0,
};

const WALK: Gait = {
  cadence: 0.95,
  hipSwing: deg(24),
  hipBias: deg(2),
  kneeStance: deg(4),
  kneeKick: deg(50),
  armSwing: deg(24),
  elbow: deg(15),
  lean: deg(3),
  lift: 0,
};

const RUN: Gait = {
  cadence: 2,
  hipSwing: deg(42),
  hipBias: deg(10),
  kneeStance: deg(16),
  kneeKick: deg(100),
  armSwing: deg(48),
  elbow: deg(85),
  lean: deg(14),
  lift: 3.5,
};

// Small steps on the spot while he turns round.
export const STEP: Gait = {
  cadence: 1.6,
  hipSwing: deg(6),
  hipBias: deg(4),
  kneeStance: deg(4),
  kneeKick: deg(45),
  armSwing: deg(6),
  elbow: deg(12),
  lean: 0,
  lift: 0,
};

export function mixGait(from: Gait, to: Gait, t: number): Gait {
  const gait = { ...from };
  for (const key of Object.keys(gait) as (keyof Gait)[]) {
    gait[key] = lerp(from[key], to[key], clamp(t, 0, 1));
  }
  return gait;
}

// effort 0 = standing, 1 = walking, 2 = running.
export const gaitForEffort = (effort: number) =>
  effort < 1 ? mixGait(STAND, WALK, effort) : mixGait(WALK, RUN, effort - 1);

// Ground covered per second. Each step moves the body exactly as far as the planted foot
// sweeps back under the hip, so the feet don't slide.
export function gaitSpeed(g: Gait) {
  const footF = (thigh: number) =>
    THIGH * Math.sin(thigh) + SHIN * Math.sin(thigh - g.kneeStance);
  return (footF(g.hipBias + g.hipSwing) - footF(g.hipBias - g.hipSwing)) * 2 * g.cadence;
}

const EFFORT_SAMPLES = 300;
const SPEED_AT_EFFORT = Array.from({ length: EFFORT_SAMPLES + 1 }, (_, i) =>
  gaitSpeed(gaitForEffort((2 * i) / EFFORT_SAMPLES)),
);

// Inverse of gaitSpeed, so braking can slow his legs to match how fast he is moving.
export function effortForSpeed(speed: number) {
  const i = SPEED_AT_EFFORT.findIndex((s) => s >= speed);
  if (i === -1) return 2;
  if (i === 0) return 0;
  const lo = SPEED_AT_EFFORT[i - 1];
  const hi = SPEED_AT_EFFORT[i];
  return (2 * (i - 1 + (speed - lo) / (hi - lo))) / EFFORT_SAMPLES;
}

// Arm and lean while his hand rests on the wall.
const WALL_UPPER_ARM = deg(80);
const WALL_FOREARM = deg(95);
const WALL_LEAN = deg(6);
// Hip to fingertip in that pose, so he stops with his hand right on the edge.
export const WALL_REACH =
  SHOULDER * Math.sin(WALL_LEAN) +
  UPPER_ARM * Math.sin(WALL_UPPER_ARM) +
  FOREARM * Math.sin(WALL_FOREARM) +
  STROKE / 2;

// reach blends the arm on reachSide from its swing onto the wall (0..1).
export function gaitSkeleton(g: Gait, phase: number, reach = 0, reachSide: Side = 1): Skeleton {
  const leg = (p: number) => {
    const upper = g.hipBias + g.hipSwing * Math.sin(p);
    // The knee bends most early in the swing, right after the foot leaves the ground.
    return { upper, lower: upper - g.kneeStance - g.kneeKick * Math.max(0, Math.cos(p + 0.4)) };
  };
  // Each arm swings against the leg on the same side.
  const arm = (p: number, side: Side) => {
    const upper = g.lean / 2 - g.armSwing * Math.sin(p);
    const lower = upper + g.elbow;
    if (side !== reachSide) return { upper, lower };
    return { upper: lerp(upper, WALL_UPPER_ARM, reach), lower: lerp(lower, WALL_FOREARM, reach) };
  };
  const sk: Skeleton = {
    y: 0,
    lean: g.lean + reach * WALL_LEAN,
    legs: [leg(phase), leg(phase + Math.PI)],
    arms: [arm(phase, 1), arm(phase + Math.PI, -1)],
  };
  // Legs are spread widest mid-flight.
  const airborne = Math.max(0, -Math.cos(2 * phase));
  return { ...sk, y: GROUND_Y - lowestPoint(sk) - g.lift * airborne };
}

// ---------------------------------------------------------------- getting back up

const limb = (upper: number, lower: number): Limb => ({ upper: deg(upper), lower: deg(lower) });
const keyframe = (lean: number, legs: [Limb, Limb], arms: [Limb, Limb]) =>
  grounded({ y: 0, lean: deg(lean), legs, arms });

export const STANDING = gaitSkeleton(STAND, 0);

// Flat on his back, one knee up, one arm flung over his head.
export const LYING = keyframe(-82, [limb(88, 92), limb(125, 55)], [limb(-80, -88), limb(78, 95)]);

// Sitting up, propped on one hand, the other arm on his knee.
const SITTING = keyframe(-10, [limb(88, 92), limb(120, 60)], [limb(-35, -25), limb(40, 80)]);

// Feet pulled under him, pushing off his knees.
const CROUCHING = keyframe(40, [limb(80, -20), limb(90, -10)], [limb(5, 40), limb(10, 45)]);

export const GET_UP: { pose: Skeleton; seconds: number }[] = [
  { pose: LYING, seconds: 0 },
  { pose: SITTING, seconds: 0.45 },
  { pose: CROUCHING, seconds: 0.4 },
  { pose: STANDING, seconds: 0.5 },
];

// ---------------------------------------------------------------- dangling

const LIMB_DAMPING = 3;
const LIMIT_STIFFNESS = 500;
const REST_STIFFNESS = 80;
const HIP_RANGE: [number, number] = [deg(-35), deg(125)];
const KNEE_RANGE: [number, number] = [deg(-145), 0];
const ELBOW_RANGE: [number, number] = [0, deg(150)];
// A limp limb doesn't hang perfectly straight. Offsets from the body's down direction
// (upper) and from the upper segment (lower).
const DANGLE = {
  legs: [limb(12, -15), limb(-10, -25)],
  arms: [limb(25, 35), limb(-15, 30)],
};

export const stillSpin = (): Spin => ({
  lean: 0,
  legs: [limb(0, 0), limb(0, 0)],
  arms: [limb(0, 0), limb(0, 0)],
});

// Angular acceleration of a pendulum at `angle` under effective gravity (gx, gy).
const pendulum = (angle: number, length: number, gx: number, gy: number) =>
  (gx * Math.cos(angle) - gy * Math.sin(angle)) / length;

// How far value is outside [min, max]. Zero inside.
const excess = (value: number, [min, max]: [number, number]) =>
  value < min ? value - min : value > max ? value - max : 0;

function swingLimb(
  limb: Limb,
  spin: Limb,
  rest: Limb,
  lengths: [number, number],
  rootRange: [number, number] | null,
  jointRange: [number, number],
  lean: number,
  gx: number,
  gy: number,
  dt: number,
) {
  const bodyDown = -lean;
  const atRoot = rootRange ? excess(limb.upper - bodyDown, rootRange) : 0;
  const atJoint = excess(limb.lower - limb.upper, jointRange);
  const upperAcc =
    pendulum(limb.upper, lengths[0], gx, gy) +
    REST_STIFFNESS * (bodyDown + rest.upper - limb.upper) -
    LIMIT_STIFFNESS * atRoot +
    LIMIT_STIFFNESS * atJoint * 0.5 -
    LIMB_DAMPING * spin.upper;
  const lowerAcc =
    pendulum(limb.lower, lengths[1], gx, gy) +
    REST_STIFFNESS * (limb.upper + rest.lower - limb.lower) -
    LIMIT_STIFFNESS * atJoint -
    LIMB_DAMPING * spin.lower;
  spin.upper = clamp(spin.upper + upperAcc * dt, -30, 30);
  spin.lower = clamp(spin.lower + lowerAcc * dt, -30, 30);
  limb.upper += spin.upper * dt;
  limb.lower += spin.lower * dt;
}

// Lets every limb swing like a damped pendulum. (gx, gy) is the gravity felt in his own
// frame: real gravity minus however the cursor is accelerating him.
export function swingLimbs(sk: Skeleton, spin: Spin, gx: number, gy: number, dt: number) {
  for (const i of [0, 1] as const) {
    swingLimb(sk.legs[i], spin.legs[i], DANGLE.legs[i], [THIGH, SHIN * 0.7], HIP_RANGE, KNEE_RANGE, sk.lean, gx, gy, dt);
    swingLimb(sk.arms[i], spin.arms[i], DANGLE.arms[i], [UPPER_ARM, FOREARM * 0.7], null, ELBOW_RANGE, sk.lean, gx, gy, dt);
  }
}

const MAX_SWING = deg(100);

// The torso hangs from the grip like a pendulum of the given length. It can swing up to
// sideways but never over the top, however hard he is shaken.
export function swingTorso(sk: Skeleton, spin: Spin, length: number, gx: number, gy: number, dt: number) {
  const acc = -pendulum(-sk.lean, length, gx, gy) - 4 * spin.lean;
  spin.lean = clamp(spin.lean + acc * dt, -30, 30);
  sk.lean += spin.lean * dt;
  if (Math.abs(sk.lean) > MAX_SWING) {
    sk.lean = Math.sign(sk.lean) * MAX_SWING;
    spin.lean = 0;
  }
}

// ---------------------------------------------------------------- drawing

const f2 = (n: number) => n.toFixed(2);
const polyline = (...pts: Pt[]) =>
  pts.map((p, i) => `${i ? "L" : "M"}${f2(p.x)} ${f2(p.y)}`).join("");

// yaw 0 faces right, π faces left and π/2 faces the viewer.
export function drawSkeleton(sk: Skeleton, yaw: number) {
  const j = joints(sk);
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  const at = (p: Local, lateral = 0): Pt => ({
    x: VIEW_W / 2 + p.f * cos - lateral * sin,
    y: HIP_ANCHOR_Y + p.y,
  });

  const sides = ([1, -1] as const).map((side, i) => {
    const hipJoint = side * HIP_HALF;
    const shoulderJoint = side * SHOULDER_HALF;
    const leg = j.legs[i];
    const arm = j.arms[i];
    return {
      leg: polyline(at(j.hip), at(j.hip, hipJoint), at(leg.mid, hipJoint), at(leg.end, hipJoint)),
      arm: polyline(at(j.shoulder), at(j.shoulder, shoulderJoint), at(arm.mid, shoulderJoint), at(arm.end, shoulderJoint)),
    };
  });
  const [front, back] = cos >= 0 ? [sides[0], sides[1]] : [sides[1], sides[0]];

  return {
    torso: polyline(at(j.hip), at(j.neck)),
    head: at(j.head),
    front,
    back,
    // Both sides are equally close while he faces the viewer mid-turn.
    backOpacity: 1 - 0.55 * Math.abs(cos),
  };
}
