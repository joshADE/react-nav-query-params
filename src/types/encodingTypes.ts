import { CustomTypeKeysMap, CustomOptionsTypeValue, DefaultOptionsType } from "./typeKeys";

export type EncodingMapValue<ParamType, OptionsTypeValue = DefaultOptionsType> = {
  encode: (value: ParamType, options?: OptionsTypeValue) => string | string[];
  decode: (value: string | string[], options?: OptionsTypeValue) => ParamType;
  defaultValue?: ParamType;
  encodingOptions?: OptionsTypeValue;
};


export type TypeMapValue<ParamType, OptionsTypeValue = DefaultOptionsType> = {
  defaultValue?: ParamType;
  encodingMap: EncodingMapValue<ParamType, OptionsTypeValue>;
  category: "simple" | "complex" | "custom";
  match?: (value: unknown, options?: OptionsTypeValue) => boolean;
  matchPriority?: number;
};


export type CustomTypeKeysDefinitionValue<
  TCustomKeyDefinition extends CustomTypeKeysMap,
  TCustomKeyOptions extends CustomOptionsTypeValue<TCustomKeyDefinition> = CustomOptionsTypeValue<TCustomKeyDefinition>, 
> 
= { [customTypeKey in keyof TCustomKeyDefinition]: TypeMapValue<TCustomKeyDefinition[customTypeKey], TCustomKeyOptions[customTypeKey]> };


