import {SupabaseClient} from '../hooks/useSupabase';

type Notification = {
  title: string;
  body: string;
  data?: Record<string, any>;
  supabase: SupabaseClient;
};

export const sendNotifications = async (
  tokens: string[],
  {title, body, data}: Notification,
) => {
  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
  }));

  // The Expo push notification service only allows 100 messages at a time
  const chunkedMessages = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunkedMessages.push(messages.slice(i, i + 100));
  }

  for (const chunk of chunkedMessages) {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (__DEV__) {
          console.error('Failed to send notifications:', errorData);
        }
      } else {
        const data = await response.json();
        if (__DEV__) console.log('Notifications sent successfully:', data);
      }
    } catch (error) {
      if (__DEV__) console.error('Error sending notifications:', error);
    }
  }
};

export const sendNotificationsToAllUsers = async ({
  title,
  body,
  data,
  supabase,
}: Notification) => {
  async function getAllPushTokens() {
    const {data, error} = await supabase.from('push_tokens').select('token');

    if (error) {
      if (__DEV__) {
        console.error('Error fetching push tokens:', error);
      }

      return [];
    }

    return data.map((tokenRecord) => tokenRecord.token);
  }

  const tokens = await getAllPushTokens();

  if (!!tokens.length) {
    await sendNotifications(tokens, {
      body,
      title,
      data,
      supabase,
    });
  }
};

export const sendNotificationsToPostUsers = async ({
  postId,
  title = '',
  body,
  data,
  supabase,
}: {
  postId: string;
  body: string;
  title?: string;
  data?: Record<string, unknown>;
  supabase: SupabaseClient;
}) => {
  // Function to fetch push tokens of the post author, likers, and commenters
  async function getPostRelatedUserIdsAndPushTokens() {
    // Fetch user_ids related to the post (author, likers, and commenters)
    const postDetails = await supabase
      .from('posts')
      .select('user_id, likes(user_id), replies(user_id)')
      .eq('id', postId)
      .single();

    if (postDetails.error) {
      if (__DEV__) {
        console.error('Error fetching post details:', postDetails.error);
      }
      return {userIds: [], tokens: []};
    }

    // Collect user_ids of the post author, likers, and commenters
    const userIds = new Set<string>();

    // Add the author’s user_id
    if (postDetails.data?.user_id) {
      userIds.add(postDetails.data.user_id);
    }

    // Add user_ids of the users who liked the post
    postDetails.data?.likes.forEach((like) => {
      if (like.user_id) {
        userIds.add(like.user_id);
      }
    });

    // Add user_ids of the users who commented on the post
    postDetails.data?.replies.forEach((reply) => {
      if (reply.user_id) {
        userIds.add(reply.user_id);
      }
    });

    // Fetch push tokens for all relevant users
    const {data, error} = await supabase
      .from('push_tokens')
      .select('token')
      .in('user_id', Array.from(userIds));

    if (error) {
      if (__DEV__) {
        console.error('Error fetching push tokens:', error);
      }
      return {userIds: Array.from(userIds), tokens: []};
    }

    // Return both userIds and tokens
    return {
      userIds: Array.from(userIds),
      tokens: data.map((tokenRecord) => tokenRecord.token),
    };
  }

  // Fetch userIds and push tokens related to the post
  const {userIds, tokens} = await getPostRelatedUserIdsAndPushTokens();

  // If there are any tokens, send notifications
  if (tokens.length > 0) {
    await sendNotifications(tokens, {
      supabase,
      body,
      title,
      data,
    });
  }

  // Return the userIds
  return userIds;
};
