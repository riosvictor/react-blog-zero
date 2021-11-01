import { useState } from 'react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { format } from 'date-fns';

import ptBR from 'date-fns/locale/pt-BR';
import { FiUser, FiCalendar } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import Header from '../components/Header';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [hasNextPage, setNextPage] = useState(postsPagination.next_page);

  const router = useRouter();

  const handleLoadMore = async (): Promise<void> => {
    const res = await fetch(postsPagination.next_page);
    const newPosts: PostPagination = await res.json();

    setPosts(oldPosts => oldPosts.concat(newPosts.results));
    setNextPage(newPosts.next_page);
  };

  const navigateToPost = (slug: string): void => {
    router.push(`/post/${slug}`, `/post/${slug}`, {
      shallow: true,
    });
  };

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.mainContainer}>
        {posts.map(post => {
          const date = new Date(post.first_publication_date);
          const formatDate = format(date, 'd MMM yyyy', {
            locale: ptBR,
          });

          return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
              key={post.uid}
              className={styles.post}
              onClick={() => navigateToPost(post.uid)}
            >
              <h1>{post.data.title}</h1>
              <h2>{post.data.subtitle}</h2>

              <div>
                <span>
                  <FiCalendar /> <p>{formatDate}</p>
                </span>
                <span>
                  <FiUser />
                  <p>{post.data.author}</p>
                </span>
              </div>
            </div>
          );
        })}

        {hasNextPage && (
          <button
            type="button"
            className={styles.button}
            onClick={handleLoadMore}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query('', { pageSize: 1 });

  return {
    props: {
      postsPagination: postsResponse,
    },
    revalidate: 10,
  };
};
