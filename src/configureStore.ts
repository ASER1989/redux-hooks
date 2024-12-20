import {addTaker, takeMiddleware} from './middlewares/take';
import {
  ConfigureStoreOptions,
  EnhancedStore,
  Reducer,
  configureStore as toolkitConfigureStore,
} from '@reduxjs/toolkit';
import {ReducerManager, createReducerManager} from './tools/reducerManager';

interface Store<State> extends EnhancedStore<State> {
  reducerManager: ReducerManager<State>;
  addTaker: (actionType: string, callback: () => void) => () => void;
}

let store: Store<any> | undefined;
export const getStore = () => store;
export const configureStore = <State = Record<string, unknown>>(
  options: ConfigureStoreOptions<State> = {} as ConfigureStoreOptions<State>,
): Store<State> => {
  if (store) {
    return store;
  }

  const reducerManager = createReducerManager<State>(options?.reducer);

  store = toolkitConfigureStore({
    ...options,
    reducer: reducerManager.reduce as Reducer<State>,
    middleware: (getDefaultMiddleware) => {
      if (options.middleware) {
        const middlewares = options.middleware(getDefaultMiddleware);
        return middlewares.concat(takeMiddleware);
      }
      return getDefaultMiddleware().concat(takeMiddleware);
    },
  }) as Store<State>;

  store.reducerManager = reducerManager;
  store.addTaker = addTaker;

  return store;
};
