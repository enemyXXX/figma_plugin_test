export const hasMessage = (x: unknown): x is { message: unknown } => {
  return typeof x === 'object' && x !== null && 'message' in (x as Record<string, unknown>);
};
export const toMessage = (event: unknown): string => {
  if (hasMessage(event)) return String(event.message);

  return String(event);
};
