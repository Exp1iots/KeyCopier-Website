// Contour renderer, ported geometry from key_copier.c's key_copier_view_measure_draw_callback,
// generalized from the Flipper's fixed 128x64/inches-per-px screen to an arbitrary calibrated
// px-per-inch scale, with floating point coordinates instead of integer rounding.

export const TOP_MARGIN_PX = 46; // fixed UI chrome above the blade (label + tick + selection arrow)
export const BOTTOM_MARGIN_PX = 22;
export const LEFT_PAD_PX = 16;
export const RIGHT_PAD_PX = 12;

export function computeLayout(format, pxPerInch) {
  const bladeHeightPx = format.uncutDepthIn * pxPerInch;
  const topEdgeY = TOP_MARGIN_PX;
  const baselineY = topEdgeY + bladeHeightPx;
  const levelContourPx = LEFT_PAD_PX + (format.lastPinIn + format.elbowIn) * pxPerInch;
  const elbowPx = format.elbowIn * pxPerInch;
  const width = Math.ceil(levelContourPx + elbowPx + RIGHT_PAD_PX);
  const height = Math.ceil(baselineY + BOTTOM_MARGIN_PX);
  return { bladeHeightPx, topEdgeY, baselineY, levelContourPx, elbowPx, width, height };
}

export function pinCenterX(format, pxPerInch, pinIndex) {
  return LEFT_PAD_PX + (format.firstPinIn + pinIndex * format.pinIncrementIn) * pxPerInch;
}

function depthPx(format, pxPerInch, depthInd) {
  return (depthInd - format.minDepthInd) * format.depthStepIn * pxPerInch;
}

// Clamp a desired depth index for a pin into the range allowed by MACS relative to its
// current neighbors, mirroring the original's incremental up/down constraint but as a
// direct interval so we can support drag/tap-to-set instead of only single steps.
export function clampDepthForPin(format, depths, pinIndex) {
  let lo = format.minDepthInd;
  let hi = format.maxDepthInd;
  if (pinIndex > 0) {
    const left = depths[pinIndex - 1];
    lo = Math.max(lo, left - format.macs);
    hi = Math.min(hi, left + format.macs);
  }
  if (pinIndex < format.pinNum - 1) {
    const right = depths[pinIndex + 1];
    lo = Math.max(lo, right - format.macs);
    hi = Math.min(hi, right + format.macs);
  }
  return { lo, hi };
}

export function setPinDepth(format, depths, pinIndex, desired) {
  const { lo, hi } = clampDepthForPin(format, depths, pinIndex);
  const clamped = Math.min(hi, Math.max(lo, Math.round(desired)));
  depths[pinIndex] = clamped;
  return clamped;
}

export function defaultDepths(format) {
  return new Array(format.pinNum).fill(format.minDepthInd);
}

// y -> depth index for the top edge (used for pointer/drag hit-testing)
export function depthIndexFromTopY(format, pxPerInch, layout, y) {
  const px = y - layout.topEdgeY;
  return format.minDepthInd + px / (format.depthStepIn * pxPerInch);
}

export function depthIndexFromBottomY(format, pxPerInch, layout, y) {
  const px = layout.baselineY - y;
  return format.minDepthInd + px / (format.depthStepIn * pxPerInch);
}

