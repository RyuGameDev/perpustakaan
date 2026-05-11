export function isMissingSchemaError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { code?: string; message?: string };
  return maybeError.code === "PGRST205" || maybeError.message?.includes("Could not find the table") === true;
}
