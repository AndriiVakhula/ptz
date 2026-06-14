export interface Entity {
  entityType: string
  id: string | null
  length: number
  offset: number
  value: string | null
}

export interface Message {
  mid: number
  channelId: number
  channelName: string | null
  messageId: number
  messageUrl: string
  extraData: unknown
  type: string
  date: string
  editDate: string | null
  content: string
  contentHash: string
  entities: Entity[] | null
  language: string | null
  replyTo: unknown
  topMessageId: unknown
  fromUserId: number
  fromUserName: string | null
  hasMedia: boolean
  highlights: { content: string[] } | null
}

export interface TeleZipData {
  nextPageToken: string | null
  totalMessages: number
  pageSize: number | null
  messages: Message[]
}
