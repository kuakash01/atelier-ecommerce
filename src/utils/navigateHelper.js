export const history = {
  push: (url) => {
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  },
  replace: (url) => {
    if (typeof window !== 'undefined') {
      window.location.replace(url);
    }
  },
};

export default history;
