/* eslint-disable react/no-array-index-key */
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import PrismicDOM from 'prismic-dom';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

function getTotalWords(post: Post): number {
  let words = 0;

  for (let idx = 0; idx < post.data.content.length; idx += 1) {
    const el = post.data.content[idx];

    let localWords = el.heading.split(/\s+/);
    words += localWords.length;

    localWords = PrismicDOM.RichText.asText(el.body).split(/\s+/);
    words += localWords.length;
  }

  return words;
}

function getEstimatedReadTime(post: Post): number {
  const meanReadTimePerMinute = 200;
  const totalWords = getTotalWords(post);

  return Math.ceil(totalWords / meanReadTimePerMinute);
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  const date = new Date(post.first_publication_date);
  const formatDate = format(date, 'd MMM yyyy', {
    locale: ptBR,
  });

  const readTime = getEstimatedReadTime(post);

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      <Header />

      <Image
        className={styles.image}
        src={post.data.banner.url}
        alt="logo"
        width={1440}
        height={400}
      />

      <main>
        <h1>{post.data.title}</h1>

        <div>
          <span>
            <FiCalendar /> <p>{formatDate}</p>
          </span>
          <span>
            <FiUser />
            <p>{post.data.author}</p>
          </span>
          <span>
            <FiClock />
            <p>{readTime} min</p>
          </span>
        </div>

        {post.data.content.map((info, idx: number) => {
          return (
            <span key={idx}>
              <h2>{info.heading}</h2>

              {info.body.map((element, idxBody) => (
                <h3 key={idxBody}>{element.text}</h3>
              ))}
            </span>
          );
        })}
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query('', { pageSize: 10 });

  const paths = posts.results.map(doc => {
    return {
      params: {
        slug: doc.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(params.slug), {
    lang: 'pt-br',
  });

  return {
    props: {
      post: response,
    },
  };
};
