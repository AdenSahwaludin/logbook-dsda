import { defineEventHandler, setHeader } from 'h3'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/javascript')
  return '// Service Worker disabled in development mode'
})
