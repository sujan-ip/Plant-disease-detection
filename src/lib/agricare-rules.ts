export type ValidationResult = { ok: true } | { ok: false; message: string };

const ALLOWED_LEAF_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
const MAX_LEAF_IMAGE_BYTES = 6 * 1024 * 1024;

export function validateLeafImage(mimeType: string, sizeInBytes: number): ValidationResult {
  if (!ALLOWED_LEAF_IMAGE_TYPES.has(mimeType)) {
    return { ok: false, message: "Choose a JPG, JPEG, or PNG photo." };
  }
  if (sizeInBytes <= 0 || sizeInBytes > MAX_LEAF_IMAGE_BYTES) {
    return { ok: false, message: "Choose a photo smaller than 6 MB." };
  }
  return { ok: true };
}

export function soilAdviceState(values: { crop: string; soilPh: string; nitrogen: string; phosphorus: string; potassium: string }) {
  const hasAnyMeasurement = Boolean(values.soilPh.trim() || values.nitrogen.trim() || values.phosphorus.trim() || values.potassium.trim());
  if (!values.crop.trim()) return "need_crop" as const;
  if (!hasAnyMeasurement) return "need_soil_test" as const;
  return "needs_local_interpretation" as const;
}