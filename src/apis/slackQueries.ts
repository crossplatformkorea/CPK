import {Post} from '../types';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

const truncateText = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + '...';
  }
  return text;
};

export const sendSlackNotification = async ({
  post,
  url,
}: {
  post: Post;
  url: string;
}) => {
  const payload = {
    text: `*${truncateText(post.title, 50)}*\n\n${truncateText(post.content, 200)}\n\n<${url}|자세히 보기>`,
  };

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Slack notification failed:', response.statusText);
    } else {
      console.log('Slack notification sent successfully!');
    }
  } catch (error) {
    console.error('Error sending Slack notification:', error);
  }
};
