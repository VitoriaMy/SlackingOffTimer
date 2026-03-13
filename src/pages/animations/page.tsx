import { RiveAnimation } from '@/components/riveAnimation';
import styles from './page.module.scss';
import { useState } from 'react';
import { Layout } from '@/components/layout';
// import { Dotlottie } from "./Dotlottie"

export function AnimationsPage() {

    return <Layout
        header={{
            title: '动画演示'
        }}
    >
        <div className={styles.container}>

            {/* <Dotlottie /> */}

            {/* <hr /> */}

            <RiveAnimation />

        </div>

    </Layout>
}