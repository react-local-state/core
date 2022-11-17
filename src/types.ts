export type LocalStateMultiGetters<KeysType> = { [ Key in string & keyof KeysType ]: KeysType[Key] };
export type LocalStateMultiSetters<KeysType> = { [ Key in string & keyof KeysType as `set${Capitalize<Key>}` ]: (newValue: KeysType[Key]) => Promise<void> };
export type LocalStateMultiRemovers<KeysType> = { [ Key in string & keyof KeysType as `remove${Capitalize<Key>}` ]: () => Promise<void> };

export type LocalStateMulti<KeysType> = 
  LocalStateMultiGetters<KeysType> 
  & LocalStateMultiSetters<KeysType> 
  & LocalStateMultiRemovers<KeysType>;
