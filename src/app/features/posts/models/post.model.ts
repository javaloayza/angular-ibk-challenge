export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  website?: string;
  address: {
    street: string;
    city: string;
    zipcode?: string;
  };
  company: {
    name: string;
    catchPhrase?: string;
    bs?: string;
  };
}

export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

export interface EnrichedPost {
  id: number;
  title: string;
  body: string;
  userId: number;
  user: User;
  avatar: string;
  postImage?: string;
  hasImage: boolean;
  wordCount?: number;
  readingTime?: number;
}

export interface PostWithComments extends EnrichedPost {
  comments: Comment[];
}
