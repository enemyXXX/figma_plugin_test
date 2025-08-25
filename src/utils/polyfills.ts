type ImmediateHandler = (...args: unknown[]) => void;

interface GlobalWithImmediate {
  setImmediate?: (handler: ImmediateHandler, ...args: unknown[]) => number;
  clearImmediate?: (id: number) => void;
}

const G = globalThis as GlobalWithImmediate;

if (typeof G.setImmediate !== 'function') {
  G.setImmediate = (handler: ImmediateHandler, ...args: unknown[]): number =>
    setTimeout(() => handler(...args), 0) as unknown as number;
}

if (typeof G.clearImmediate !== 'function') {
  G.clearImmediate = (id: number): void => {
    clearTimeout(id as unknown as number);
  };
}
