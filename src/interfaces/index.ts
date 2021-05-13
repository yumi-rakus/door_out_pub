export interface User {
  userId: string;
  accountId: string;
  name: string;
  userImagePath: string;
  version: number;
  createAt?: string;
  email?: string;
  lastLoginDate?: string;
  bio?: string;
  followerCounts?: number;
  followeeCounts?: number;
  isFollowing?: boolean;
}

export interface ExcludedCoordinate {
  excludedCoordinateId?: string;
  userId?: string;
  placeName: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface PostCoordinate {
  postCoordinateId: string;
  postId: string;
  latitude: number;
  longitude: number;
  roadIndex: null | 0; //nullなら地点投稿、0なら経路投稿
}

export interface SpotPost {
  user: User;
  postType: 1;
  createAt: string;
  postId: string;
  content: string;
  postImagePaths: Array<{
    postImagePath: string;
    postImagePathId: string;
    status: string;
  }>;
  tags: Array<Tag>;
  spotName: string;
  spotCoordinate: { latitude: number; longitude: number };
  isLikedPost: boolean;
  likeCounts: number;
  commentCounts: number;
  roadStartSpotName: null;
  roadEndSpotName: null;
  encodedRoadCoordinate: null;
}

export interface RoadPost {
  user: User;
  postType: 2;
  createAt: string;
  postId: string;
  content: string;
  postImagePaths: Array<{
    postImagePath: string;
    postImagePathId: string;
    status: string;
  }>;
  tags: Array<Tag>;
  roadStartSpotName: string;
  roadEndSpotName: string;
  encodedRoadCoordinate: string;
  isLikedPost: boolean;
  likeCounts: number;
  commentCounts: number;
  spotName: null;
  spotCoordinate: null;
}

export interface Comment {
  parentCommentId: string;
  content: string;
  createAt: string;
  user: {
    userId: string;
    accountId: string;
    name: string;
    userImagePath: string;
  };
  childCommentCounts: number;
  childComments: Array<ChildComment>;
}

export interface ChildComment {
  childCommentId: string;
  content: string;
  createAt: string;
  parentCommentId: string;
  replyUser: {
    userId: string;
    accountId: string;
  };
  user: {
    userId: string;
    accountId: string;
    name: string;
    userImagePath: string;
  };
}

export interface Notification {
  userId: string;
  name: string;
  userImagePath: string;
  noticeType: number;
  noticeId: string;
  postId?: string;
  content?: string;
}

export interface Tag {
  tagId?: string;
  tagName: string;
}

export interface Coordinate {
  lat: number;
  lng: number;
}
