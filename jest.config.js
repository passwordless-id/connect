import { TextDecoder } from 'util'

export default {
  testEnvironment: 'jsdom', // 'jsdom', //'node',
  globals: {
    TextDecoder
  }
};