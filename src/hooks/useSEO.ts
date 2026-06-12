import { useEffect } from 'react';

interface SEOOptions {
  title: string;
  description: string;
  path: string; // e.g. "/", "/install"
}

const BASE = 'https://pdnepal.lovable.app';

const upsertMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

export const useSEO = ({ title, description, path }: SEOOptions) => {
  useEffect(() => {
    const url = `${BASE}${path}`;
    document.title = title;
    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertLink('canonical', url);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  }, [title, description, path]);
};
