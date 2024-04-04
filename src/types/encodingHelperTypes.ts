import { SimpleTypeKeys, TypeKeyToTypeMapping, GetOptionsForValidTypeKey } from './typeKeys';
import { EncodingMapValue } from './encodingTypes';

export type EncodingHelperTypeGenerator<K extends SimpleTypeKeys> = {
    array: Array<TypeKeyToTypeMapping[K]>;
    record: Record<string, TypeKeyToTypeMapping[K]>;
    recordWithNumberKeys: Record<number, TypeKeyToTypeMapping[K]>;
    enum: TypeKeyToTypeMapping[K];
    // enumArray: Array<TypeKeyToTypeMapping[K]>;
    // enumRecord: Record<string, TypeKeyToTypeMapping[K]>;
};

export type EncodingHelperTypeGenratorMapping = {
    [K in SimpleTypeKeys]: {
        [H in keyof EncodingHelperTypeGenerator<K>]: EncodingHelperTypeGenerator<K>[H];
    }
};

export type EncodingHelperKeyValueArrayMapping = {
    [K in keyof EncodingHelperTypeGenratorMapping]: {
        [H in keyof EncodingHelperTypeGenratorMapping[K]]: H extends string ? [JoinInnerAndOuterKey<K, H>, EncodingHelperTypeGenratorMapping[K][H]] : never;
    }[keyof EncodingHelperTypeGenratorMapping[K]];
}[keyof EncodingHelperTypeGenratorMapping];


export type ExtractValueFromTuple<T, K> = T extends [K, (infer U)] ? U : never;

export type CapitalizeFirstLetter<S extends string> = S extends `${infer FirstLetter}${infer Rest}` ? `${Uppercase<FirstLetter>}${Rest}` : S;

export type JoinInnerAndOuterKey<OuterKey extends string, InnerKey extends string> = `${OuterKey}${CapitalizeFirstLetter<InnerKey>}`;

export type GeneratedHelperTypeKeyToTypeMapping = {
    [K in EncodingHelperKeyValueArrayMapping[0]]: ExtractValueFromTuple<EncodingHelperKeyValueArrayMapping, K>;
}


export type EncodingHelperTypeKeyToTypeMapping = GeneratedHelperTypeKeyToTypeMapping & {
    date: Date;
}

export type EncodingHelperEncodingMapValue<TypeKey extends keyof EncodingHelperTypeKeyToTypeMapping> 
= EncodingMapValue<EncodingHelperTypeKeyToTypeMapping[TypeKey], GetOptionsForValidTypeKey<TypeKey>>;
