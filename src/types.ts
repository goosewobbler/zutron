import { StoreApi } from 'zustand';

export type Thunk<S> = (dispatch: Dispatch<S>, store: StoreApi<Partial<S>>) => void;
export type Action = { type: string; payload: unknown };
export type AnyState = Record<string, unknown>;
export type Reducer<S extends AnyState> = (state: Partial<S>, args: Record<string, unknown>) => Partial<S>;
export type Handler = (arg: any) => void;
export type MainZustandBridgeOpts<S extends AnyState> = {
  handlers?: Record<string, Handler>;
  reducer?: Reducer<S>;
};

export type Dispatch<S> = {
  (action: string, payload?: unknown): void;
  (action: Action): void;
  (action: Thunk<S>): void;
};

interface BaseHandler<S> {
  dispatch: Dispatch<S>;
}

export interface Handlers<S extends AnyState> extends BaseHandler<S> {
  getState(): Promise<Partial<S>>;
  subscribe(callback: (newState: S) => void): () => void;
}

export type PreloadZustandBridgeReturn<S extends AnyState> = {
  handlers: Handlers<S>;
};