function drawNotchSide(ctx, format, pxPerInch, layout, depths, side, color) {
  // side: 'top' or 'bottom'. Both use the same per-pin depth values (mirrored cuts),
  // matching the original firmware's single depth array driving both edges.
  const halfW = (format.pinWidthIn / 2) * pxPerInch;
  const pinStepPx = format.pinIncrementIn * pxPerInch;
  const drillRadians = ((180 - format.drillAngle) / 2 / 180) * Math.PI;
  const tangent = Math.tan(drillRadians);
  const baseY = side === "top" ? layout.topEdgeY : layout.baselineY;
  const sign = side === "top" ? 1 : -1; // direction cuts move away from the edge

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = "round";

  const line = (x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  let preExtra = 0;
  let postExtra = 0;

  for (let i = 0; i < format.pinNum; i++) {
    const pinCenter = pinCenterX(format, pxPerInch, i);
    const currentDepth = depths[i] - format.minDepthInd;
    const currentDepthPx = currentDepth * format.depthStepIn * pxPerInch;
    const cutY = baseY + sign * currentDepthPx;

    // flat bottom of the notch
    line(pinCenter - halfW, cutY, pinCenter + halfW, cutY);

    let lastDepth = i === 0 ? 0 : depths[i - 1] - format.minDepthInd;
    let nextDepth = i === format.pinNum - 1 ? 0 : depths[i + 1] - format.minDepthInd;

    if (i === 0) {
      // shoulder edge from the reference line to the start of the first cut's up-slope
      line(LEFT_PAD_PX, baseY, pinCenter - halfW - currentDepthPx, baseY);
      lastDepth = 0;
      preExtra = Math.max(currentDepthPx + halfW, 0);
    }

    if (lastDepth + currentDepth > format.clearance) {
      if (i !== 0) {
        preExtra = Math.min(Math.max(pinStepPx - postExtra, halfW), pinStepPx - halfW);
      }
      line(
        pinCenter - preExtra,
        baseY + sign * Math.max((currentDepthPx - (preExtra - halfW)) * tangent, 0),
        pinCenter - halfW,
        baseY + sign * currentDepthPx * tangent
      );
    } else {
      const lastDepthPx = lastDepth * format.depthStepIn * pxPerInch;
      const slopeStartX = pinCenter - halfW - currentDepthPx;
      line(slopeStartX, baseY, pinCenter - halfW, baseY + sign * currentDepthPx * tangent);
      line(
        Math.min(pinCenter - pinStepPx + halfW + lastDepthPx, slopeStartX),
        baseY,
        slopeStartX,
        baseY
      );
    }

    if (currentDepth + nextDepth > format.clearance) {
      const product = (currentDepth / (currentDepth + nextDepth)) * pinStepPx;
      postExtra = Math.min(Math.max(product, halfW), pinStepPx - halfW);
      line(
        pinCenter + halfW,
        cutY,
        pinCenter + postExtra,
        baseY + sign * Math.max(currentDepthPx - (postExtra - halfW) * tangent, 0)
      );
    } else {
      line(pinCenter + halfW, baseY + sign * currentDepthPx * tangent, pinCenter + halfW + currentDepthPx, baseY);
    }
  }
}

export function draw(ctx, format, depths, opts) {
  const { pxPerInch, selectedPin, theme } = opts;
  const layout = computeLayout(format, pxPerInch);
  const lineColor = theme === "light" ? "#111318" : "#e8ecf4";
  const dimColor = theme === "light" ? "#8a8f9c" : "#5b6272";
  const accent = "#ff9d3f";

  ctx.clearRect(0, 0, layout.width, layout.height);

  // reference edge: butt the key's shoulder up against this line
  ctx.strokeStyle = dimColor;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(LEFT_PAD_PX, layout.topEdgeY - 4);
  ctx.lineTo(LEFT_PAD_PX, layout.baselineY + (format.sides === 2 ? 4 : 0));
  ctx.stroke();
  ctx.setLineDash([]);

  drawNotchSide(ctx, format, pxPerInch, layout, depths, "top", lineColor);
  if (format.sides === 2) {
    drawNotchSide(ctx, format, pxPerInch, layout, depths, "bottom", lineColor);
  } else {
    // flat bottom edge of a single-sided blade
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(LEFT_PAD_PX, layout.baselineY);
    ctx.lineTo(layout.levelContourPx, layout.baselineY);
    ctx.stroke();
  }

  // tip elbow taper
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(layout.levelContourPx, layout.baselineY);
  ctx.lineTo(layout.levelContourPx + layout.elbowPx, layout.baselineY - layout.elbowPx);
  ctx.stroke();

  if (format.stop === 2) {
    ctx.beginPath();
    ctx.moveTo(layout.levelContourPx, layout.topEdgeY);
    ctx.lineTo(layout.levelContourPx, layout.baselineY);
    ctx.stroke();
  }

  // per-pin labels, tick marks, selection marker
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 13px system-ui, sans-serif";
  for (let i = 0; i < format.pinNum; i++) {
    const x = pinCenterX(format, pxPerInch, i);
    const isSelected = i === selectedPin;

    ctx.strokeStyle = isSelected ? accent : dimColor;
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x, layout.topEdgeY - 6);
    ctx.lineTo(x, layout.topEdgeY);
    ctx.stroke();

    ctx.fillStyle = isSelected ? accent : lineColor;
    ctx.fillText(String(depths[i]), x, layout.topEdgeY - 16);

    if (isSelected) {
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(x - 5, layout.topEdgeY - 30);
      ctx.lineTo(x + 5, layout.topEdgeY - 30);
      ctx.lineTo(x, layout.topEdgeY - 24);
      ctx.closePath();
      ctx.fill();
    }
  }

  if (format.sides === 2) {
    ctx.fillStyle = dimColor;
    ctx.font = "500 10px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("top", 2, layout.topEdgeY);
    ctx.fillText("bottom", 2, layout.baselineY);
  }

  return layout;
}

// Given a pointer position (CSS px, canvas-local), find the nearest pin index.
export function nearestPin(format, pxPerInch, x) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < format.pinNum; i++) {
    const d = Math.abs(pinCenterX(format, pxPerInch, i) - x);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}
