export const isYoutubeURL = (url: string): boolean => {
  const condition = new RegExp(
    '^(http(s)?://)?(www.youtube.com|youtu.be|youtube.com)/.+$',
  );

  return condition.test(url);
};

export const getYoutubeIdFromURL = (url: string): string | undefined => {
  if (url.includes('?')) {
    const arr = url.split('?');
    arr.pop();

    url = arr[0];
  }

  const arr = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);

  const youtubeId = undefined !== arr[2] ? arr[2].split(/[^\w-]/i)[0] : arr[0];

  if (youtubeId.includes('https://youtube.com/shorts/')) {
    return youtubeId.replace('https://youtube.com/shorts/', '');
  }

  return youtubeId;
};
