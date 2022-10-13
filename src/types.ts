export type LocalStateMultiReadResult<KeysType> = { [ Key in string & keyof KeysType as `set${Capitalize<Key>}` ]?: KeysType[Key] };
export type LocalStateMultiSetters<KeysType> = { [ Key in string & keyof KeysType as `set${Capitalize<Key>}` ]?: (newValue: KeysType[Key]) => Promise<void> };
