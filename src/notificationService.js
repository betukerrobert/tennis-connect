import { messaging, getToken, onMessage, VAPID_KEY } from './firebase';
import { supabase } from './supabase';

// Request notification permission and get FCM token
export const requestNotificationPermission = async (userId) => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (token) {
        console.log('FCM Token:', token);
        
        // Save token to Supabase
        const { error } = await supabase
          .from('profiles')
          .update({ fcm_token: token })
          .eq('id', userId);
        
        if (error) {
          console.error('Error saving FCM token:', error);
        } else {
          console.log('FCM token saved to database');
        }
        
        return token;
      }
    } else {
      console.log('Notification permission denied');
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
  
  return null;
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });

// Send push notification via backend (you'll need a cloud function for this)
export const sendPushNotification = async (recipientId, notification) => {
  try {
    // Get recipient's FCM token
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('fcm_token')
      .eq('id', recipientId)
      .single();
    
    if (error || !profile?.fcm_token) {
      console.log('Recipient does not have FCM token');
      return;
    }
    
    // TODO: Call your backend endpoint to send the notification
    // For now, we'll just log it
    console.log('Would send notification:', {
      token: profile.fcm_token,
      notification
    });
    
    // You'll need to set up a backend function (Firebase Cloud Function or your own server)
    // to actually send the notification using Firebase Admin SDK
    
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

// Helper function to send match invite notification
export const sendMatchInviteNotification = async (senderId, receiverId, matchDetails) => {
  const { data: sender } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', senderId)
    .single();
  
  await sendPushNotification(receiverId, {
    title: '🎾 New Match Invite!',
    body: `${sender?.full_name || 'Someone'} invited you to play on ${matchDetails.match_date} at ${matchDetails.match_time}`,
    icon: '/logo192.png',
    data: {
      type: 'match_invite',
      matchId: matchDetails.id
    }
  });
};

// Helper function to send connection request notification
export const sendConnectionRequestNotification = async (senderId, receiverId) => {
  const { data: sender } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', senderId)
    .single();
  
  await sendPushNotification(receiverId, {
    title: '🤝 New Connection Request',
    body: `${sender?.full_name || 'Someone'} wants to connect with you!`,
    icon: '/logo192.png',
    data: {
      type: 'connection_request',
      senderId: senderId
    }
  });
};

// Helper function to send message notification
export const sendMessageNotification = async (senderId, receiverId, messageContent) => {
  const { data: sender } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', senderId)
    .single();
  
  await sendPushNotification(receiverId, {
    title: `💬 ${sender?.full_name || 'Someone'}`,
    body: messageContent.length > 50 ? messageContent.substring(0, 50) + '...' : messageContent,
    icon: '/logo192.png',
    data: {
      type: 'new_message',
      senderId: senderId
    }
  });
};

// Helper function to send match reschedule notification
export const sendRescheduleNotification = async (senderId, receiverId, matchDetails) => {
  const { data: sender } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', senderId)
    .single();
  
  await sendPushNotification(receiverId, {
    title: '📅 Match Reschedule Suggestion',
    body: `${sender?.full_name || 'Someone'} suggested ${matchDetails.suggested_date} at ${matchDetails.suggested_time}`,
    icon: '/logo192.png',
    data: {
      type: 'match_reschedule',
      matchId: matchDetails.id
    }
  });
};
