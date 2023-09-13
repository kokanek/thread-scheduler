export function isTwitterUrl(url) {
  return url.includes('twitter.com');
}

export function extractTweetId(url) {
  const tweetId = url.split('/').pop();
  return tweetId;
}