import Link from 'next/link';
import Image from 'next/image';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <Link href="/">
        <a>
          <Image
            className={styles.logo}
            src="/Logo.png"
            alt="logo"
            width={238}
            height={25}
          />
        </a>
      </Link>
    </header>
  );
}
