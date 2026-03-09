import { Link } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import styles from "./index.module.scss";
import classNames from "classnames";

interface NavProps {
    children: React.ReactNode;
    to: string;
}

interface LayoutProps {
    children: React.ReactNode;
    header?: {
        left?: NavProps;
        title?: React.ReactNode;
        right?: NavProps;
    }
}


export function Layout({ children,
    header: {
        left,
        title,
        right,
    } = {}
}: LayoutProps) {

    return <div className={styles.page}>
        <div className={styles.header}>
            {
                <Link to={left?.to || "/"} className={classNames(styles.navLink, styles.headerLeft)}>{left?.children || <ArrowLeftOutlined />}</Link>
            }
            <div className={styles.headerTitle}>
                {title}
            </div>
            {right ? <Link to={right.to} className={classNames(styles.navLink, styles.headerRight)}>{right.children}</Link> : null}
        </div>
        <div className={styles.content}>
            {children}
        </div>
    </div>

}