import { OptionsJson, OptionsText, OptionsUrlencoded, Options as RawOptions } from 'body-parser';

export enum BanhMiBodyParsingMethod {
    json = "json", 
    raw = "raw" , 
    text = "text", 
    urlencoded = "urlencoded" 
}


type BodyParsingOptionsMap = {
    [BanhMiBodyParsingMethod.json]: OptionsJson;
    [BanhMiBodyParsingMethod.raw]: RawOptions;
    [BanhMiBodyParsingMethod.text]: OptionsText;
    [BanhMiBodyParsingMethod.urlencoded]: OptionsUrlencoded;
}

export type SetupBodyParserOption<T extends BanhMiBodyParsingMethod = BanhMiBodyParsingMethod.json | BanhMiBodyParsingMethod.raw | BanhMiBodyParsingMethod.text | BanhMiBodyParsingMethod.urlencoded> = {
    method: T;
    options?: BodyParsingOptionsMap[T];
}


