import type { H3Event } from 'h3'

export const getEventContext = (event: H3Event) => {
  return event.context.userSession
}
