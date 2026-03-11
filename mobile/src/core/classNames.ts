/** 通过 StyleSheet 管理样式，提供 classNames 方法来生成最终的样式对象
 *  支持嵌套样式和条件样式，类似于 CSS 中的 classNames 功能
 *  样式分为可继承的样式和不可继承的样式，子样式会继承父样式的属性，除非子样式中有同名属性覆盖父样式
 */

/** 示例：创建一个 StyleSheetManager 实例
 * 
 *   const styleSheet = new StyleSheetManager({
 *       container: {
 *           backgroundColor: 'white',
 *           list: {
 *               display: 'flex',
 *               flexDirection: 'row',
 *               gap: 10,
 *               item: {
 *                   padding: 10,
 *                   borderRadius: 5,
 *                   backgroundColor: 'gray',
 *               }
 *           }
 *       }
 *   });
 */

/** 使用 classNames 方法获取样式对象
 *  单个类名选择器会返回对应的样式对象
 *  styleSheet.classNames('container') === {
 *     backgroundColor: 'white',
 *     color: 'black',
 *  } 
 * 多级选择器会将子级样式会继承父级样式中可继承部分，子级样式会覆盖父级样式中同名的属性
 * styleSheet.classNames('container list') === {
 *   color: 'black',
 *   display: 'flex',
 *   flexDirection: 'row',
 *   gap: 10,
 *   fontSize: 14,
 * }
 * styleSheet.classNames('container list item') === {
 *   color: 'black',
 *   fontSize: 14,
 *   padding: 10,
 *   borderRadius: 5,
 *   backgroundColor: 'gray',
 * 
 * 
 * 
 */

 
 

 






interface simpleStyle {
    [key: string]: string | number;
}
interface StyleSheet {
    [key: string]: string | number | simpleStyle | StyleSheet;
}

type classNameItem = string | classNameItem[] | { [key: string]: boolean };


class StyleSheetManager {
    styleSheet: StyleSheet;
    constructor(styleSheet: StyleSheet) {
        this.styleSheet = styleSheet;
    }
    classNames(...args: classNameItem[]): {
    }

}