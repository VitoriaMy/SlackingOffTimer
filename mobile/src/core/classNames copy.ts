

import { StyleSheet } from "react-native";


interface className_arg_object {
    [key: string]: boolean | undefined;
}

type classNames_core_Argument = string | className_arg_object | classNames_core_Argument[];

function classNamesCore(...args: classNames_core_Argument[]): string[] {
    return args.reduce<string[]>((acc, arg) => {
        if (typeof arg === "string") {
            acc.push(arg);
        } else if (Array.isArray(arg)) {
            acc.push(...classNamesCore(...arg));
        } else if (typeof arg === "object" && arg !== null) {
            for (const key in arg) {
                if (Object.prototype.hasOwnProperty.call(arg, key) && arg[key]) {
                    acc.push(key);
                }
            }
        }
        return acc;
    }, []);
}


interface ClassNameNativeArgument {
    classNames: classNames_core_Argument;
    styleSheet: Object | StyleSheet.NamedStyles<any>;
    // parentClassNamePath?: string[]; // 可选，用于样式选择
    // parentStyle?: Object; // 可选，用于样式继承
}


function getStyleFromSingleStyleSheet({ classNames, styleSheet }: ClassNameNativeArgument) {
    const classNameList = classNamesCore(classNames);
    return classNameList.reduce((acc: any, className) => {
        const style = (styleSheet as any)[className];
        if (style) {
            for (const key in style) {
                if (Object.prototype.hasOwnProperty.call(style, key)) {
                    acc[key] = style[key];
                }
            }
        } return acc;
    }, {});
}

export function classNameNative(...args: ClassNameNativeArgument[]) {
    return StyleSheet.create(
        args.reduce((acc: any, arg) => {
            const style = getStyleFromSingleStyleSheet(arg);
            return { ...acc, ...style };
        }, {}));
}
