export type ISODateTimeString = string

export type Topic = {
  id: string
  title: string
  body: string
  createdAt: ISODateTimeString
}

export type Comment = {
  id: string
  topicId: string
  body: string
  createdAt: ISODateTimeString
}

export type Opinion = {
  id: string
  body: string
  createdAt: ISODateTimeString
}

export type TopicListItem = Topic & {
  commentCount: number
}

export type TopicDetail = Topic & {
  comments: Comment[]
}

export type CreateTopicInput = {
  title: string
  body: string
}

export type CreateCommentInput = {
  body: string
}

export type CreateOpinionInput = {
  body: string
}

export type AdminLoginInput = {
  token: string
}

